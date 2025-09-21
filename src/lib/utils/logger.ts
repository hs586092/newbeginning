/**
 * Production-safe logger utility
 * Development logs are stripped from production builds
 */

interface LogContext {
  component?: string
  action?: string
  userId?: string
  [key: string]: any
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  /**
   * Development-only logging
   */
  log(message: string, context?: LogContext) {
    if (this.isDev) {
      if (context) {
        console.log(`🔍 ${message}`, context)
      } else {
        console.log(`🔍 ${message}`)
      }
    }
  }

  /**
   * Development-only info logging
   */
  info(message: string, context?: LogContext) {
    if (this.isDev) {
      if (context) {
        console.info(`ℹ️ ${message}`, context)
      } else {
        console.info(`ℹ️ ${message}`)
      }
    }
  }

  /**
   * Development-only warning logging
   */
  warn(message: string, context?: LogContext) {
    if (this.isDev) {
      if (context) {
        console.warn(`⚠️ ${message}`, context)
      } else {
        console.warn(`⚠️ ${message}`)
      }
    }
  }

  /**
   * Always log errors (production + development)
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorInfo = {
      message,
      ...(context || {}),
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    }

    if (error instanceof Error) {
      console.error(`❌ ${message}`, {
        ...errorInfo,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    } else if (error) {
      console.error(`❌ ${message}`, {
        ...errorInfo,
        error: String(error)
      })
    } else {
      console.error(`❌ ${message}`, errorInfo)
    }
  }

  /**
   * Performance timing logging (development-only)
   */
  time(label: string) {
    if (this.isDev) {
      console.time(`⏱️ ${label}`)
    }
  }

  timeEnd(label: string) {
    if (this.isDev) {
      console.timeEnd(`⏱️ ${label}`)
    }
  }

  /**
   * API request/response logging (development-only)
   */
  api(method: string, url: string, status?: number, duration?: number) {
    if (this.isDev) {
      const statusEmoji = status ? (status < 400 ? '✅' : '❌') : '🔄'
      const durationText = duration ? ` (${duration}ms)` : ''
      console.log(`${statusEmoji} API ${method.toUpperCase()} ${url}${durationText}`)
    }
  }
}

export const logger = new Logger()