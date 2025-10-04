# Supabase 테이블 생성 가이드

## 1단계: Supabase SQL Editor 열기

👉 https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor/sql

## 2단계: 새 쿼리 생성

1. **"New query"** 버튼 클릭
2. 또는 **"+"** 버튼 클릭

## 3단계: SQL 복사 & 실행

아래 SQL을 **전체 복사**해서 SQL Editor에 붙여넣고 **"Run"** 클릭:

```sql
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
```

## 4단계: 확인

SQL 실행 후:
1. 왼쪽 메뉴 **"Table Editor"** 클릭
2. **"hospitals"** 테이블이 보이는지 확인
3. 컬럼 확인: id, name, address, lat, lng, rating 등

## 5단계: 거리 계산 함수 추가 (필수!)

병원 데이터가 저장되어도 거리 계산 함수가 없으면 웹사이트에서 데이터를 불러올 수 없습니다.

### 방법 1: Supabase Dashboard에서 실행 (추천)

1. **https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor/sql** 접속
2. **"New query"** 클릭
3. **`supabase/migrations/add-hospital-functions.sql`** 파일 내용을 복사해서 붙여넣기
4. **"Run"** 클릭

### 방법 2: psql을 통한 실행

```bash
PGPASSWORD='mJCu4eO#21xhz#Zn' psql -h aws-0-ap-northeast-2.pooler.supabase.com -p 5432 -U postgres.gwqvqncgveqenzymwlmy -d postgres -f supabase/migrations/add-hospital-functions.sql
```

### 확인

터미널에서 테스트 실행:

```bash
npx tsx scripts/test-hospital-data.ts
```

결과에서 다음이 나타나면 성공:
```
✅ 강남역 2km 반경 내 병원: XX개
```

---

## 6단계: 웹사이트 확인

https://fortheorlingas.com/hospital 접속하여 실제 병원 데이터가 표시되는지 확인

---

## 문제 해결

### "Success. No rows returned" 메시지
- ✅ 정상입니다! 테이블/함수가 성공적으로 생성되었습니다.

### "relation already exists" 에러
- ✅ 이미 테이블이 존재합니다. 무시하고 진행하세요.

### "Could not find the function get_nearby_hospitals" 에러
- ❌ 5단계의 거리 계산 함수를 추가하지 않았습니다. `add-hospital-functions.sql` 실행 필요

### 권한 에러
- ❌ Service Role Key가 올바른지 확인하세요.
