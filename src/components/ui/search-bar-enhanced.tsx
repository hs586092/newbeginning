'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchBarEnhancedProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SearchBarEnhanced({ 
  placeholder = "직무, 회사명, 지역으로 검색...", 
  onSearch,
  className = "",
  size = 'lg'
}: SearchBarEnhancedProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const sizeClasses = {
    sm: {
      container: "max-w-md",
      input: "px-4 py-2 pl-10 text-sm",
      icon: "left-3 w-4 h-4",
      button: "right-1 px-4 py-1 text-sm"
    },
    md: {
      container: "max-w-xl", 
      input: "px-5 py-3 pl-11 text-base",
      icon: "left-3 w-5 h-5",
      button: "right-1 px-5 py-2"
    },
    lg: {
      container: "max-w-2xl",
      input: "px-6 py-4 pl-12 text-lg", 
      icon: "left-4 w-6 h-6",
      button: "right-2 px-6 py-2"
    }
  }

  const currentSize = sizeClasses[size]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        // 기본 검색 동작: jobs 페이지로 이동
        router.push(`/jobs?search=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className={`relative ${currentSize.container} mx-auto ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${currentSize.input} border-2 border-gray-200 rounded-full 
                       focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 
                       shadow-lg transition-all duration-200 hover:shadow-xl pr-24`}
          />
          
          {/* Search Icon */}
          <Search className={`absolute ${currentSize.icon} top-1/2 -translate-y-1/2 text-gray-400`} />
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Search Button */}
          <button 
            type="submit"
            className={`absolute ${currentSize.button} top-1/2 -translate-y-1/2 bg-purple-600 
                       text-white rounded-full hover:bg-purple-700 focus:outline-none 
                       focus:ring-2 focus:ring-purple-300 transition-all duration-200 
                       transform hover:scale-105 active:scale-95 font-medium`}
            disabled={!query.trim()}
          >
            검색
          </button>
        </div>
      </form>
      
      {/* Search Suggestions (optional) */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-2">추천 검색어</div>
            <div className="space-y-1">
              {['React 개발자', 'Node.js 개발자', 'Frontend 개발자', '서울 스타트업'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Search className="inline w-3 h-3 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}