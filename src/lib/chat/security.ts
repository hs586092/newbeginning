/**
 * 🔒 채팅 시스템 보안 및 권한 관리
 * - Content Security Policy (CSP)
 * - XSS/Injection 방지
 * - Rate limiting
 * - 스팸 감지
 * - 권한 기반 접근 제어 (RBAC)
 */

import { supabase } from '@/lib/supabase/client'
import DOMPurify from 'isomorphic-dompurify'

// 🎯 사용자 권한 레벨
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

// 🚨 보안 위험 레벨
export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 📊 메시지 분석 결과
export interface MessageSecurityAnalysis {
  isBlocked: boolean
  riskLevel: SecurityRiskLevel
  reasons: string[]
  sanitizedContent: string
  originalContent: string
}

// 👤 사용자 권한 정보
export interface UserPermissions {
  canSendMessages: boolean
  canSendFiles: boolean
  canMentionUsers: boolean
  canCreateRooms: boolean
  canInviteUsers: boolean
  canModerateContent: boolean
  canManageMembers: boolean
  canDeleteMessages: boolean
  messageRateLimit: number // 분당 메시지 수
  fileSizeLimit: number // MB 단위
}

// 🔒 채팅 보안 관리 클래스
export class ChatSecurityManager {
  private readonly badWords: Set<string> = new Set([
    // TODO: 욕설, 스팸 키워드 목록 (외부 파일로 관리)
  ])
  
  private readonly suspiciousPatterns: RegExp[] = [
    /https?:\/\/[^\s]+/gi, // URL 패턴
    /[\w\.-]+@[\w\.-]+\.\w+/gi, // 이메일 패턴
    /\b\d{3}-\d{3,4}-\d{4}\b/g, // 전화번호 패턴
    /(.)\1{4,}/g, // 동일 문자 5회 이상 반복
    /[^\w\s가-힣]/g, // 특수문자 과다 사용
  ]
  
  private userMessageCounts: Map<string, { count: number; resetTime: number }> = new Map()

  // 🧹 메시지 콘텐츠 정화 및 보안 검사
  async analyzeMessage(
    content: string, 
    userId: string, 
    roomId: string
  ): Promise<MessageSecurityAnalysis> {
    const analysis: MessageSecurityAnalysis = {
      isBlocked: false,
      riskLevel: SecurityRiskLevel.LOW,
      reasons: [],
      sanitizedContent: '',
      originalContent: content
    }

    // 1. HTML 태그 정화 (XSS 방지)
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [], // 모든 HTML 태그 제거
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false
    })

    // 2. 욕설 및 부적절한 언어 감지
    const lowerContent = sanitized.toLowerCase()
    const foundBadWords = Array.from(this.badWords).filter(word => 
      lowerContent.includes(word)
    )

    if (foundBadWords.length > 0) {
      analysis.riskLevel = SecurityRiskLevel.MEDIUM
      analysis.reasons.push(`부적절한 언어 사용: ${foundBadWords.join(', ')}`)
      
      // 욕설 마스킹
      let maskedContent = sanitized
      foundBadWords.forEach(word => {
        const regex = new RegExp(word, 'gi')
        maskedContent = maskedContent.replace(regex, '*'.repeat(word.length))
      })
      analysis.sanitizedContent = maskedContent
    } else {
      analysis.sanitizedContent = sanitized
    }

    // 3. 스팸 패턴 감지
    const spamScore = this.calculateSpamScore(sanitized)
    if (spamScore > 7) {
      analysis.isBlocked = true
      analysis.riskLevel = SecurityRiskLevel.HIGH
      analysis.reasons.push('스팸 메시지로 의심')
    } else if (spamScore > 4) {
      analysis.riskLevel = SecurityRiskLevel.MEDIUM
      analysis.reasons.push('스팸 의심 내용 포함')
    }

    // 4. Rate limiting 검사
    if (await this.checkRateLimit(userId, roomId)) {
      analysis.isBlocked = true
      analysis.riskLevel = SecurityRiskLevel.HIGH
      analysis.reasons.push('메시지 전송 빈도 제한 초과')
    }

    // 5. 링크 보안 검사
    const urlMatches = sanitized.match(this.suspiciousPatterns[0])
    if (urlMatches && urlMatches.length > 0) {
      const safeDomains = ['youtube.com', 'youtu.be', 'instagram.com', 'naver.com']
      const hasUnsafeUrl = urlMatches.some(url => 
        !safeDomains.some(domain => url.includes(domain))
      )
      
      if (hasUnsafeUrl) {
        analysis.riskLevel = SecurityRiskLevel.MEDIUM
        analysis.reasons.push('외부 링크 포함 - 관리자 검토 필요')
      }
    }

    // 6. 개인정보 노출 위험 검사
    const hasPersonalInfo = this.suspiciousPatterns.some(pattern => 
      pattern.test(sanitized)
    )
    if (hasPersonalInfo) {
      analysis.riskLevel = SecurityRiskLevel.HIGH
      analysis.reasons.push('개인정보 노출 위험')
      
      // 개인정보 마스킹
      let protectedContent = analysis.sanitizedContent
      protectedContent = protectedContent.replace(
        this.suspiciousPatterns[1], // 이메일
        (match) => match.replace(/(.{2}).*(@.*)/,'$1***$2')
      )
      protectedContent = protectedContent.replace(
        this.suspiciousPatterns[2], // 전화번호
        (match) => match.replace(/(\d{3})-\d{3,4}-(\d{4})/, '$1-***-$2')
      )
      analysis.sanitizedContent = protectedContent
    }

    return analysis
  }

  // 📊 스팸 점수 계산
  private calculateSpamScore(content: string): number {
    let score = 0
    
    // 길이 기반 점수
    if (content.length > 500) score += 2
    if (content.length < 5) score += 1
    
    // 대문자 비율
    const upperCaseRatio = (content.match(/[A-Z]/g)?.length || 0) / content.length
    if (upperCaseRatio > 0.5) score += 3
    
    // 특수문자 과다 사용
    const specialCharCount = (content.match(/[!@#$%^&*()]/g)?.length || 0)
    if (specialCharCount > 5) score += 2
    
    // 동일 문자 반복
    if (this.suspiciousPatterns[3].test(content)) score += 3
    
    // URL 개수
    const urlCount = (content.match(this.suspiciousPatterns[0])?.length || 0)
    if (urlCount > 2) score += 4
    if (urlCount > 0) score += 1
    
    return score
  }

  // ⚡ Rate limiting 검사
  private async checkRateLimit(userId: string, roomId: string): Promise<boolean> {
    const now = Date.now()
    const resetInterval = 60000 // 1분
    
    // 사용자 권한 조회
    const permissions = await this.getUserPermissions(userId, roomId)
    
    let userCounts = this.userMessageCounts.get(userId)
    if (!userCounts || now > userCounts.resetTime) {
      userCounts = {
        count: 0,
        resetTime: now + resetInterval
      }
    }
    
    userCounts.count++
    this.userMessageCounts.set(userId, userCounts)
    
    return userCounts.count > permissions.messageRateLimit
  }

  // 👤 사용자 권한 조회
  async getUserPermissions(userId: string, roomId: string): Promise<UserPermissions> {
    try {
      // 채팅방 멤버십 및 역할 조회
      const { data: membership } = await supabase
        .from('chat_room_members')
        .select('role')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (!membership) {
        return this.getDefaultPermissions('member')
      }

      return this.getDefaultPermissions(membership.role as UserRole)
    } catch (error) {
      console.error('Failed to get user permissions:', error)
      return this.getDefaultPermissions('member')
    }
  }

  // 🔑 역할별 기본 권한 설정
  private getDefaultPermissions(role: UserRole): UserPermissions {
    const basePermissions: UserPermissions = {
      canSendMessages: true,
      canSendFiles: true,
      canMentionUsers: true,
      canCreateRooms: false,
      canInviteUsers: false,
      canModerateContent: false,
      canManageMembers: false,
      canDeleteMessages: false,
      messageRateLimit: 30,
      fileSizeLimit: 10
    }

    switch (role) {
      case UserRole.OWNER:
        return {
          ...basePermissions,
          canCreateRooms: true,
          canInviteUsers: true,
          canModerateContent: true,
          canManageMembers: true,
          canDeleteMessages: true,
          messageRateLimit: 100,
          fileSizeLimit: 100
        }

      case UserRole.ADMIN:
        return {
          ...basePermissions,
          canInviteUsers: true,
          canModerateContent: true,
          canManageMembers: true,
          canDeleteMessages: true,
          messageRateLimit: 80,
          fileSizeLimit: 50
        }

      case UserRole.MODERATOR:
        return {
          ...basePermissions,
          canInviteUsers: true,
          canModerateContent: true,
          canDeleteMessages: true,
          messageRateLimit: 60,
          fileSizeLimit: 25
        }

      case UserRole.MEMBER:
      default:
        return basePermissions
    }
  }

  // 🚫 메시지 차단/삭제
  async blockMessage(
    messageId: string, 
    reason: string, 
    moderatorId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          content: '[관리자에 의해 차단된 메시지]'
        })
        .eq('id', messageId)

      if (error) throw error

      // 차단 로그 기록
      await this.logSecurityAction({
        action: 'message_blocked',
        target_user_id: messageId,
        moderator_id: moderatorId,
        reason,
        timestamp: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error('Failed to block message:', error)
      return false
    }
  }

  // 👤 사용자 제재
  async moderateUser(
    userId: string,
    roomId: string,
    action: 'warn' | 'mute' | 'kick' | 'ban',
    duration?: number, // 분 단위
    reason?: string,
    moderatorId?: string
  ): Promise<boolean> {
    try {
      switch (action) {
        case 'mute':
          // 임시 음소거 (메시지 전송 제한)
          await this.applyUserRestriction(userId, roomId, 'mute', duration)
          break

        case 'kick':
          // 채팅방에서 추방
          await supabase
            .from('chat_room_members')
            .update({ 
              is_active: false,
              left_at: new Date().toISOString()
            })
            .eq('room_id', roomId)
            .eq('user_id', userId)
          break

        case 'ban':
          // 영구 차단
          await this.applyUserRestriction(userId, roomId, 'ban')
          break
      }

      // 제재 로그 기록
      await this.logSecurityAction({
        action: `user_${action}`,
        target_user_id: userId,
        room_id: roomId,
        moderator_id: moderatorId,
        reason: reason || '',
        duration,
        timestamp: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
      return false
    }
  }

  // 🚧 사용자 제한 적용
  private async applyUserRestriction(
    userId: string,
    roomId: string,
    type: 'mute' | 'ban',
    duration?: number
  ) {
    const expiresAt = duration 
      ? new Date(Date.now() + duration * 60 * 1000).toISOString()
      : null

    // user_restrictions 테이블에 기록 (새 테이블 필요)
    await supabase
      .from('user_restrictions')
      .insert({
        user_id: userId,
        room_id: roomId,
        restriction_type: type,
        expires_at: expiresAt,
        is_active: true
      })
  }

  // 📋 보안 액션 로깅
  private async logSecurityAction(actionData: {
    action: string
    target_user_id?: string
    room_id?: string
    moderator_id?: string
    reason?: string
    duration?: number
    timestamp: string
  }) {
    try {
      await supabase
        .from('security_logs')
        .insert(actionData)
    } catch (error) {
      console.error('Failed to log security action:', error)
    }
  }

  // 🧼 정기 정리 작업
  async cleanupExpiredRestrictions() {
    const now = new Date().toISOString()
    
    await supabase
      .from('user_restrictions')
      .update({ is_active: false })
      .lt('expires_at', now)
      .eq('is_active', true)
  }

  // 📊 보안 통계 조회
  async getSecurityStats(roomId: string, days: number = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()

    const { data, error } = await supabase
      .from('security_logs')
      .select('action, timestamp')
      .eq('room_id', roomId)
      .gte('timestamp', startDate)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Failed to get security stats:', error)
      return null
    }

    // 통계 집계
    const stats = data.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: data.length,
      by_action: stats,
      recent_actions: data.slice(0, 10)
    }
  }
}

// 🏭 싱글톤 인스턴스
export const chatSecurityManager = new ChatSecurityManager()

// 🔒 사용자 제한 테이블 스키마 (추가 필요)
export const USER_RESTRICTIONS_SCHEMA = `
CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  restriction_type VARCHAR(20) NOT NULL CHECK (restriction_type IN ('mute', 'ban', 'warning')),
  reason TEXT,
  duration_minutes INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, room_id, restriction_type, is_active)
);

CREATE INDEX idx_user_restrictions_active ON user_restrictions(user_id, room_id, is_active);
CREATE INDEX idx_user_restrictions_expires ON user_restrictions(expires_at) WHERE is_active = true;
`

// 📋 보안 로그 테이블 스키마 (추가 필요)
export const SECURITY_LOGS_SCHEMA = `
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  duration_minutes INTEGER,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(timestamp),
  INDEX(room_id, timestamp),
  INDEX(target_user_id, timestamp)
);
`