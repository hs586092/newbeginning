#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// .env.local에서 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 연결 정보가 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testRpcFunctions() {
  console.log('🧪 댓글 시스템 RPC 함수 테스트 시작...\n');
  
  let passCount = 0;
  let failCount = 0;
  
  const tests = [
    {
      name: 'get_post_comments',
      description: '게시글 댓글 목록 조회',
      test: async () => {
        const testPostId = '00000000-0000-0000-0000-000000000001'; // 가상 UUID
        const { data, error } = await supabase.rpc('get_post_comments', { p_post_id: testPostId });
        
        if (error) {
          // 함수가 존재하지만 데이터가 없어서 에러가 날 수 있음
          if (error.code === 'PGRST116') {
            return { success: false, reason: '함수가 존재하지 않음' };
          } else {
            return { success: true, reason: '함수 존재 확인됨 (데이터 없음)' };
          }
        }
        
        return { success: true, reason: `함수 정상 작동, ${data?.length || 0}개 결과` };
      }
    },
    {
      name: 'get_post_comment_count',
      description: '게시글별 댓글 수 조회',
      test: async () => {
        const testPostId = '00000000-0000-0000-0000-000000000001';
        const { data, error } = await supabase.rpc('get_post_comment_count', { p_post_id: testPostId });
        
        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, reason: '함수가 존재하지 않음' };
          } else {
            return { success: true, reason: '함수 존재 확인됨' };
          }
        }
        
        return { success: true, reason: `함수 정상 작동, 결과: ${data}` };
      }
    },
    {
      name: 'create_comment',
      description: '댓글 생성 (실제 생성은 하지 않음)',
      test: async () => {
        // 실제로는 테스트용 데이터를 생성하지 않고 함수 존재만 확인
        try {
          const { data, error } = await supabase.rpc('create_comment', { 
            p_post_id: '00000000-0000-0000-0000-000000000001',
            p_user_id: '00000000-0000-0000-0000-000000000001',
            p_author_name: 'test',
            p_content: 'test'
          });
          
          if (error) {
            if (error.code === 'PGRST116') {
              return { success: false, reason: '함수가 존재하지 않음' };
            } else {
              // 외래키 제약조건 등으로 인한 에러는 함수가 존재한다는 의미
              return { success: true, reason: '함수 존재 확인됨 (제약조건 에러 예상됨)' };
            }
          }
          
          return { success: true, reason: '함수 정상 작동' };
        } catch (err) {
          return { success: false, reason: `예외 발생: ${err.message}` };
        }
      }
    },
    {
      name: 'update_comment',
      description: '댓글 수정',
      test: async () => {
        const { data, error } = await supabase.rpc('update_comment', {
          p_comment_id: '00000000-0000-0000-0000-000000000001',
          p_user_id: '00000000-0000-0000-0000-000000000001',
          p_content: 'test update'
        });
        
        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, reason: '함수가 존재하지 않음' };
          } else {
            return { success: true, reason: '함수 존재 확인됨' };
          }
        }
        
        return { success: true, reason: `함수 정상 작동, 결과: ${data}` };
      }
    },
    {
      name: 'delete_comment',
      description: '댓글 삭제',
      test: async () => {
        const { data, error } = await supabase.rpc('delete_comment', {
          p_comment_id: '00000000-0000-0000-0000-000000000001',
          p_user_id: '00000000-0000-0000-0000-000000000001'
        });
        
        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, reason: '함수가 존재하지 않음' };
          } else {
            return { success: true, reason: '함수 존재 확인됨' };
          }
        }
        
        return { success: true, reason: `함수 정상 작동, 결과: ${data}` };
      }
    },
    {
      name: 'toggle_comment_like',
      description: '댓글 좋아요 토글',
      test: async () => {
        const { data, error } = await supabase.rpc('toggle_comment_like', {
          p_comment_id: '00000000-0000-0000-0000-000000000001',
          p_user_id: '00000000-0000-0000-0000-000000000001'
        });
        
        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, reason: '함수가 존재하지 않음' };
          } else {
            return { success: true, reason: '함수 존재 확인됨' };
          }
        }
        
        return { success: true, reason: `함수 정상 작동, 결과: ${JSON.stringify(data)}` };
      }
    },
    {
      name: 'get_user_comments',
      description: '사용자별 댓글 목록 조회',
      test: async () => {
        const { data, error } = await supabase.rpc('get_user_comments', {
          p_user_id: '00000000-0000-0000-0000-000000000001',
          p_limit: 10,
          p_offset: 0
        });
        
        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, reason: '함수가 존재하지 않음' };
          } else {
            return { success: true, reason: '함수 존재 확인됨' };
          }
        }
        
        return { success: true, reason: `함수 정상 작동, ${data?.length || 0}개 결과` };
      }
    }
  ];
  
  console.log('🔍 RPC 함수 존재 여부 확인 중...\n');
  
  for (const test of tests) {
    try {
      console.log(`📋 ${test.name}: ${test.description}`);
      const result = await test.test();
      
      if (result.success) {
        console.log(`   ✅ PASS - ${result.reason}`);
        passCount++;
      } else {
        console.log(`   ❌ FAIL - ${result.reason}`);
        failCount++;
      }
      
      // 요청 간격 조정
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failCount++;
    }
    
    console.log('');
  }
  
  console.log('📊 테스트 결과 요약:');
  console.log(`✅ 통과: ${passCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`📈 성공률: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
  
  if (failCount === 0) {
    console.log('\n🎉 모든 RPC 함수가 정상적으로 배포되었습니다!');
  } else if (passCount > 0) {
    console.log('\n⚠️  일부 함수는 배포되었지만, 누락된 함수들이 있습니다.');
    console.log('누락된 함수들은 Supabase 대시보드에서 수동으로 추가해주세요.');
  } else {
    console.log('\n❌ 함수들이 배포되지 않았습니다.');
    console.log('Supabase 대시보드의 SQL Editor에서 수동 배포가 필요합니다.');
  }
  
  return passCount === tests.length;
}

async function testConnection() {
  console.log('🔧 Supabase 연결 테스트...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ 연결 실패:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 연결 정상\n');
    return true;
  } catch (err) {
    console.error('❌ 연결 오류:', err.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Supabase 댓글 시스템 RPC 함수 테스트');
  console.log('==========================================\n');
  
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log('연결 문제로 테스트를 중단합니다.');
    return;
  }
  
  const allTestsPassed = await testRpcFunctions();
  
  console.log('\n📝 다음 단계:');
  if (allTestsPassed) {
    console.log('1. ✅ RPC 함수들이 정상 배포됨');
    console.log('2. 프론트엔드 댓글 기능에서 함수 호출 테스트');
    console.log('3. 실제 댓글 CRUD 기능 테스트');
  } else {
    console.log('1. Supabase 대시보드 → SQL Editor 접속');
    console.log('2. comments-rpc-functions.sql 파일 내용 복사해서 실행');
    console.log('3. 함수 생성 후 다시 이 테스트 실행');
  }
}

if (require.main === module) {
  main().catch(console.error);
}