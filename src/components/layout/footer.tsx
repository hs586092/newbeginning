'use client'

import Link from 'next/link'
import {
  Mail,
  MessageSquare,
  Shield,
  FileText,
  HelpCircle,
  Heart,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 서비스 소개 */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🤱 첫돌까지 육아맘들
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              새로운 엄마, 아빠들이 함께 성장하는 커뮤니티입니다.
              육아의 모든 순간을 함께 나누어요.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Heart className="w-4 h-4 text-pink-500" aria-hidden="true" />
              <span>함께 성장하는 육아 커뮤니티</span>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">서비스</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  커뮤니티 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/guide"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  이용가이드
                </Link>
              </li>
              <li>
                <Link
                  href="/community-rules"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  커뮤니티 규칙
                </Link>
              </li>
            </ul>
          </div>

          {/* 정책 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">정책</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  쿠키 정책
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">지원</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  문의하기
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@fortheorlingas.com"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  support@fortheorlingas.com
                </a>
              </li>
            </ul>

            {/* 소셜 미디어 */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">소셜 미디어</h5>
              <div className="flex space-x-3">
                <a
                  href="https://instagram.com/fortheorlingas"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  aria-label="Instagram 팔로우하기"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/fortheorlingas"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Twitter 팔로우하기"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/fortheorlingas"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Facebook 팔로우하기"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} 첫돌까지 육아맘들. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-pink-500" aria-hidden="true" />
              <span>for parents worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}