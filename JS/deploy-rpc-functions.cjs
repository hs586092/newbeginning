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
    
    // SQL 직접 실행하는 다른 방법 시도
    console.log('🔄 Supabase 연결 및 함수 제거 중...');
    
    // 먼저 Supabase에 직접 SQL을 실행하는 대신 
    // 더 직접적인 방법으로 함수들을 제거
    const dropAllSQL = dropFunctions.join('\n');
    console.log('실행할 DROP SQL:', dropAllSQL);
    
    // 전체 SQL 파일을 한 번에 실행
    console.log('🔧 전체 SQL 파일 실행 중...');
    
    // SQL 내용을 실행 가능한 형태로 정리
    const cleanedSQL = sqlContent
      .replace(/--.*$/gm, '') // 주석 제거
      .replace(/\n\s*\n/g, '\n') // 빈 줄 제거
      .trim();
    
    console.log('📝 정리된 SQL 길이:', cleanedSQL.length);
    
    // PostgreSQL 연결을 위한 pg 라이브러리 대신 
    // Supabase 클라이언트로 직접 실행
    const { data, error } = await supabase
      .from('_supabase_functions') // 메타데이터 테이블 확인
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('ℹ️  메타데이터 테이블 접근 불가 (정상적임):', error.message);
    }
    
    // get_post_comments 함수를 직접 테스트해보자
    console.log('🧪 get_post_comments 함수 직접 테스트...');
    
    const testPostId = '00000000-0000-0000-0000-000000000001';
    
    const { data: testData, error: testError } = await supabase
      .rpc('get_post_comments', { p_post_id: testPostId });
    
    if (testError) {
      console.error('❌ 함수 테스트 실패:', testError.message);
      
      // 함수가 없다면 SQL 실행 시도
      if (testError.message.includes('Could not find the function') || 
          testError.message.includes('schema cache')) {
        
        console.log('🔨 함수가 없으므로 SQL을 개별적으로 실행합니다...');
        
        // SQL을 문장별로 분리하여 실행
        const statements = cleanedSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt && stmt.length > 10)
          .filter(stmt => !stmt.match(/^SELECT\s+'.*'\s+as\s+result/i));
        
        console.log(`📊 ${statements.length}개의 SQL 문장을 실행합니다.`);
        
        // 각 문장을 순차적으로 실행
        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i] + ';';
          
          console.log(`\n[${i + 1}/${statements.length}] 실행 중...`);
          console.log('SQL 미리보기:', stmt.substring(0, 100) + '...');
          
          try {
            // PostgreSQL 연결이 필요한 부분 - 다른 방법 시도
            console.log('⏭️  SQL 문장 건너뛰기 (직접 실행 필요)');
          } catch (err) {
            console.error('오류:', err.message);
          }
        }
        
        console.log('\n⚠️  SQL 문장들을 Supabase Dashboard에서 직접 실행해야 합니다.');
        console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/' + 
                   process.env.NEXT_PUBLIC_SUPABASE_URL.split('://')[1].split('.')[0]);
        
        return { 
          success: false, 
          error: '함수를 찾을 수 없어 수동 배포가 필요합니다.',
          sql: cleanedSQL
        };
      }
      
      throw testError;
    } else {
      console.log('✅ get_post_comments 함수가 이미 존재하고 정상 작동합니다!');
      console.log('📊 테스트 결과:', testData || []);
      
      return { success: true, message: 'get_post_comments 함수가 정상 작동합니다.' };
    }
    
  } catch (error) {
    console.error('💥 RPC 함수 배포 중 오류:', error.message);
    return { success: false, error: error.message };
  }
}

// 메인 실행
if (require.main === module) {
  deployRPCFunctions()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 성공:', result.message);
        process.exit(0);
      } else {
        console.error('\n💀 실패:', result.error);
        if (result.sql) {
          console.log('\n📋 수동으로 실행할 SQL:');
          console.log('=' .repeat(50));
          console.log(result.sql);
          console.log('=' .repeat(50));
        }
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 예상치 못한 오류:', error);
      process.exit(1);
    });
}

module.exports = { deployRPCFunctions };