-- 병원 리뷰 테이블
CREATE TABLE IF NOT EXISTS hospital_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  review_date TEXT,
  source_url TEXT, -- 리뷰 출처 URL (블로그/카페)
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, author, content) -- 중복 방지
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hospital_reviews_hospital_id ON hospital_reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_reviews_rating ON hospital_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hospital_reviews_created_at ON hospital_reviews(created_at DESC);

-- AI 리뷰 요약 테이블 (이미 있다면 스킵)
CREATE TABLE IF NOT EXISTS hospital_review_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  pros TEXT[] NOT NULL,
  cons TEXT[] NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 리뷰 집계 함수
CREATE OR REPLACE FUNCTION update_review_summary(target_hospital_id UUID)
RETURNS VOID AS $$
DECLARE
  review_count INTEGER;
  avg_rating DECIMAL(2,1);
BEGIN
  -- 리뷰 개수와 평균 평점 계산
  SELECT COUNT(*), ROUND(AVG(rating), 1)
  INTO review_count, avg_rating
  FROM hospital_reviews
  WHERE hospital_id = target_hospital_id;

  -- 요약 테이블 업데이트 (실제 AI 요약은 별도 스크립트에서)
  INSERT INTO hospital_review_summaries (hospital_id, summary, pros, cons, sentiment, total_reviews, average_rating)
  VALUES (
    target_hospital_id,
    '리뷰 ' || review_count || '개 기준 평균 ' || avg_rating || '점',
    ARRAY['친절한 상담', '깨끗한 시설'],
    ARRAY['대기시간'],
    CASE WHEN avg_rating >= 4 THEN 'positive' WHEN avg_rating >= 3 THEN 'neutral' ELSE 'negative' END,
    review_count,
    avg_rating
  )
  ON CONFLICT (hospital_id) DO UPDATE
  SET total_reviews = review_count,
      average_rating = avg_rating,
      last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
