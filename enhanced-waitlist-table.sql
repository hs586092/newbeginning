-- 🚀 Enhanced Waitlist Table for Growth Hacking
-- Analytics, Referrals, A/B Testing 포함

DROP TABLE IF EXISTS waitlist CASCADE;

-- Main waitlist table
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Source tracking for growth analytics
  source VARCHAR(50) DEFAULT 'landing_page',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),

  -- Technical tracking
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,

  -- User verification
  verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(100),
  verification_sent_at TIMESTAMP WITH TIME ZONE,

  -- Subscription management
  subscribed BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,

  -- Referral system for viral growth
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES waitlist(id),
  referral_count INTEGER DEFAULT 0,

  -- A/B Testing
  variant VARCHAR(50) DEFAULT 'control',

  -- Demographics (optional)
  pregnancy_stage VARCHAR(50), -- pregnant, 0-3months, 3-6months, etc
  region VARCHAR(100),

  -- Engagement tracking
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  click_count INTEGER DEFAULT 0,
  email_opens INTEGER DEFAULT 0
);

-- Performance indexes
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_source ON waitlist(source);
CREATE INDEX idx_waitlist_utm_source ON waitlist(utm_source);
CREATE INDEX idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX idx_waitlist_referred_by ON waitlist(referred_by);

-- RLS (Row Level Security)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Public policies - anyone can join
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read own record by email" ON waitlist
  FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Admin policies
CREATE POLICY "Service role full access" ON waitlist
  FOR ALL USING (auth.role() = 'service_role');

-- Growth Analytics Views
CREATE OR REPLACE VIEW waitlist_growth_stats AS
SELECT
  -- Total metrics
  COUNT(*) as total_signups,
  COUNT(DISTINCT DATE(created_at)) as days_active,

  -- Recent activity
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30days,

  -- Growth rate
  ROUND(
    (COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::numeric /
     NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '14 days' AND created_at <= NOW() - INTERVAL '7 days'), 0) - 1) * 100,
    2
  ) as weekly_growth_rate,

  -- Referral metrics
  COUNT(*) FILTER (WHERE referred_by IS NOT NULL) as referred_signups,
  ROUND(COUNT(*) FILTER (WHERE referred_by IS NOT NULL)::numeric / COUNT(*) * 100, 2) as referral_rate,

  -- Source breakdown
  COUNT(*) FILTER (WHERE source = 'landing_page') as from_landing,
  COUNT(*) FILTER (WHERE source = 'social_share') as from_social,
  COUNT(*) FILTER (WHERE source = 'referral') as from_referral,

  -- Engagement
  ROUND(AVG(click_count), 2) as avg_clicks,
  ROUND(AVG(email_opens), 2) as avg_opens
FROM waitlist;

-- Hourly signups for charts
CREATE OR REPLACE VIEW waitlist_hourly_stats AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as signups,
  COUNT(DISTINCT source) as unique_sources
FROM waitlist
WHERE created_at >= NOW() - INTERVAL '48 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Top referrers
CREATE OR REPLACE VIEW waitlist_top_referrers AS
SELECT
  u1.email as referrer_email,
  u1.referral_code,
  COUNT(u2.id) as total_referred,
  ARRAY_AGG(u2.email ORDER BY u2.created_at DESC) as referred_emails,
  MAX(u2.created_at) as last_referral_at
FROM waitlist u1
LEFT JOIN waitlist u2 ON u1.id = u2.referred_by
WHERE u1.referral_code IS NOT NULL
GROUP BY u1.id, u1.email, u1.referral_code
HAVING COUNT(u2.id) > 0
ORDER BY COUNT(u2.id) DESC
LIMIT 20;

-- A/B Test Results
CREATE OR REPLACE VIEW waitlist_ab_results AS
SELECT
  variant,
  COUNT(*) as signups,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage,
  ROUND(AVG(click_count), 2) as avg_clicks,
  ROUND(COUNT(*) FILTER (WHERE email_opens > 0)::numeric / COUNT(*) * 100, 2) as open_rate
FROM waitlist
GROUP BY variant
ORDER BY signups DESC;

-- Trigger for auto-generating referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'MOM' || UPPER(SUBSTRING(MD5(NEW.email) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Trigger for updating referral counts
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE waitlist
    SET referral_count = referral_count + 1
    WHERE id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_referral_count
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_count();

-- Test data insertion function
CREATE OR REPLACE FUNCTION insert_test_waitlist_entry(
  test_email TEXT DEFAULT 'test@example.com'
) RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  referral_code TEXT
) AS $$
DECLARE
  result_code TEXT;
BEGIN
  INSERT INTO waitlist (email, source)
  VALUES (test_email, 'test')
  RETURNING waitlist.referral_code INTO result_code;

  RETURN QUERY SELECT true, 'Test entry created successfully', result_code;

EXCEPTION WHEN unique_violation THEN
  RETURN QUERY SELECT false, 'Email already exists', NULL::TEXT;
WHEN OTHERS THEN
  RETURN QUERY SELECT false, SQLERRM, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON waitlist_growth_stats TO authenticated, anon;
GRANT SELECT ON waitlist_hourly_stats TO authenticated, anon;
GRANT SELECT ON waitlist_ab_results TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Success message
SELECT 'Enhanced waitlist table created successfully! Ready for growth hacking.' as status;