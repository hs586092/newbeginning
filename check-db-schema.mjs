// 현재 데이터베이스 스키마 확인 스크립트
import { createClient } from '@supabase/supabase-js'

async function checkDatabaseSchema() {
  const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 데이터베이스 스키마 확인 중...\n')

  try {
    // 1. 현재 테이블 목록 확인
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (tablesError) {
      console.error('❌ 테이블 목록 조회 실패:', tablesError)
    } else {
      console.log('📋 현재 데이터베이스 테이블들:')
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`)
      })
      console.log('')
    }

    // 2. posts 테이블 샘플 데이터 확인
    console.log('📝 posts 테이블 샘플 데이터:')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, author_name, created_at')
      .limit(3)

    if (postsError) {
      console.error('❌ posts 데이터 조회 실패:', postsError)
    } else {
      posts.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.title}" by ${post.author_name}`)
      })
      console.log('')
    }

    // 3. users 테이블 확인 (profiles)
    console.log('👤 사용자 프로필 테이블 확인:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, points, level')
      .limit(3)

    if (profilesError) {
      console.error('❌ profiles 테이블 없음 또는 조회 실패:', profilesError.message)
    } else {
      console.log('✅ profiles 테이블 존재:')
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.username} (포인트: ${profile.points}, 레벨: ${profile.level})`)
      })
      console.log('')
    }

    // 4. groups 테이블 확인
    console.log('👥 그룹 테이블 확인:')
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, member_count, description')
      .limit(3)

    if (groupsError) {
      console.error('❌ groups 테이블 없음:', groupsError.message)
    } else {
      console.log('✅ groups 테이블 존재:')
      groups.forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.name} (멤버: ${group.member_count}명)`)
      })
      console.log('')
    }

    // 5. categories 테이블 확인
    console.log('📂 카테고리 테이블 확인:')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, post_count, is_hot')
      .limit(5)

    if (categoriesError) {
      console.error('❌ categories 테이블 없음:', categoriesError.message)
    } else {
      console.log('✅ categories 테이블 존재:')
      categories.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (게시글: ${category.post_count}개) ${category.is_hot ? '🔥' : ''}`)
      })
      console.log('')
    }

    // 6. chat 관련 테이블들 확인
    console.log('💬 채팅 관련 테이블 확인:')
    const chatTables = ['chat_rooms', 'messages', 'chat_room_members']

    for (const tableName of chatTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`❌ ${tableName} 테이블 없음`)
      } else {
        console.log(`✅ ${tableName} 테이블 존재`)
      }
    }

  } catch (error) {
    console.error('🚨 전체 스키마 확인 실패:', error)
  }

  console.log('\n🏁 데이터베이스 스키마 확인 완료!')
}

checkDatabaseSchema()