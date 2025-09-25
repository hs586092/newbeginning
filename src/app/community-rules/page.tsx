'use client'

export default function CommunityRulesPage() {
  const rules = [
    {
      id: 1,
      title: '상호 존중',
      description: '모든 회원은 서로를 존중하며 예의를 지켜주세요',
      details: [
        '타인을 비방하거나 인신공격하는 언행 금지',
        '다양한 의견과 상황에 대한 이해와 배려',
        '건설적이고 따뜻한 조언과 격려',
        '차별적이거나 혐오적인 표현 금지'
      ]
    },
    {
      id: 2,
      title: '개인정보 보호',
      description: '나와 타인의 개인정보를 보호해주세요',
      details: [
        '실명, 주소, 연락처 등 개인정보 공개 금지',
        '아이의 얼굴이 명확히 드러나는 사진 업로드 주의',
        '타인의 개인정보를 무단으로 공유하지 않기',
        '개인정보가 포함된 스크린샷 등 공유 금지'
      ]
    },
    {
      id: 3,
      title: '적절한 콘텐츠',
      description: '커뮤니티 성격에 맞는 건전한 콘텐츠를 공유해주세요',
      details: [
        '육아 관련 정보, 경험, 고민 공유',
        '폭력적이거나 선정적인 콘텐츠 금지',
        '정확하지 않은 의학 정보 제공 주의',
        '출처가 불명확한 정보 공유 시 주의사항 명시'
      ]
    },
    {
      id: 4,
      title: '스팸 및 광고 금지',
      description: '상업적 목적의 글이나 스팸은 허용되지 않습니다',
      details: [
        '제품 판매나 홍보 목적의 글 금지',
        '반복적인 동일 내용 게시 금지',
        '외부 링크 남발이나 의심스러운 링크 공유 금지',
        '개인적인 이익을 위한 활동 금지'
      ]
    },
    {
      id: 5,
      title: '적절한 카테고리 사용',
      description: '글의 성격에 맞는 적절한 카테고리를 선택해주세요',
      details: [
        '내용에 맞는 정확한 카테고리 선택',
        '제목과 내용의 일치성 확인',
        '관련성 있는 태그 사용',
        '중복 게시 방지'
      ]
    },
    {
      id: 6,
      title: '저작권 존중',
      description: '타인의 저작물을 사용할 때는 출처를 명시해주세요',
      details: [
        '인터넷에서 가져온 이미지나 글의 출처 명시',
        '무단 복사나 도용 금지',
        '저작권이 있는 콘텐츠 사용 시 주의',
        '본인이 직접 작성한 글임을 명확히 구분'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              커뮤니티 이용수칙
            </h1>
            <p className="text-gray-600 text-lg">
              모든 회원이 안전하고 즐겁게 이용할 수 있는 커뮤니티를 만들어 나가요
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-pink-900 mb-2">
                💝 첫돌까지 커뮤니티의 약속
              </h3>
              <p className="text-pink-800">
                첫돌까지는 새로운 부모들이 서로 도움을 주고받으며 함께 성장하는 공간입니다.
                모든 회원이 편안하고 안전하게 소통할 수 있도록 다음 이용수칙을 지켜주시기 바랍니다.
              </p>
            </div>

            <div className="space-y-8">
              {rules.map((rule, index) => (
                <div key={rule.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {rule.id}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {rule.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {rule.description}
                      </p>
                      <ul className="space-y-2">
                        {rule.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ⚠️ 위반 시 조치사항
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                커뮤니티 이용수칙을 위반할 경우, 위반 정도에 따라 다음과 같은 조치가 취해질 수 있습니다:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• <strong>1차 위반:</strong> 경고 및 해당 게시물 삭제</li>
                <li>• <strong>2차 위반:</strong> 일시적 이용 제한 (1-7일)</li>
                <li>• <strong>3차 위반 또는 심각한 위반:</strong> 영구 이용 정지</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                ※ 위반 내용이 심각한 경우 1차 위반이라도 즉시 영구 이용 정지될 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📢 신고 및 문의
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                이용수칙을 위반하는 게시물이나 댓글을 발견하셨다면 즉시 신고해주세요.
                또한 이용수칙에 대한 문의사항이 있으시면 언제든지 연락해주시기 바랍니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  문의하기
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  커뮤니티로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}