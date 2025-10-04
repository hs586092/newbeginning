-- 병원 정보 테이블
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  naver_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  road_address TEXT,
  phone TEXT,
  category TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  opening_hours JSONB,
  features TEXT[],
  description TEXT,
  website TEXT,
  images TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 리뷰 테이블
CREATE TABLE IF NOT EXISTS hospital_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  naver_review_id TEXT,
  author_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  visit_date DATE,
  images TEXT[],
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(naver_review_id)
);

-- AI 리뷰 요약 테이블
CREATE TABLE IF NOT EXISTS hospital_review_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  keywords JSONB,
  last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hospitals_category ON hospitals(category);
CREATE INDEX IF NOT EXISTS idx_hospitals_rating ON hospitals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hospitals_lat_lng ON hospitals(lat, lng);
CREATE INDEX IF NOT EXISTS idx_hospital_reviews_hospital_id ON hospital_reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_reviews_rating ON hospital_reviews(rating DESC);

-- 거리 계산 함수
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  earth_radius DOUBLE PRECISION := 6371;
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 주변 병원 검색 함수
CREATE OR REPLACE FUNCTION get_nearby_hospitals(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5.0,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  naver_id TEXT,
  name TEXT,
  address TEXT,
  phone TEXT,
  category TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  rating DECIMAL,
  review_count INTEGER,
  opening_hours JSONB,
  features TEXT[],
  description TEXT,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.naver_id,
    h.name,
    h.address,
    h.phone,
    h.category,
    h.lat,
    h.lng,
    h.rating,
    h.review_count,
    h.opening_hours,
    h.features,
    h.description,
    calculate_distance(user_lat, user_lng, h.lat, h.lng) as distance
  FROM hospitals h
  WHERE
    (category_filter IS NULL OR h.category = category_filter)
    AND calculate_distance(user_lat, user_lng, h.lat, h.lng) <= radius_km
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;
