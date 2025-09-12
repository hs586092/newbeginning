# OAuth 디버깅 가이드

## 📋 확인 체크리스트

### 1. Supabase 대시보드에서 확인 필요:
- Authentication > Settings > Auth Providers
- Google OAuth 설정 여부
- Kakao OAuth 설정 여부 
- Site URL 설정: `http://localhost:3000`
- Additional URLs: `https://newbeginning-seven.vercel.app`

### 2. 각 OAuth 제공업체 설정 확인:

#### Google Cloud Console:
1. https://console.cloud.google.com/ 접속
2. APIs & Services > Credentials
3. OAuth 2.0 Client IDs 생성
4. Authorized redirect URIs:
   - `https://spgcihtrquywmaieflue.supabase.co/auth/v1/callback`
5. Client ID와 Client Secret을 Supabase에 입력

#### Kakao Developers:
1. https://developers.kakao.com/ 접속  
2. 앱 생성/선택
3. 플랫폼 > Web > 사이트 도메인:
   - `http://localhost:3000`
   - `https://newbeginning-seven.vercel.app`
4. 카카오 로그인 > Redirect URI:
   - `https://spgcihtrquywmaieflue.supabase.co/auth/v1/callback`
5. REST API 키를 Supabase에 입력

### 3. 디버깅 단계:
1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. 콘솔 에러 메시지 확인
3. OAuth 요청 URL과 응답 분석

## 🚨 현재 상태
- ✅ Supabase 연결 정상
- ✅ 환경변수 설정 완료  
- ✅ 콜백 핸들러 구현됨
- ❓ OAuth 제공업체 설정 확인 필요