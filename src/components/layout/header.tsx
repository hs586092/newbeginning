'use client'

import Link from 'next/link'

export function Header() {

  return (
    <>
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
      >
        본문 바로가기
      </a>
      <header className="bg-white shadow-sm border-b border-gray-200 transition-colors sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                  moree<span className="text-blue-600">.ai</span>
                </h1>
              </Link>
            </div>

            {/* Empty space for future features */}
            <div className="flex items-center">
              {/* MVP: No user features needed */}
            </div>
          </div>
        </div>
      </header>

    </>
  )
}