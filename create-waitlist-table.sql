-- 이메일 수집용 waitlist 테이블
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'homepage',
  subscribed BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 이메일 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at);

-- RLS 정책 (공개 삽입 허용, 조회는 제한)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 삽입 정책: 모든 사용자가 이메일 추가 가능
CREATE POLICY "Anyone can insert to waitlist"
ON waitlist
FOR INSERT
WITH CHECK (true);

-- 조회 정책: 관리자만 조회 가능 (나중에 admin 역할 추가 시)
CREATE POLICY "Only admins can read waitlist"
ON waitlist
FOR SELECT
USING (false);  -- 임시로 모든 조회 차단

-- 이메일 검증 함수
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 이메일 삽입 전 검증 트리거
CREATE OR REPLACE FUNCTION validate_waitlist_email()
RETURNS TRIGGER AS $$
BEGIN
  -- 이메일 형식 검증
  IF NOT is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- 이메일 소문자 변환
  NEW.email = LOWER(TRIM(NEW.email));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_waitlist_email_trigger
  BEFORE INSERT OR UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION validate_waitlist_email();

-- 통계 뷰 (관리자용)
CREATE OR REPLACE VIEW waitlist_stats AS
SELECT
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as weekly_subscribers,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as daily_subscribers,
  DATE_TRUNC('day', created_at) as signup_date,
  COUNT(*) as daily_count
FROM waitlist
WHERE subscribed = true
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC;