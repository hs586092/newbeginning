import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 테스트 UUID 생성
const testPostId = '11111111-1111-1111-1111-111111111111';
const testUserId = '22222222-2222-2222-2222-222222222222';

async function fullSystemTest() {
  console.log('🚀 댓글 시스템 전체 통합 테스트 시작');
  console.log('=' .repeat(60));
  
  let testResults = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // 1. RPC 함수 존재 확인
  console.log('\n🔍 1. RPC 함수 존재 확인');
  try {
    const { data, error } = await supabase.rpc('get_post_comments', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ get_post_comments 함수 오류:', error.message);
      testResults.failed++;
      testResults.details.push('get_post_comments 함수 접근 실패');
    } else {
      console.log('✅ get_post_comments 함수 정상 작동');
      testResults.passed++;
      testResults.details.push('get_post_comments 함수 작동 확인');
    }
  } catch (err) {
    console.log('❌ RPC 함수 테스트 실패:', err.message);
    testResults.failed++;
    testResults.details.push('RPC 함수 네트워크 오류');
  }
  
  // 2. 댓글 생성 테스트
  console.log('\n💬 2. 댓글 생성 테스트');
  let createdCommentId = null;
  
  try {
    const { data: commentId, error } = await supabase.rpc('create_comment', {
      p_post_id: testPostId,
      p_user_id: testUserId,
      p_author_name: 'Test User',
      p_content: '테스트 댓글입니다! 🎉',
      p_parent_comment_id: null
    });
    
    if (error) {
      console.log('❌ 댓글 생성 실패:', error.message);
      testResults.failed++;
      testResults.details.push('댓글 생성 실패');
    } else {
      console.log('✅ 댓글 생성 성공:', commentId);
      createdCommentId = commentId;
      testResults.passed++;
      testResults.details.push('댓글 생성 성공');
    }
  } catch (err) {
    console.log('❌ 댓글 생성 오류:', err.message);
    testResults.failed++;
    testResults.details.push('댓글 생성 네트워크 오류');
  }
  
  // 3. 댓글 목록 조회 테스트
  console.log('\n📋 3. 댓글 목록 조회 테스트');
  try {
    const { data: comments, error } = await supabase.rpc('get_post_comments', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ 댓글 조회 실패:', error.message);
      testResults.failed++;
      testResults.details.push('댓글 조회 실패');
    } else {
      console.log(`✅ 댓글 조회 성공: ${comments.length}개`);
      
      if (comments.length > 0) {
        console.log('📝 첫 번째 댓글 정보:');
        const comment = comments[0];
        console.log(`   - ID: ${comment.id}`);
        console.log(`   - 작성자: ${comment.author_name}`);
        console.log(`   - 내용: ${comment.content}`);
        console.log(`   - 프로필: ${comment.profile_username || 'N/A'}`);
        console.log(`   - 답글 수: ${comment.reply_count}`);
        console.log(`   - 좋아요 수: ${comment.like_count}`);
      }
      
      testResults.passed++;
      testResults.details.push(`댓글 조회 성공 (${comments.length}개)`);
    }
  } catch (err) {
    console.log('❌ 댓글 조회 오류:', err.message);
    testResults.failed++;
    testResults.details.push('댓글 조회 네트워크 오류');
  }
  
  // 4. 댓글 수정 테스트 (생성된 댓글이 있을 경우)
  if (createdCommentId) {
    console.log('\n✏️ 4. 댓글 수정 테스트');
    try {
      const { data: updated, error } = await supabase.rpc('update_comment', {
        p_comment_id: createdCommentId,
        p_user_id: testUserId,
        p_content: '수정된 테스트 댓글입니다! ✨'
      });
      
      if (error) {
        console.log('❌ 댓글 수정 실패:', error.message);
        testResults.failed++;
        testResults.details.push('댓글 수정 실패');
      } else {
        console.log('✅ 댓글 수정 성공:', updated);
        testResults.passed++;
        testResults.details.push('댓글 수정 성공');
      }
    } catch (err) {
      console.log('❌ 댓글 수정 오류:', err.message);
      testResults.failed++;
      testResults.details.push('댓글 수정 네트워크 오류');
    }
  }
  
  // 5. 댓글 수 조회 테스트
  console.log('\n🔢 5. 댓글 수 조회 테스트');
  try {
    const { data: count, error } = await supabase.rpc('get_post_comment_count', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ 댓글 수 조회 실패:', error.message);
      testResults.failed++;
      testResults.details.push('댓글 수 조회 실패');
    } else {
      console.log(`✅ 댓글 수 조회 성공: ${count}개`);
      testResults.passed++;
      testResults.details.push(`댓글 수 조회 성공 (${count}개)`);
    }
  } catch (err) {
    console.log('❌ 댓글 수 조회 오류:', err.message);
    testResults.failed++;
    testResults.details.push('댓글 수 조회 네트워크 오류');
  }
  
  // 6. 데이터 정리 (생성된 테스트 댓글 삭제)
  if (createdCommentId) {
    console.log('\n🗑️ 6. 테스트 데이터 정리');
    try {
      const { data: deleted, error } = await supabase.rpc('delete_comment', {
        p_comment_id: createdCommentId,
        p_user_id: testUserId
      });
      
      if (error) {
        console.log('⚠️ 테스트 댓글 삭제 실패:', error.message);
        console.log('💡 수동으로 테스트 데이터를 정리해주세요.');
      } else {
        console.log('✅ 테스트 데이터 정리 완료');
      }
    } catch (err) {
      console.log('⚠️ 테스트 데이터 정리 오류:', err.message);
    }
  }
  
  // 7. 최종 결과 출력
  console.log('\n' + '=' .repeat(60));
  console.log('📊 전체 시스템 테스트 결과');
  console.log('=' .repeat(60));
  
  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? (testResults.passed / totalTests * 100).toFixed(1) : 0;
  
  console.log(`🎯 총 테스트: ${totalTests}개`);
  console.log(`✅ 성공: ${testResults.passed}개`);
  console.log(`❌ 실패: ${testResults.failed}개`);
  console.log(`📈 성공률: ${successRate}%`);
  
  console.log('\n📝 테스트 세부 내역:');
  testResults.details.forEach((detail, index) => {
    console.log(`   ${index + 1}. ${detail}`);
  });
  
  if (testResults.failed === 0) {
    console.log('\n🎉 모든 테스트 통과! 댓글 시스템이 완전히 작동합니다.');
    console.log('💡 이제 localhost에서 실제 사용자 테스트를 해보세요!');
  } else {
    console.log('\n⚠️ 일부 테스트가 실패했습니다. 문제를 해결해주세요.');
  }
  
  console.log('\n🌐 프론트엔드 테스트 가이드:');
  console.log('1. 브라우저에서 localhost:3000 접속');
  console.log('2. 소셜 피드 페이지로 이동');
  console.log('3. 게시글의 댓글 버튼 클릭');
  console.log('4. 댓글 작성/수정/삭제 기능 테스트');
  console.log('5. 중첩댓글 (답글) 기능 테스트');
  
  return testResults;
}

fullSystemTest().catch(console.error);