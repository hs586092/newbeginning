// 간단한 방식으로 필수 테이블만 생성
import { createClient } from '@supabase/supabase-js'

async function createTables() {
  const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'public' }
  })

  console.log('🚀 필수 테이블 생성 시작...\n')

  // 1. categories 테이블 생성 (초기 데이터 포함)
  console.log('📂 1. categories 테이블 생성 중...')
  try {
    // 기존 데이터 삭제 후 재생성
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 행 삭제

    const categories = [
      { name: '아기 수유 고민', post_count: 124, is_hot: true, icon: '🍼', description: '신생아 및 영아 수유 관련 고민과 노하우' },
      { name: '이유식 거부', post_count: 89, is_hot: true, icon: '🥄', description: '이유식을 거부하는 아기들을 위한 해결책' },
      { name: '밤수유 노하우', post_count: 78, is_hot: false, icon: '🌙', description: '밤수유를 편하게 하는 방법들' },
      { name: '변비 과열', post_count: 67, is_hot: false, icon: '💊', description: '아기 변비 해결법과 관련 정보' },
      { name: '놀이 활동', post_count: 56, is_hot: false, icon: '🧸', description: '월령별 놀이 활동과 발달 놀이' },
      { name: '둘째 조작', post_count: 45, is_hot: false, icon: '👶', description: '둘째 아이 키우기와 형제 관계' },
      { name: '육아휴직 복직', post_count: 34, is_hot: false, icon: '💼', description: '육아휴직 후 직장 복귀 관련' },
      { name: '모유수유 노하우', post_count: 23, is_hot: false, icon: '🤱', description: '모유수유 성공을 위한 팁' }
    ]

    const { data, error } = await supabase
      .from('categories')
      .insert(categories)
      .select()

    if (error) {
      console.log(`❌ categories 테이블 생성/삽입 실패: ${error.message}`)
    } else {
      console.log(`✅ categories 테이블 생성 성공 (${data.length}개 레코드)`)
    }
  } catch (err) {
    console.log(`⚠️ categories 테이블 처리 중 오류: ${err.message}`)
  }

  // 2. groups 테이블 생성 (초기 데이터 포함)
  console.log('👥 2. groups 테이블 생성 중...')
  try {
    // 기존 데이터 삭제 후 재생성
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    const groups = [
      {
        name: '신생아맘 모임',
        description: '0-6개월 신생아를 키우는 엄마들의 정보 공유 모임입니다. 수유, 잠자리, 발달 등 신생아 육아의 모든 것을 함께 나눠요.',
        member_count: 124,
        is_public: true,
        icon: '👶',
        color: 'purple'
      },
      {
        name: '이유식 레시피',
        description: '이유식 레시피 공유와 노하우를 나누는 그룹입니다. 초기부터 완료기까지 다양한 레시피와 팁을 공유해요.',
        member_count: 89,
        is_public: true,
        icon: '🍼',
        color: 'green'
      },
      {
        name: '워킹맘 라이프',
        description: '일과 육아를 병행하는 워킹맘들의 소통 공간입니다. 시간 관리, 육아 팁, 스트레스 관리법을 함께 나눠요.',
        member_count: 156,
        is_public: true,
        icon: '💼',
        color: 'blue'
      },
      {
        name: '아빠 육아단',
        description: '육아에 적극적으로 참여하는 아빠들의 모임입니다. 아빠만의 육아 노하우와 경험담을 공유해요.',
        member_count: 67,
        is_public: true,
        icon: '👨',
        color: 'orange'
      }
    ]

    const { data, error } = await supabase
      .from('groups')
      .insert(groups)
      .select()

    if (error) {
      console.log(`❌ groups 테이블 생성/삽입 실패: ${error.message}`)
    } else {
      console.log(`✅ groups 테이블 생성 성공 (${data.length}개 레코드)`)
    }
  } catch (err) {
    console.log(`⚠️ groups 테이블 처리 중 오류: ${err.message}`)
  }

  // 3. profiles 테이블 확장 (테스트 사용자 생성)
  console.log('👤 3. profiles 테이블 확장 중...')
  try {
    // 기존 프로필이 있는지 확인
    const { data: existingProfiles, error: selectError } = await supabase
      .from('profiles')
      .select('*')

    if (selectError) {
      console.log(`❌ profiles 테이블 조회 실패: ${selectError.message}`)
    } else {
      console.log(`ℹ️ 기존 profiles 레코드: ${existingProfiles.length}개`)

      // 테스트 사용자가 없으면 생성 (실제 사용자 ID 필요)
      if (existingProfiles.length === 0) {
        console.log('⚠️ profiles 테이블이 비어있음 - 실제 사용자 로그인 후 자동 생성됨')
      } else {
        // 기존 사용자에게 포인트 시스템 데이터 추가
        for (const profile of existingProfiles) {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              points: 1250,
              level: 3,
              ranking: 42,
              next_badge_points: 250,
              followers_count: 15,
              following_count: 23
            })
            .eq('id', profile.id)
            .select()

          if (error) {
            console.log(`❌ profile ${profile.id} 업데이트 실패: ${error.message}`)
          } else {
            console.log(`✅ profile ${profile.id} 포인트 시스템 데이터 추가`)
          }
        }
      }
    }
  } catch (err) {
    console.log(`⚠️ profiles 테이블 처리 중 오류: ${err.message}`)
  }

  // 4. 테이블 존재 확인
  console.log('\n🔍 테이블 생성 확인...')

  const tables = [
    { name: 'profiles', description: '사용자 프로필' },
    { name: 'categories', description: '카테고리' },
    { name: 'groups', description: '그룹' }
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(3)

      if (error) {
        console.log(`❌ ${table.name}: ${error.message}`)
      } else {
        console.log(`✅ ${table.name}: ${data.length}개 레코드 존재 (${table.description})`)
        if (data.length > 0) {
          console.log(`   └─ 샘플: ${JSON.stringify(data[0]).substring(0, 100)}...`)
        }
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ${err.message}`)
    }
  }

  console.log('\n🏁 필수 테이블 생성 완료!')
  console.log('\n💡 다음 단계: 사이드바에서 이 실제 데이터를 사용하도록 컴포넌트 수정')
}

createTables()