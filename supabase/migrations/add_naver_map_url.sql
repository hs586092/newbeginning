-- Add naver_map_url column to hospital_review_summaries table
ALTER TABLE hospital_review_summaries
ADD COLUMN IF NOT EXISTS naver_map_url TEXT;

COMMENT ON COLUMN hospital_review_summaries.naver_map_url IS '네이버 지도 상세 페이지 URL';
