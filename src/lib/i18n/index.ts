'use client'

import { ko } from './locales/ko'
import { en } from './locales/en'

export type Locale = 'ko' | 'en'

export const locales: Record<Locale, typeof ko> = {
  ko,
  en,
}

export const defaultLocale: Locale = 'ko'

export function getMessages(locale: Locale = defaultLocale) {
  return locales[locale] || locales[defaultLocale]
}

// Type for translation keys
export type TranslationKeys = typeof ko

// Helper function to get nested translation
export function t(
  messages: TranslationKeys,
  key: string
): string {
  const keys = key.split('.')
  let result: any = messages
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }
  
  return typeof result === 'string' ? result : key
}

// Translation context
import { createContext, useContext } from 'react'

export interface I18nContextType {
  locale: Locale
  messages: TranslationKeys
  t: (key: string) => string
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}