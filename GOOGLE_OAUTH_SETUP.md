# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트를 선택하거나 새로 생성
3. **API 및 서비스** > **OAuth 동의 화면** 이동
4. 외부 사용자 유형 선택 후 다음 정보 입력:
   - **앱 이름**: 앱 이름
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처 정보**: 본인 이메일

5. **API 및 서비스** > **사용자 인증 정보** 이동
6. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
7. 애플리케이션 유형을 **웹 애플리케이션**으로 선택
8. 다음 URI들을 추가:
   - **승인된 자바스크립트 원본**: `http://localhost:3000` (개발환경)
   - **승인된 리디렉션 URI**: `http://localhost:3000/auth/callback`

## 2. Supabase 설정

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 > **Authentication** > **Providers** 이동
3. **Google** 제공업체 활성화
4. Google Cloud Console에서 받은 정보 입력:
   - **Client ID**: Google OAuth 클라이언트 ID
   - **Client Secret**: Google OAuth 클라이언트 시크릿

## 3. 환경변수 설정

`.env.local` 파일을 생성하고 다음 정보를 입력:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth (Supabase에서 처리하므로 클라이언트 ID만 필요)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 4. 데이터베이스 마이그레이션

Supabase SQL 에디터에서 다음 쿼리 실행 (profiles 테이블에 full_name 컬럼이 없는 경우):

```sql
ALTER TABLE public.profiles
ADD COLUMN full_name TEXT;
```

## 5. 테스트

1. 개발 서버 실행: `npm run dev`
2. `http://localhost:3000/login` 접속
3. "Google로 로그인" 버튼 클릭
4. Google 계정으로 로그인 테스트

## 프로덕션 배포시 추가 설정

1. **Google Cloud Console**에서 프로덕션 도메인 추가:
   - 승인된 자바스크립트 원본에 프로덕션 도메인 추가
   - 승인된 리디렉션 URI에 `https://your-domain.com/auth/callback` 추가

2. **환경변수 업데이트**:
   - `NEXT_PUBLIC_SITE_URL`을 프로덕션 도메인으로 변경

## 주요 특징

- ✅ Google 계정으로 간편 로그인/회원가입
- ✅ 자동 프로필 생성 (이름, 프로필 사진 포함)
- ✅ 기존 이메일/비밀번호 로그인과 공존
- ✅ 안전한 OAuth 2.0 플로우
- ✅ Supabase 인증 시스템과 완전 통합