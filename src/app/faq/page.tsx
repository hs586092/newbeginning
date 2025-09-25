'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: '회원가입',
    question: '첫돌까지는 어떤 서비스인가요?',
    answer: '첫돌까지는 초보엄마부터 베테랑맘까지 모든 육아맘들이 경험을 공유하고 소통할 수 있는 육아 커뮤니티입니다. 실시간 채팅, 정보 공유, 전문가 조언 등을 제공합니다.'
  },
  {
    id: 2,
    category: '회원가입',
    question: '회원가입은 어떻게 하나요?',
    answer: '구글 계정이나 카카오 계정을 통해 간단하게 회원가입하실 수 있습니다. 로그인 페이지에서 원하는 소셜 로그인을 선택하여 진행해주세요.'
  },
  {
    id: 3,
    category: '사용법',
    question: '채팅방은 어떻게 만드나요?',
    answer: '로그인 후 메인 페이지의 "메시지" 메뉴를 클릭하시거나, 사이드바의 "모든 메시지 보기"를 통해 채팅 페이지로 이동하세요. 그 후 "새 채팅방" 버튼을 클릭하여 채팅방을 생성할 수 있습니다.'
  },
  {
    id: 4,
    category: '사용법',
    question: '글은 어떻게 작성하나요?',
    answer: '메인 페이지에서 "새 글 작성" 버튼을 클릭하거나, 상단 네비게이션의 "글쓰기"를 이용하세요. 제목, 내용, 카테고리, 태그 등을 설정하여 글을 작성할 수 있습니다.'
  },
  {
    id: 5,
    category: '기능',
    question: '개월 수별 정보는 어디서 확인할 수 있나요?',
    answer: '프로필 설정에서 아기의 개월 수를 설정하시면, 해당 개월 수에 맞는 발달 정보와 팁을 메인 피드에서 확인하실 수 있습니다.'
  },
  {
    id: 6,
    category: '기능',
    question: '북마크 기능은 어떻게 사용하나요?',
    answer: '마음에 드는 글이나 유용한 정보가 있는 글의 북마크 아이콘(🔖)을 클릭하여 저장할 수 있습니다. 저장된 글은 프로필 페이지에서 확인 가능합니다.'
  },
  {
    id: 7,
    category: '문제해결',
    question: '실시간 채팅이 안 되는 경우는 어떻게 하나요?',
    answer: '네트워크 연결을 확인해주세요. 실시간 기능이 일시적으로 작동하지 않더라도 기본 채팅 기능은 계속 사용 가능합니다. 문제가 지속되면 고객센터로 문의해주세요.'
  },
  {
    id: 8,
    category: '문제해결',
    question: '알림이 오지 않는 경우는 어떻게 하나요?',
    answer: '브라우저의 알림 설정을 확인해주시고, 프로필 설정에서 알림 옵션을 다시 설정해보세요. 모바일에서는 PWA로 설치하시면 더 나은 알림 경험을 제공합니다.'
  },
  {
    id: 9,
    category: '개인정보',
    question: '개인정보는 어떻게 보호되나요?',
    answer: '모든 개인정보는 암호화되어 안전하게 저장되며, 개인정보보호법에 따라 엄격하게 관리됩니다. 자세한 내용은 개인정보처리방침을 참고해주세요.'
  },
  {
    id: 10,
    category: '기타',
    question: '서비스 이용 중 문제가 발생하면 어디로 문의하나요?',
    answer: '고객센터(contact@example.com)로 문의해주시거나, 사이드바의 "문의하기" 메뉴를 이용해주세요. 최대한 빠르게 도움을 드리겠습니다.'
  }
]

const categories = ['전체', '회원가입', '사용법', '기능', '문제해결', '개인정보', '기타']

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [openItems, setOpenItems] = useState<number[]>([])

  const filteredFAQs = selectedCategory === '전체'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory)

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h1>
            <p className="text-gray-600">
              첫돌까지 이용 관련 궁금한 점들을 확인해보세요
            </p>
          </header>

          {/* 카테고리 필터 */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ 리스트 */}
          <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-200">
            {filteredFAQs.map(item => (
              <div key={item.id} className="p-6">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <span className="text-sm text-pink-500 font-medium">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">
                      {item.question}
                    </h3>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {openItems.includes(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {openItems.includes(item.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                선택된 카테고리에 FAQ가 없습니다.
              </p>
            </div>
          )}

          <div className="mt-8 text-center bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="text-gray-600 mb-4">
              언제든지 문의해주세요. 빠르게 도움드리겠습니다.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}