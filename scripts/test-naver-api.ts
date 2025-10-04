/**
 * 네이버 API 연결 테스트
 */

import axios from 'axios'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET

async function testNaverAPI() {
  console.log('🔍 네이버 API 테스트 시작...\n')

  console.log('📋 환경 변수 확인:')
  console.log('  NAVER_CLIENT_ID:', NAVER_CLIENT_ID ? `${NAVER_CLIENT_ID.substring(0, 5)}...` : '❌ 없음')
  console.log('  NAVER_CLIENT_SECRET:', NAVER_CLIENT_SECRET ? `${NAVER_CLIENT_SECRET.substring(0, 5)}...` : '❌ 없음')
  console.log()

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error('❌ API 키가 설정되지 않았습니다.')
    return
  }

  // 테스트 1: 검색 API
  console.log('📍 테스트 1: 네이버 검색 API (지역)')
  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query: '강남역 카페',
        display: 5
      },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    })

    console.log('✅ 검색 API 성공!')
    console.log(`   결과 개수: ${response.data.items.length}개`)
    if (response.data.items.length > 0) {
      console.log(`   첫 번째 결과: ${response.data.items[0].title}`)
    }
    console.log()
  } catch (error: any) {
    console.error('❌ 검색 API 실패:')
    if (error.response) {
      console.error('   상태 코드:', error.response.status)
      console.error('   에러 메시지:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error('   에러:', error.message)
    }
    console.log()
  }

  // 테스트 2: 블로그 검색 API (더 간단한 API)
  console.log('📍 테스트 2: 네이버 블로그 검색 API')
  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
      params: {
        query: '소아과',
        display: 5
      },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    })

    console.log('✅ 블로그 검색 API 성공!')
    console.log(`   결과 개수: ${response.data.items.length}개`)
    console.log()
  } catch (error: any) {
    console.error('❌ 블로그 검색 API 실패:')
    if (error.response) {
      console.error('   상태 코드:', error.response.status)
      console.error('   에러 메시지:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error('   에러:', error.message)
    }
    console.log()
  }

  console.log('📊 진단 결과:')
  console.log('1. Client ID/Secret이 올바른지 확인하세요')
  console.log('2. 네이버 클라우드 플랫폼에서 Application이 활성화되었는지 확인하세요')
  console.log('3. Search API가 선택되었는지 확인하세요 (Maps가 아닌 Search)')
  console.log('4. 서비스 URL이 등록되었는지 확인하세요')
  console.log()
  console.log('📱 네이버 클라우드 플랫폼 콘솔:')
  console.log('   https://console.ncloud.com/naver-service/application')
}

testNaverAPI().catch(console.error)
