'use client'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              쿠키 정책
            </h1>
            <p className="text-gray-600">
              첫돌까지 서비스의 쿠키 사용에 관한 정책
            </p>
            <p className="text-sm text-gray-500 mt-2">
              최종 수정일: 2024년 1월 1일
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. 쿠키란 무엇인가요?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                쿠키(Cookie)는 웹사이트가 사용자의 브라우저에 저장하는 작은 데이터 파일입니다.
                이러한 파일은 사용자가 웹사이트를 재방문할 때 사용자의 기기를 인식하는 데 사용됩니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                쿠키를 통해 우리는 사용자의 선호도를 기억하고, 로그인 상태를 유지하며,
                더 나은 사용자 경험을 제공할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. 첫돌까지에서 사용하는 쿠키 유형
              </h2>

              <div className="space-y-6">
                <div className="border-l-4 border-pink-400 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">필수 쿠키</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    웹사이트 운영에 반드시 필요한 쿠키입니다.
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 로그인 세션 유지</li>
                    <li>• 보안 토큰 관리</li>
                    <li>• 언어 및 지역 설정</li>
                    <li>• 장바구니 기능 (해당시)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">기능성 쿠키</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    사용자 경험을 향상시키기 위한 쿠키입니다.
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 사용자 선호 설정 저장</li>
                    <li>• 폰트 크기, 테마 설정</li>
                    <li>• 최근 검색어 저장</li>
                    <li>• 맞춤 콘텐츠 제공</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-400 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">분석 쿠키</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    웹사이트 사용 패턴 분석을 위한 쿠키입니다.
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 페이지 방문 통계</li>
                    <li>• 사용자 행동 분석</li>
                    <li>• 서비스 개선을 위한 데이터 수집</li>
                    <li>• Google Analytics (익명화된 데이터)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-400 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">마케팅 쿠키</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    맞춤형 광고 제공을 위한 쿠키입니다.
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 관심사 기반 콘텐츠 추천</li>
                    <li>• 소셜 미디어 연동</li>
                    <li>• 맞춤형 알림 설정</li>
                    <li>• 제휴 서비스 연동</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. 제3자 쿠키
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                첫돌까지는 서비스 품질 향상을 위해 다음과 같은 제3자 서비스를 이용합니다:
              </p>
              <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
                <li><strong>Google Analytics:</strong> 웹사이트 사용 통계 분석</li>
                <li><strong>Google Fonts:</strong> 웹 폰트 제공</li>
                <li><strong>소셜 로그인:</strong> 구글, 카카오 로그인 서비스</li>
                <li><strong>Supabase:</strong> 데이터베이스 및 인증 서비스</li>
                <li><strong>Vercel:</strong> 호스팅 및 성능 모니터링</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. 쿠키 관리 방법
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">브라우저 설정을 통한 관리</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    대부분의 브라우저에서는 쿠키를 관리할 수 있는 설정을 제공합니다:
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4">
                    <li>• 모든 쿠키 허용</li>
                    <li>• 특정 쿠키만 허용</li>
                    <li>• 모든 쿠키 차단</li>
                    <li>• 기존 쿠키 삭제</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
                  <p className="text-yellow-700 text-sm">
                    쿠키를 차단할 경우 일부 기능(로그인, 개인 설정 등)이 정상적으로 작동하지 않을 수 있습니다.
                    필수 쿠키는 서비스 이용을 위해 반드시 필요합니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. 주요 브라우저별 쿠키 설정 방법
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Chrome</h4>
                  <p className="text-gray-600 text-sm">
                    설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                  <p className="text-gray-600 text-sm">
                    기본 설정 → 개인정보 보호 → 쿠키 및 웹사이트 데이터
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
                  <p className="text-gray-600 text-sm">
                    옵션 → 개인정보 및 보안 → 쿠키 및 사이트 데이터
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Edge</h4>
                  <p className="text-gray-600 text-sm">
                    설정 → 쿠키 및 사이트 권한 → 쿠키 및 저장된 데이터
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. 쿠키 정책 변경
              </h2>
              <p className="text-gray-700 leading-relaxed">
                이 쿠키 정책은 법적 요구사항이나 서비스 변경에 따라 수정될 수 있습니다.
                정책 변경 시에는 웹사이트를 통해 공지하며, 중요한 변경사항의 경우
                별도의 알림을 제공할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. 문의하기
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                쿠키 정책에 대한 문의사항이 있으시면 언제든지 연락해주시기 바랍니다:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>이메일:</strong> privacy@firstbaby.com<br/>
                  <strong>온라인 문의:</strong> 고객센터를 통해 문의
                </p>
              </div>
            </section>

            <div className="pt-8 border-t border-gray-200 text-center">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors mr-4"
              >
                문의하기
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}