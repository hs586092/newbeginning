# 네이버 블로그 리뷰 수집 가이드

## ⚠️ 중요 변경사항

**네이버 지도 앱 내부 리뷰는 공식 API로 제공되지 않으며, 웹 스크래핑은 로그인이 필요하여 자동화가 어렵습니다.**

대신 **네이버 검색 API**를 사용하여 블로그/카페 리뷰를 수집합니다.

## 📋 준비사항

### 1. 데이터베이스 테이블 생성

Supabase Dashboard에서 SQL 실행:

```bash
# Supabase SQL Editor에서 실행
https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor/sql
```

아래 파일들의 내용을 복사하여 순서대로 실행:
1. `supabase/migrations/create_reviews_table.sql`
2. `supabase/migrations/add_source_url.sql`

### 2. 네이버 API 키 확인

`.env.local` 파일에 네이버 API 키가 있는지 확인:

```bash
NAVER_CLIENT_ID=your-client-id
NAVER_CLIENT_SECRET=your-client-secret
```

네이버 개발자센터에서 발급: https://developers.naver.com/apps/#/list

## 🚀 리뷰 수집 실행

### 자동 수집 (추천)

```bash
npx tsx scripts/crawl-with-api.ts
```

**동작:**
- Supabase의 병원 목록 자동 조회 (5개 테스트)
- 각 병원명으로 네이버 블로그 검색 API 호출
- 블로그 리뷰를 병원 리뷰 형식으로 변환
- Supabase `hospital_reviews` 테이블에 자동 저장

**장점:**
- ✅ 공식 API 사용으로 안정적
- ✅ 로그인 불필요
- ✅ 빠른 실행 속도
- ✅ 네이버 차단 걱정 없음
- ✅ 리뷰 출처 URL 포함

**수집되는 데이터:**
- 블로그 제목 + 본문 내용
- 작성자 (블로거 이름)
- 추정 별점 (긍정/부정 키워드 분석)
- 작성 날짜
- 원본 블로그 URL

### 방법 2: 특정 병원만 크롤링

스크립트를 수정하여 특정 병원만 선택:

```typescript
// 42번 라인 수정
.limit(5) // 테스트로 5개만
→
.eq('name', '무지개의원') // 특정 병원만
```

## 📊 크롤링된 데이터 확인

### Supabase에서 확인

```sql
-- 수집된 리뷰 개수
SELECT hospital_id, COUNT(*) as review_count
FROM hospital_reviews
GROUP BY hospital_id
ORDER BY review_count DESC;

-- 특정 병원의 리뷰
SELECT h.name, r.author, r.rating, r.content, r.review_date
FROM hospital_reviews r
JOIN hospitals h ON r.hospital_id = h.id
WHERE h.name = '무지개의원'
ORDER BY r.created_at DESC;
```

### 웹사이트에서 확인

리뷰가 수집되면 자동으로 병원 카드에 표시됩니다.

## 🤖 AI 리뷰 요약 생성 (선택사항)

OpenAI API를 사용하여 리뷰를 분석하고 요약할 수 있습니다:

### 1. OpenAI API 키 설정

```bash
# .env.local에 추가
OPENAI_API_KEY=your-api-key-here
```

### 2. AI 요약 스크립트 실행

```bash
npx tsx scripts/generate-ai-summaries.ts
```

**동작:**
- 각 병원의 리뷰를 OpenAI로 분석
- 장점/단점 자동 추출
- 감성 분석 (positive/neutral/negative)
- `hospital_review_summaries` 테이블에 저장

## 🔄 자동 업데이트 설정

### GitHub Actions으로 일일 자동 크롤링

`.github/workflows/crawl-reviews.yml` 파일 생성:

```yaml
name: Daily Review Crawling

on:
  schedule:
    - cron: '0 0 * * *' # 매일 자정
  workflow_dispatch: # 수동 실행 가능

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install chromium
      - run: npx tsx scripts/crawl-naver-reviews.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## ⚠️ 주의사항

### 법적 고려사항

1. **저작권**: 리뷰는 작성자의 저작물입니다
   - 원본 리뷰 링크를 함께 제공하세요
   - 상업적 이용 시 법적 검토 필요

2. **robots.txt**: 네이버 지도의 크롤링 정책 확인
   - 개인 프로젝트/비상업적 용도 권장
   - 과도한 요청은 IP 차단될 수 있음

3. **개인정보**: 리뷰 작성자 이름 처리
   - 일부 익명화 고려 (예: "김**")
   - 개인정보 보호법 준수

### 기술적 제한사항

1. **속도 제한**: 병원당 5초 대기 필수
2. **리뷰 개수**: 병원당 최대 20개 (조절 가능)
3. **네이버 구조 변경**: UI 변경 시 스크립트 수정 필요

## 🔧 문제 해결

### "검색 결과를 찾을 수 없습니다"

- 병원 이름이 정확한지 확인
- 네이버 지도에서 직접 검색해보기
- 병원 이름 변형 시도 (예: "의원" 추가/제거)

### "리뷰 탭을 찾을 수 없습니다"

- 해당 병원에 리뷰가 없을 수 있음
- 네이버 지도 UI 변경 가능성

### 중복 리뷰 저장

- UNIQUE 제약조건으로 자동 방지됨
- hospital_id + author + content 조합으로 중복 체크

## 📈 다음 단계

1. ✅ 리뷰 크롤링 완료
2. ⏭️ AI 요약 생성 (OpenAI)
3. ⏭️ 실시간 리뷰 알림
4. ⏭️ 리뷰 감성 분석 대시보드
5. ⏭️ 사용자 리뷰 작성 기능

## 📞 도움말

문제가 발생하면:
1. 브라우저 콘솔 확인 (headless: false)
2. Supabase 로그 확인
3. 네이버 지도 UI 변경 여부 확인
