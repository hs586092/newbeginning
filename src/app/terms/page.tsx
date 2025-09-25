'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              이용약관
            </h1>
            <p className="text-gray-600">
              첫돌까지 서비스 이용약관
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제1조 (목적)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관은 첫돌까지(이하 "회사")가 제공하는 육아 커뮤니티 서비스의
                이용조건 및 절차에 관한 사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제2조 (서비스의 내용)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사가 제공하는 서비스는 다음과 같습니다:
              </p>
              <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
                <li>육아 관련 정보 및 경험 공유 커뮤니티</li>
                <li>실시간 채팅 서비스</li>
                <li>육아 관련 전문 정보 제공</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제3조 (회원가입)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                서비스를 이용하고자 하는 자는 회사가 정한 가입 양식에 따라
                회원정보를 기입하고 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제4조 (개인정보보호)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 회원의 개인정보를 보호하기 위해 개인정보보호법 등 관련 법령을 준수하며,
                자세한 사항은 개인정보처리방침에 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제5조 (이용자의 의무)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회원은 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
                <li>타인의 개인정보를 도용하는 행위</li>
                <li>허위정보를 게시하는 행위</li>
                <li>타인을 비방하거나 명예를 손상시키는 행위</li>
                <li>서비스의 운영을 방해하는 행위</li>
                <li>관련 법령에 위반되는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제6조 (서비스 이용제한)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우,
                회사는 경고, 일시정지, 영구이용정지 등의 조치를 취할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제7조 (책임제한)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                서비스 제공에 관한 책임이 면제됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                제8조 (분쟁해결)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관은 대한민국 법률에 따라 규율되며, 서비스와 관련하여 발생한 분쟁에 대하여는
                관할 법원에서 해결합니다.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">
                시행일: 2024년 1월 1일<br/>
                본 약관에 대한 문의는 고객센터를 통해 해주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}