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
