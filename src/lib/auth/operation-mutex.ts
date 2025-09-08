'use client'

/**
 * Operation Mutex for Concurrent Auth Operation Management
 * Prevents race conditions and duplicate operations
 */
export class OperationMutex {
  private locks: Map<string, boolean> = new Map()
  private queues: Map<string, Array<() => void>> = new Map()
  private debugMode: boolean

  constructor(debugMode = false) {
    this.debugMode = debugMode
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[OperationMutex] ${message}`, data || '')
    }
  }

  /**
   * Acquire lock for operation
   */
  async acquire(operation: string): Promise<void> {
    return new Promise((resolve) => {
      const isLocked = this.locks.get(operation) || false
      
      if (!isLocked) {
        this.locks.set(operation, true)
        this.log(`Lock acquired for operation: ${operation}`)
        resolve()
      } else {
        this.log(`Operation ${operation} is locked, queuing...`)
        
        if (!this.queues.has(operation)) {
          this.queues.set(operation, [])
        }
        
        this.queues.get(operation)!.push(resolve)
      }
    })
  }

  /**
   * Release lock for operation
   */
  release(operation: string): void {
    const isLocked = this.locks.get(operation) || false
    
    if (!isLocked) {
      this.log(`Attempted to release unlocked operation: ${operation}`)
      return
    }

    this.locks.set(operation, false)
    this.log(`Lock released for operation: ${operation}`)

    // Process queue
    const queue = this.queues.get(operation) || []
    if (queue.length > 0) {
      const nextResolve = queue.shift()!
      this.locks.set(operation, true)
      this.log(`Lock transferred to next queued operation: ${operation}`)
      nextResolve()
    }
  }

  /**
   * Check if operation is locked
   */
  isLocked(operation: string): boolean {
    return this.locks.get(operation) || false
  }

  /**
   * Get queue length for operation
   */
  getQueueLength(operation: string): number {
    const queue = this.queues.get(operation) || []
    return queue.length
  }

  /**
   * Execute operation with automatic lock management
   */
  async withLock<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    await this.acquire(operation)
    
    try {
      this.log(`Executing locked operation: ${operation}`)
      return await fn()
    } finally {
      this.release(operation)
    }
  }

  /**
   * Get mutex status for debugging
   */
  getStatus() {
    return {
      locks: Object.fromEntries(this.locks.entries()),
      queues: Object.fromEntries(
        Array.from(this.queues.entries()).map(([key, value]) => [key, value.length])
      )
    }
  }

  /**
   * Clear all locks and queues (emergency reset)
   */
  reset(): void {
    this.log('Resetting all locks and queues')
    this.locks.clear()
    this.queues.clear()
  }
}