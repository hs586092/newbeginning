#!/usr/bin/env node
/**
 * Supabase 데이터베이스 실시간 모니터링 시스템
 * 테이블 데이터, 통계, 성능 지표 실시간 조회
 * 사용법: node scripts/db-monitor.js [table_name] [--watch]
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수 오류')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * 테이블 통계 정보 조회
 */
async function getTableStats(tableName) {
  try {
    // 기본 통계 조회
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error(`❌ ${tableName} 통계 조회 오류:`, error.message)
      return null
    }

    // 최근 데이터 조회
    const { data: recentData, error: recentError } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const stats = {
      tableName,
      totalRows: data?.length || 0,
      recentData: recentData || [],
      timestamp: new Date().toISOString()
    }

    return stats
  } catch (err) {
    console.error(`❌ ${tableName} 모니터링 오류:`, err.message)
    return null
  }
}

/**
 * 데이터베이스 전체 통계
 */
async function getDatabaseStats() {
  const tables = ['posts', 'comments', 'comment_likes']
  const stats = {}

  for (const tableName of tables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        stats[tableName] = count || 0
      }
    } catch (err) {
      stats[tableName] = 0
    }
  }

  return stats
}

/**
 * 최근 활동 모니터링
 */
async function getRecentActivity() {
  try {
    // 최근 게시글
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, author_name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    // 최근 댓글 (테이블이 존재하는 경우)
    let recentComments = []
    try {
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, author_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      recentComments = comments || []
    } catch {
      // comments 테이블이 없으면 무시
    }

    return {
      recentPosts: recentPosts || [],
      recentComments
    }
  } catch (err) {
    console.error('❌ 최근 활동 조회 오류:', err.message)
    return { recentPosts: [], recentComments: [] }
  }
}

/**
 * 실시간 모니터링 화면 표시
 */
function displayMonitoring(stats, activity) {
  // 화면 클리어
  console.clear()
  
  console.log('🔴 실시간 데이터베이스 모니터링')
  console.log('='.repeat(60))
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`)
  
  // 전체 통계
  console.log('\n📊 테이블 통계:')
  Object.entries(stats).forEach(([table, count]) => {
    const icon = table === 'posts' ? '📝' : 
                 table === 'comments' ? '💬' : '❤️'
    console.log(`  ${icon} ${table}: ${count}개`)
  })

  // 최근 활동
  if (activity.recentPosts.length > 0) {
    console.log('\n📝 최근 게시글:')
    activity.recentPosts.forEach(post => {
      const timeAgo = getTimeAgo(post.created_at)
      console.log(`  • ${post.title.substring(0, 30)}... (${post.author_name}) ${timeAgo}`)
    })
  }

  if (activity.recentComments.length > 0) {
    console.log('\n💬 최근 댓글:')
    activity.recentComments.forEach(comment => {
      const timeAgo = getTimeAgo(comment.created_at)
      console.log(`  • ${comment.content.substring(0, 40)}... (${comment.author_name}) ${timeAgo}`)
    })
  }

  console.log('\n⌨️  종료: Ctrl+C')
}

/**
 * 시간 차이 계산
 */
function getTimeAgo(timestamp) {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMinutes = Math.floor((now - past) / (1000 * 60))
  
  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}시간 전`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}일 전`
}

/**
 * 특정 테이블 상세 모니터링
 */
async function monitorTable(tableName) {
  const stats = await getTableStats(tableName)
  
  if (!stats) {
    console.error(`❌ ${tableName} 테이블을 모니터링할 수 없습니다`)
    return
  }

  console.log(`\n📋 ${tableName} 테이블 모니터링`)
  console.log('='.repeat(50))
  console.log(`📊 총 레코드 수: ${stats.totalRows}`)
  console.log(`⏰ 마지막 업데이트: ${new Date(stats.timestamp).toLocaleString('ko-KR')}`)

  if (stats.recentData.length > 0) {
    console.log('\n🔥 최신 데이터 (5개):')
    console.table(stats.recentData.map(row => {
      const simplified = {}
      Object.keys(row).forEach(key => {
        if (key.includes('id')) {
          simplified[key] = row[key]?.substring(0, 8) + '...'
        } else if (typeof row[key] === 'string' && row[key].length > 30) {
          simplified[key] = row[key].substring(0, 30) + '...'
        } else {
          simplified[key] = row[key]
        }
      })
      return simplified
    }))
  }
}

/**
 * 실시간 모니터링 시작
 */
async function startRealTimeMonitoring() {
  const monitoringLoop = async () => {
    const stats = await getDatabaseStats()
    const activity = await getRecentActivity()
    displayMonitoring(stats, activity)
  }

  // 초기 실행
  await monitoringLoop()

  // 5초마다 업데이트
  const interval = setInterval(monitoringLoop, 5000)

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    clearInterval(interval)
    console.log('\n\n👋 모니터링을 종료합니다.')
    process.exit(0)
  })
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔴 Supabase 데이터베이스 모니터링 도구

사용법:
  node scripts/db-monitor.js              # 전체 데이터베이스 현황
  node scripts/db-monitor.js posts        # 특정 테이블 상세 정보
  node scripts/db-monitor.js --watch      # 실시간 모니터링 시작

옵션:
  --watch, -w    실시간 모니터링 모드
  --help, -h     도움말 표시

예시:
  node scripts/db-monitor.js posts
  node scripts/db-monitor.js --watch
`)
    return
  }

  if (args.includes('--watch') || args.includes('-w')) {
    console.log('🔴 실시간 모니터링 시작...')
    await startRealTimeMonitoring()
  } else if (args.length > 0 && !args[0].startsWith('--')) {
    const tableName = args[0]
    await monitorTable(tableName)
  } else {
    // 전체 현황 표시
    const stats = await getDatabaseStats()
    const activity = await getRecentActivity()
    displayMonitoring(stats, activity)
  }
}

// 스크립트 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { getTableStats, getDatabaseStats, getRecentActivity }