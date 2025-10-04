# 네이버 지도 API 연동 가이드

## 1. 네이버 클라우드 플랫폼 가입 및 API 신청

### 단계별 가이드

#### 1단계: 네이버 클라우드 플랫폼 가입
1. https://www.ncloud.com/ 접속
2. 회원가입 (개인/사업자 선택)
3. 본인 인증 및 결제 수단 등록

#### 2단계: 애플리케이션 등록
1. 콘솔 접속: https://console.ncloud.com/
2. **Services > AI·NAVER API > Application** 메뉴
3. **Application 등록** 버튼 클릭
4. 정보 입력:
   - **Application 이름**: "우리동네 육아병원"
   - **Service 선택**:
     - ✅ Maps (네이버 지도)
     - ✅ Search (네이버 검색)
   - **서비스 환경 등록**:
     - Web Service URL: `https://fortheorlingas.com`
     - iOS Bundle ID: (나중에)
     - Android Package Name: (나중에)

#### 3단계: 인증 정보 확인
1. 등록된 Application 클릭
2. **인증 정보** 탭에서:
   - **Client ID** 복사
   - **Client Secret** 복사

#### 4단계: .env.local에 추가
```bash
# 네이버 클라우드 플랫폼 API
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

## 2. Supabase 데이터베이스 설정

### 마이그레이션 실행

```bash
# 1. Supabase 프로젝트에 SQL 실행
# Supabase Dashboard → SQL Editor → New Query

# 2. 파일 내용 복사 붙여넣기
cat supabase/migrations/create_hospitals_table.sql

# 3. Run 버튼 클릭
```

또는 CLI 사용:
```bash
# Supabase CLI 설치 (맥)
brew install supabase/tap/supabase

# 로그인
supabase login

# 마이그레이션 실행
supabase db push
```

## 3. 병원 데이터 크롤링

### 크롤링 스크립트 실행

```bash
# 1. axios 설치
npm install axios

# 2. ts-node 설치 (없으면)
npm install -g ts-node

# 3. 크롤링 실행
ts-node scripts/naver-hospital-crawler.ts
```

### 예상 결과
- 서울 25개 구 × 2개 검색어 (소아과, 소아청소년과)
- 총 **200-500개** 병원 데이터 수집
- 시간: 약 5-10분 소요

## 4. API 사용량 및 요금

### Maps API (네이버 지도)
- **무료**: 월 100,000건
- **과금**: 100,000건 초과 시 1,000건당 200원

### Search API (네이버 검색)
- **무료**: 일 25,000건
- **과금**: 25,000건 초과 시 1,000건당 20원

### 예상 비용
- **초기 크롤링**: 무료 (1회 500건 이내)
- **일일 트래픽 1,000명**: 무료 (월 30,000건)
- **일일 트래픽 10,000명**: 월 약 20,000원

## 5. 리뷰 AI 요약 설정 (추후)

### OpenAI API 사용
```bash
# .env.local에 추가
OPENAI_API_KEY=your_openai_key
```

### Supabase Edge Function 작성
```typescript
// supabase/functions/analyze-reviews/index.ts
import { OpenAI } from 'openai'

// 리뷰 분석 로직
// 장점/단점 자동 추출
// 감정 분석 (긍정/부정)
```

## 6. 배포 후 확인사항

### 체크리스트
- [ ] 네이버 API 키 발급 완료
- [ ] .env.local 설정 완료
- [ ] Supabase 테이블 생성 완료
- [ ] 병원 데이터 크롤링 완료
- [ ] 프론트엔드 연동 테스트
- [ ] 실제 위치 기반 검색 테스트
- [ ] API 사용량 모니터링 설정

## 7. 트러블슈팅

### API 호출 에러
```
Error: Invalid Client ID
```
→ .env.local의 NAVER_CLIENT_ID 확인

### 좌표 변환 이슈
```
Error: Invalid coordinates
```
→ EPSG:3857 → WGS84 변환 함수 확인

### 데이터베이스 연결 실패
```
Error: Connection timeout
```
→ Supabase 프로젝트 상태 확인
→ SUPABASE_SERVICE_ROLE_KEY 확인

## 8. 다음 단계

1. **리뷰 크롤링**: 각 병원의 네이버 리뷰 수집
2. **AI 분석**: OpenAI로 리뷰 요약 및 장단점 추출
3. **실시간 업데이트**: 매일 새 리뷰 수집 및 분석
4. **사용자 리뷰**: 우리 사이트 자체 리뷰 기능 추가
