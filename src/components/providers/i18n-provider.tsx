'use client'

import { useState, useEffect, ReactNode } from 'react'
import { I18nContext, Locale, getMessages, defaultLocale, t } from '@/lib/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState(getMessages(defaultLocale))

  // Load locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && ['ko', 'en'].includes(savedLocale)) {
        setLocale(savedLocale)
        setMessages(getMessages(savedLocale))
      }
    }
  }, [])

  // Update messages when locale changes
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setMessages(getMessages(newLocale))
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  // Translation function
  const translate = (key: string): string => {
    return t(messages, key)
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        messages,
        t: translate,
        setLocale: handleSetLocale,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}