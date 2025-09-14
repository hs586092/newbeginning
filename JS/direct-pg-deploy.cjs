const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployWithDirectPG() {
  let client;
  
  try {
    console.log('🚀 PostgreSQL 직접 연결을 통한 RPC 함수 배포...');
    
    // Supabase URL에서 프로젝트 ID 추출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const projectId = supabaseUrl.replace('https://', '').split('.')[0];
    
    console.log('📍 프로젝트 ID:', projectId);
    
    // PostgreSQL 연결 설정
    const connectionConfig = {
      host: `${projectId}.supabase.co`,
      port: 6543, // Supabase의 기본 PostgreSQL 포트
      database: 'postgres',
      user: 'postgres',
      password: '', // 비밀번호는 사용자에게 요청해야 함
      ssl: {
        rejectUnauthorized: false
      }
    };
    
    console.log('🔑 PostgreSQL 연결을 위한 데이터베이스 비밀번호가 필요합니다.');
    console.log('📍 Supabase Dashboard → Settings → Database → Connection string에서 확인 가능');
    console.log('');
    console.log('비밀번호를 알고 있다면 SUPABASE_DB_PASSWORD 환경변수를 설정하거나');
    console.log('아래 대안 방법을 사용해주세요:');
    console.log('');
    console.log('🎯 대안 방법: Supabase Dashboard SQL Editor 사용');
    console.log('1. 브라우저에서 아래 링크를 열어주세요:');
    console.log('   https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new');
    console.log('');
    console.log('2. comments-rpc-functions.sql 파일의 내용을 복사해서 실행해주세요');
    
    // SQL 파일 읽기
    const sqlFilePath = path.join(__dirname, 'comments-rpc-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('');
    console.log('📄 실행할 SQL (미리보기):');
    console.log('=' .repeat(60));
    console.log(sqlContent.substring(0, 500) + '...');
    console.log('=' .repeat(60));
    
    // 환경변수에서 비밀번호 확인
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    
    if (!dbPassword) {
      console.log('');
      console.log('⚠️  SUPABASE_DB_PASSWORD 환경변수가 설정되지 않았습니다.');
      console.log('');
      console.log('💡 간단한 해결방법:');
      console.log('1. .env.local 파일에 SUPABASE_DB_PASSWORD="YOUR_PASSWORD" 추가');
      console.log('2. 또는 Supabase Dashboard SQL Editor를 사용해서 수동 실행');
      console.log('');
      
      return { 
        success: false, 
        error: '데이터베이스 비밀번호가 필요합니다.',
        sql_content: sqlContent,
        dashboard_url: 'https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new'
      };
    }
    
    // 비밀번호가 있으면 실제 연결 시도
    connectionConfig.password = dbPassword;
    
    console.log('🔌 PostgreSQL에 연결 중...');
    client = new Client(connectionConfig);
    await client.connect();
    
    console.log('✅ PostgreSQL 연결 성공');
    
    // SQL 실행
    console.log('🔧 RPC 함수들 배포 중...');
    await client.query(sqlContent);
    
    console.log('✅ RPC 함수들 배포 완료');
    
    // 테스트
    console.log('🧪 get_post_comments 함수 테스트 중...');
    const testResult = await client.query(
      "SELECT get_post_comments('00000000-0000-0000-0000-000000000001'::UUID)"
    );
    
    console.log('✅ 함수 테스트 성공!');
    console.log('📊 테스트 결과:', testResult.rows.length, '개 행');
    
    return { success: true, message: '모든 RPC 함수가 성공적으로 배포되었습니다.' };
    
  } catch (error) {
    console.error('💥 배포 중 오류:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('');
      console.log('🔐 비밀번호 인증에 실패했습니다.');
      console.log('💡 Supabase Dashboard에서 비밀번호를 확인해주세요:');
      console.log('   https://supabase.com/dashboard/project/spgcihtrquywmaieflue/settings/database');
    }
    
    return { success: false, error: error.message };
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// 메인 실행
if (require.main === module) {
  deployWithDirectPG()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 성공:', result.message);
        process.exit(0);
      } else {
        console.error('\n💀 실패:', result.error);
        if (result.dashboard_url) {
          console.log('\n🌐 수동 배포 링크:', result.dashboard_url);
        }
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 예상치 못한 오류:', error);
      process.exit(1);
    });
}

module.exports = { deployWithDirectPG };