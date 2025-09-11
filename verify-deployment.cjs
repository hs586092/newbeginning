const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyDeployment() {
  console.log('🔍 RPC 함수 배포 검증 시작...');
  console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const results = {
    functions_working: 0,
    functions_total: 8,
    details: []
  };
  
  const testPostId = '00000000-0000-0000-0000-000000000001';
  const testUserId = '00000000-0000-0000-0000-000000000001';
  
  // 테스트할 함수들
  const functionTests = [
    {
      name: 'get_post_comments',
      test: () => supabase.rpc('get_post_comments', { p_post_id: testPostId }),
      expected: 'array'
    },
    {
      name: 'get_post_comment_count', 
      test: () => supabase.rpc('get_post_comment_count', { p_post_id: testPostId }),
      expected: 'number'
    },
    {
      name: 'create_comment',
      test: () => supabase.rpc('create_comment', { 
        p_post_id: null, p_user_id: null, p_author_name: null, p_content: null 
      }),
      expected: 'error_but_exists' // NULL 값이므로 오류가 나지만 함수는 존재
    },
    {
      name: 'update_comment',
      test: () => supabase.rpc('update_comment', { 
        p_comment_id: testPostId, p_user_id: testUserId, p_content: 'test' 
      }),
      expected: 'boolean'
    },
    {
      name: 'delete_comment',
      test: () => supabase.rpc('delete_comment', { 
        p_comment_id: testPostId, p_user_id: testUserId 
      }),
      expected: 'boolean'
    },
    {
      name: 'toggle_comment_like',
      test: () => supabase.rpc('toggle_comment_like', { 
        p_comment_id: testPostId, p_user_id: testUserId 
      }),
      expected: 'object'
    },
    {
      name: 'get_user_comments',
      test: () => supabase.rpc('get_user_comments', { 
        p_user_id: testUserId, p_limit: 10, p_offset: 0 
      }),
      expected: 'array'
    }
  ];
  
  console.log('\n📊 함수별 테스트 결과:');
  console.log('=' .repeat(60));
  
  for (const { name, test, expected } of functionTests) {
    try {
      const { data, error } = await test();
      
      if (error) {
        if (error.message.includes('Could not find the function')) {
          console.log(`❌ ${name}: 함수가 존재하지 않음`);
          results.details.push({ name, status: 'missing', error: error.message });
        } else {
          // 함수는 존재하지만 파라미터 오류 등
          console.log(`✅ ${name}: 함수 존재함 (파라미터 오류: ${error.message.substring(0, 50)}...)`);
          results.functions_working++;
          results.details.push({ name, status: 'exists', note: 'parameter_error_expected' });
        }
      } else {
        // 성공적으로 실행됨
        const dataType = Array.isArray(data) ? 'array' : typeof data;
        console.log(`✅ ${name}: 정상 작동 (반환 타입: ${dataType}, 값: ${JSON.stringify(data).substring(0, 50)}...)`);
        results.functions_working++;
        results.details.push({ name, status: 'working', dataType, data });
      }
    } catch (err) {
      console.log(`❌ ${name}: 테스트 실패 - ${err.message}`);
      results.details.push({ name, status: 'error', error: err.message });
    }
  }
  
  console.log('=' .repeat(60));
  console.log(`\n📈 배포 결과 요약:`);
  console.log(`✅ 작동 중인 함수: ${results.functions_working}/${results.functions_total}`);
  console.log(`📊 성공률: ${Math.round((results.functions_working / results.functions_total) * 100)}%`);
  
  if (results.functions_working === results.functions_total) {
    console.log('\n🎉 모든 RPC 함수가 성공적으로 배포되었습니다!');
    console.log('✨ 스키마 캐시 문제가 해결되었습니다.');
    console.log('🚀 이제 댓글 시스템을 사용할 수 있습니다.');
  } else if (results.functions_working > 0) {
    console.log('\n⚠️  일부 함수만 배포되었습니다.');
    console.log('🔧 누락된 함수들을 다시 배포해주세요.');
  } else {
    console.log('\n❌ RPC 함수들이 배포되지 않았습니다.');
    console.log('📋 수동 배포 가이드를 참고해주세요: manual-deployment-guide.md');
    console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new');
  }
  
  return results;
}

// 메인 실행
if (require.main === module) {
  verifyDeployment()
    .then(results => {
      if (results.functions_working === results.functions_total) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 검증 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { verifyDeployment };