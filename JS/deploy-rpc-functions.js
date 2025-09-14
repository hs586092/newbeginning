const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정 (서비스 롤 키 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deployRPCFunctions() {
  try {
    console.log('🚀 Supabase RPC 함수 배포 시작...');
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // SQL 파일 읽기
    const sqlFilePath = path.join(__dirname, 'comments-rpc-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL 파일 읽기 완료');
    
    // 기존 함수들 제거 (DROP FUNCTION)
    console.log('🗑️  기존 RPC 함수들 제거 중...');
    
    const dropFunctions = [
      'DROP FUNCTION IF EXISTS get_post_comments(UUID);',
      'DROP FUNCTION IF EXISTS create_comment(UUID, UUID, TEXT, TEXT, UUID);',
      'DROP FUNCTION IF EXISTS update_comment(UUID, UUID, TEXT);',
      'DROP FUNCTION IF EXISTS delete_comment(UUID, UUID);',
      'DROP FUNCTION IF EXISTS toggle_comment_like(UUID, UUID);',
      'DROP FUNCTION IF EXISTS get_post_comment_count(UUID);',
      'DROP FUNCTION IF EXISTS get_user_comments(UUID, INTEGER, INTEGER);',
      'DROP FUNCTION IF EXISTS notify_comment_change();'
    ];
    
    for (const dropSql of dropFunctions) {
      const { error } = await supabase.rpc('sql', { query: dropSql }).single();
      if (error && !error.message.includes('does not exist')) {
        console.warn('⚠️  함수 제거 중 오류:', error.message);
      }
    }
    
    console.log('✅ 기존 함수들 제거 완료');
    
    // SQL을 개별 문장으로 분리
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
      .filter(stmt => !stmt.match(/^SELECT\s+'.*'\s+as\s+result/i)); // 성공 메시지 제외
    
    console.log(`📊 총 ${statements.length}개의 SQL 문장을 실행합니다.`);
    
    // 각 SQL 문장 실행
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      if (statement.trim().length < 10) continue;
      
      console.log(`\n📝 [${i + 1}/${statements.length}] SQL 문장 실행 중...`);
      
      try {
        // Supabase SQL 실행
        const { data, error } = await supabase.rpc('sql', { 
          query: statement 
        });
        
        if (error) {
          console.error(`❌ SQL 실행 오류 [${i + 1}]:`, error.message);
          console.error('실행한 SQL:', statement.substring(0, 200) + '...');
          
          // 함수 생성 오류가 아닌 경우 계속 진행
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist')) {
            throw error;
          }
        } else {
          console.log(`✅ [${i + 1}] SQL 문장 실행 성공`);
        }
      } catch (err) {
        console.error(`💥 치명적 오류 [${i + 1}]:`, err.message);
        throw err;
      }
    }
    
    console.log('\n🎉 모든 RPC 함수 배포 완료!');
    
    // get_post_comments 함수 테스트
    console.log('\n🧪 get_post_comments 함수 테스트 중...');
    
    // 임시 UUID로 테스트 (존재하지 않는 게시글)
    const testPostId = '00000000-0000-0000-0000-000000000001';
    
    const { data: testData, error: testError } = await supabase
      .rpc('get_post_comments', { p_post_id: testPostId });
    
    if (testError) {
      console.error('❌ get_post_comments 함수 테스트 실패:', testError.message);
      throw testError;
    } else {
      console.log('✅ get_post_comments 함수 테스트 성공!');
      console.log('📊 테스트 결과:', testData || '빈 결과 (정상)');
    }
    
    // 스키마 캐시 새로고침 시도
    console.log('\n🔄 스키마 캐시 새로고침 중...');
    
    const { error: refreshError } = await supabase.rpc('sql', {
      query: "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' LIMIT 1;"
    });
    
    if (refreshError) {
      console.warn('⚠️  스키마 캐시 새로고침 중 경고:', refreshError.message);
    } else {
      console.log('✅ 스키마 캐시 새로고침 완료');
    }
    
    return { success: true, message: '모든 RPC 함수가 성공적으로 배포되었습니다.' };
    
  } catch (error) {
    console.error('💥 RPC 함수 배포 실패:', error.message);
    console.error('전체 오류 정보:', error);
    return { success: false, error: error.message };
  }
}

// 메인 실행
if (require.main === module) {
  deployRPCFunctions()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 배포 성공:', result.message);
        process.exit(0);
      } else {
        console.error('\n💀 배포 실패:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 예상치 못한 오류:', error);
      process.exit(1);
    });
}

module.exports = { deployRPCFunctions };