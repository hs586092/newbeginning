const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정 (서비스 롤 키 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testExistingFunctions() {
  try {
    console.log('🧪 기존 RPC 함수들 테스트 중...');
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const testPostId = '00000000-0000-0000-0000-000000000001';
    
    // 1. get_post_comments 함수 테스트
    console.log('\n1️⃣  get_post_comments 함수 테스트...');
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .rpc('get_post_comments', { p_post_id: testPostId });
      
      if (commentsError) {
        console.log('❌ get_post_comments:', commentsError.message);
      } else {
        console.log('✅ get_post_comments: 작동 중 (결과:', commentsData?.length || 0, '개)');
      }
    } catch (err) {
      console.log('❌ get_post_comments 테스트 실패:', err.message);
    }
    
    // 2. get_post_comment_count 함수 테스트
    console.log('\n2️⃣  get_post_comment_count 함수 테스트...');
    try {
      const { data: countData, error: countError } = await supabase
        .rpc('get_post_comment_count', { p_post_id: testPostId });
      
      if (countError) {
        console.log('❌ get_post_comment_count:', countError.message);
      } else {
        console.log('✅ get_post_comment_count: 작동 중 (결과:', countData, ')');
      }
    } catch (err) {
      console.log('❌ get_post_comment_count 테스트 실패:', err.message);
    }
    
    // 3. create_comment 함수 테스트 (실제로는 생성하지 않고 구조만 확인)
    console.log('\n3️⃣  create_comment 함수 존재 여부 확인...');
    try {
      // 잘못된 파라미터로 호출해서 함수 존재 여부만 확인
      const { data, error } = await supabase
        .rpc('create_comment', { 
          p_post_id: null, 
          p_user_id: null, 
          p_author_name: null, 
          p_content: null 
        });
      
      if (error) {
        if (error.message.includes('Could not find the function')) {
          console.log('❌ create_comment: 함수가 존재하지 않음');
        } else {
          console.log('✅ create_comment: 함수 존재함 (오류:', error.message.substring(0, 50) + '...)');
        }
      } else {
        console.log('✅ create_comment: 함수 존재함');
      }
    } catch (err) {
      console.log('❌ create_comment 테스트 실패:', err.message);
    }
    
    // 4. 댓글 테이블에 직접 접근해보기
    console.log('\n4️⃣  comments 테이블 직접 확인...');
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('comments')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log('❌ comments 테이블:', tableError.message);
      } else {
        console.log('✅ comments 테이블: 접근 가능 (행 수:', tableData?.length || 0, ')');
      }
    } catch (err) {
      console.log('❌ comments 테이블 테스트 실패:', err.message);
    }
    
    // 5. profiles 테이블 확인
    console.log('\n5️⃣  profiles 테이블 확인...');
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profileError) {
        console.log('❌ profiles 테이블:', profileError.message);
      } else {
        console.log('✅ profiles 테이블: 접근 가능 (행 수:', profileData?.length || 0, ')');
      }
    } catch (err) {
      console.log('❌ profiles 테이블 테스트 실패:', err.message);
    }
    
    console.log('\n📋 결론:');
    console.log('- get_post_comments 함수가 작동하지 않는다면 수동 배포가 필요합니다');
    console.log('- Dashboard SQL Editor: https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new');
    console.log('- 실행할 파일: comments-rpc-functions.sql');
    
    return { success: true };
    
  } catch (error) {
    console.error('💥 테스트 중 오류:', error.message);
    return { success: false, error: error.message };
  }
}

// 메인 실행
if (require.main === module) {
  testExistingFunctions()
    .then(result => {
      if (result.success) {
        console.log('\n✅ 테스트 완료');
        process.exit(0);
      } else {
        console.error('\n❌ 테스트 실패:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 예상치 못한 오류:', error);
      process.exit(1);
    });
}

module.exports = { testExistingFunctions };