'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return '라이트 모드'
      case 'dark':
        return '다크 모드'
      default:
        return '시스템 설정'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 
                 text-gray-500 hover:bg-gray-100 hover:text-gray-900 
                 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100
                 transition-colors duration-200 focus:outline-none focus:ring-2 
                 focus:ring-purple-500 focus:ring-offset-2"
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  )
}

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative group">
      <button
        className="inline-flex items-center justify-center rounded-md p-2 
                   text-gray-500 hover:bg-gray-100 hover:text-gray-900 
                   dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100
                   transition-colors duration-200 focus:outline-none focus:ring-2 
                   focus:ring-purple-500 focus:ring-offset-2"
      >
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 
                      shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible 
                      group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors ${
                         theme === 'light' ? 'bg-gray-50 dark:bg-gray-700' : ''
                       }`}
          >
            <Sun className="mr-2 h-4 w-4" />
            라이트 모드
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors ${
                         theme === 'dark' ? 'bg-gray-50 dark:bg-gray-700' : ''
                       }`}
          >
            <Moon className="mr-2 h-4 w-4" />
            다크 모드
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors ${
                         theme === 'system' ? 'bg-gray-50 dark:bg-gray-700' : ''
                       }`}
          >
            <Monitor className="mr-2 h-4 w-4" />
            시스템 설정
          </button>
        </div>
      </div>
    </div>
  )
}