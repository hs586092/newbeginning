import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '첫돌까지 개인정보처리방침 - 개인정보보호법(PIPA) 준수',
  robots: 'index, follow'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-8">
        <header className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            개인정보처리방침
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p>시행일자: 2025년 1월 1일</p>
            <p>최종 개정: 2025년 1월 1일</p>
            <p>첫돌까지(이하 &quot;회사&quot;)는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련된 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>
          </div>
        </header>

        <nav className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">목차</h2>
          <ol className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li><a href="#section1" className="hover:text-pink-600 dark:hover:text-pink-400">1. 개인정보의 처리목적</a></li>
            <li><a href="#section2" className="hover:text-pink-600 dark:hover:text-pink-400">2. 개인정보의 처리 및 보유기간</a></li>
            <li><a href="#section3" className="hover:text-pink-600 dark:hover:text-pink-400">3. 처리하는 개인정보 항목</a></li>
            <li><a href="#section4" className="hover:text-pink-600 dark:hover:text-pink-400">4. 개인정보의 제3자 제공</a></li>
            <li><a href="#section5" className="hover:text-pink-600 dark:hover:text-pink-400">5. 개인정보의 파기</a></li>
            <li><a href="#section6" className="hover:text-pink-600 dark:hover:text-pink-400">6. 정보주체의 권리·의무 및 행사방법</a></li>
            <li><a href="#section7" className="hover:text-pink-600 dark:hover:text-pink-400">7. 개인정보의 안전성 확보조치</a></li>
            <li><a href="#section8" className="hover:text-pink-600 dark:hover:text-pink-400">8. 개인정보보호책임자</a></li>
            <li><a href="#section9" className="hover:text-pink-600 dark:hover:text-pink-400">9. 권익침해 구제방법</a></li>
            <li><a href="#section10" className="hover:text-pink-600 dark:hover:text-pink-400">10. 개인정보처리방침 변경</a></li>
          </ol>
        </nav>

        <main className="space-y-8">
          <section id="section1" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제1조 (개인정보의 처리목적)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
              
              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-pink-800 dark:text-pink-200">1. 회원가입 및 관리</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>회원제 서비스 이용에 따른 본인확인, 개인 식별</li>
                  <li>부정이용 방지, 비인가 사용 방지</li>
                  <li>서비스 이용 문의응답, 고충처리</li>
                  <li>임신·육아 관련 맞춤형 서비스 제공</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">2. 서비스 제공</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>커뮤니티 서비스 제공 (게시글 작성, 댓글, 좋아요)</li>
                  <li>임신·육아 정보 제공 및 상담 서비스</li>
                  <li>개인화된 콘텐츠 추천</li>
                  <li>서비스 개선 및 품질향상</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">3. 마케팅 및 광고 활용</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>이벤트 및 광고성 정보 전달 (동의한 경우에 한함)</li>
                  <li>서비스 관련 알림 및 공지사항 전달</li>
                  <li>맞춤형 서비스 제공을 위한 통계작성·학술연구</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="section2" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제2조 (개인정보의 처리 및 보유기간)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">처리목적</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">보유기간</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">회원가입 및 관리</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">회원탈퇴 시까지</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">이용자 동의</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">커뮤니티 서비스 제공</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">회원탈퇴 시까지</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">이용자 동의</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">부정이용 방지</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">3개월</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">정보통신망법</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">서비스 이용기록</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">3개월</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">통신비밀보호법</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="section3" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제3조 (처리하는 개인정보 항목)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-200">필수 개인정보</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>회원가입 시:</strong> 이메일 주소, 비밀번호</li>
                  <li><strong>서비스 이용 시:</strong> 닉네임, 프로필 사진(선택)</li>
                  <li><strong>자동 수집:</strong> IP 주소, 서비스 이용기록, 접속 로그</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-purple-800 dark:text-purple-200">선택 개인정보</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>프로필 정보:</strong> 임신 주수, 출산예정일, 자녀 정보</li>
                  <li><strong>맞춤형 서비스:</strong> 관심 카테고리, 알림 설정</li>
                  <li><strong>마케팅 수신:</strong> 이벤트 및 프로모션 정보 수신 동의</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                * 선택 개인정보는 제공하지 않으셔도 서비스 이용이 가능하며, 거부 시 맞춤형 서비스 제공에 제한이 있을 수 있습니다.
              </p>
            </div>
          </section>

          <section id="section4" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제4조 (개인정보의 제3자 제공)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>회사는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>정보주체가 사전에 동의한 경우</li>
                  <li>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                  <li>공공기관이 법령 등에서 정하는 소관 업무의 수행을 위하여 불가피한 경우</li>
                  <li>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="section5" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제5조 (개인정보의 파기)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-indigo-800 dark:text-indigo-200">파기절차</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>파기 사유 발생</li>
                    <li>파기 계획 수립</li>
                    <li>개인정보보호책임자 승인</li>
                    <li>파기 실행</li>
                    <li>파기 완료 확인</li>
                  </ul>
                </div>
                
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-teal-800 dark:text-teal-200">파기방법</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>전자파일: 복구 불가능한 기술적 방법으로 완전삭제</li>
                    <li>종이문서: 분쇄하거나 소각</li>
                    <li>파기 기록 보관 (3년)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="section6" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제6조 (정보주체의 권리·의무 및 행사방법)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
              
              <div className="grid gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-emerald-800 dark:text-emerald-200">귀하의 권리</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>개인정보 처리현황 통지 요구</li>
                    <li>개인정보 열람 요구</li>
                    <li>개인정보 정정·삭제 요구</li>
                    <li>개인정보 처리정지 요구</li>
                    <li>손해배상 청구</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-orange-800 dark:text-orange-200">권리 행사 방법</h3>
                  <p className="text-sm mb-2">아래 연락처로 서면, 전화, 전자우편을 통해 요청하실 수 있습니다:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>이메일: privacy@firstbirthday.kr</li>
                    <li>처리기간: 요청일로부터 10일 이내</li>
                    <li>대리인 신청 시 위임장 및 신분증 확인</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="section7" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제7조 (개인정보의 안전성 확보조치)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-red-800 dark:text-red-200">기술적 조치</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>개인정보 암호화</li>
                    <li>해킹 등 대비 시스템</li>
                    <li>보안프로그램 설치</li>
                    <li>접속기록 보관</li>
                    <li>접근권한 관리</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">관리적 조치</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>개인정보 취급직원 지정</li>
                    <li>개인정보보호 교육</li>
                    <li>내부관리계획 수립</li>
                    <li>정기적 자체감사</li>
                    <li>비밀보장 서약서</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">물리적 조치</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>전산실 접근통제</li>
                    <li>개인정보 보관 잠금장치</li>
                    <li>비인가자 출입 통제</li>
                    <li>CCTV 설치</li>
                    <li>문서보관함 시건</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="section8" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제8조 (개인정보보호책임자)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:</p>
              
              <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 p-6 rounded-lg border-2 border-pink-200 dark:border-pink-600">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-pink-800 dark:text-pink-200">개인정보보호책임자</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>성명:</strong> 첫돌까지 개인정보보호팀장</li>
                      <li><strong>직책:</strong> 개인정보보호책임자</li>
                      <li><strong>연락처:</strong> privacy@firstbirthday.kr</li>
                      <li><strong>전화:</strong> 02-1234-5678</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">개인정보보호담당자</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>성명:</strong> 첫돌까지 개발팀</li>
                      <li><strong>직책:</strong> 개인정보보호담당자</li>
                      <li><strong>연락처:</strong> support@firstbirthday.kr</li>
                      <li><strong>전화:</strong> 02-1234-5679</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 border-t pt-3">
                  개인정보 처리와 관련한 문의나 불만이 있으시면 언제든지 위 연락처로 연락 주시기 바랍니다. 신속하고 충분한 답변을 드리도록 하겠습니다.
                </p>
              </div>
            </div>
          </section>

          <section id="section9" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제9조 (권익침해 구제방법)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
              <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">개인정보침해신고센터</h3>
                  <ul className="space-y-1 text-sm">
                    <li>전화: 국번없이 <strong>privacy.go.kr</strong></li>
                    <li>홈페이지: privacy.go.kr</li>
                    <li>주소: (우) 03171 서울특별시 종로구 세종대로 209 정부서울청사 12층</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">개인정보분쟁조정위원회</h3>
                  <ul className="space-y-1 text-sm">
                    <li>전화: 국번없이 <strong>1833-6972</strong></li>
                    <li>홈페이지: www.kopico.go.kr</li>
                    <li>주소: (우) 03171 서울특별시 종로구 세종대로 209 정부서울청사 12층</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-400">
                <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">기타 신고기관</h3>
                <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  <li>대검찰청 사이버범죄수사단: 02-3480-3573 (www.spo.go.kr)</li>
                  <li>경찰청 사이버안전국: 182 (cyberbureau.police.go.kr)</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="section10" className="scroll-margin-top">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-pink-500 pl-4">
              제10조 (개인정보처리방침 변경)
            </h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              
              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-600">
                <h3 className="font-semibold mb-2 text-pink-800 dark:text-pink-200">개정 이력</h3>
                <ul className="space-y-1 text-sm">
                  <li>• 2025년 1월 1일: 개인정보처리방침 최초 제정</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>이 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.</p>
            <p className="mt-2">개인정보 관련 문의: 
              <a href="mailto:privacy@firstbirthday.kr" className="text-pink-600 dark:text-pink-400 hover:underline">
                privacy@firstbirthday.kr
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}