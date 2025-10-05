-- Add source_url column to hospital_reviews table
ALTER TABLE hospital_reviews
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add comment
COMMENT ON COLUMN hospital_reviews.source_url IS '리뷰 출처 URL (블로그/카페)';
