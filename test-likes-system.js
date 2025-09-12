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

// 테스트 UUID 사용 (댓글 시스템에서 사용한 동일한 ID)
const testPostId = '11111111-1111-1111-1111-111111111111';
const testUserId = 'fd29f3c1-7bcc-4f63-b5d9-4c1ce8dffc26';

async function testLikeSystem() {
  console.log('🚀 좋아요 시스템 RPC 함수 테스트 시작');
  console.log('=' .repeat(60));
  
  let testResults = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // 1. RPC 함수 존재 확인
  console.log('\n🔍 1. RPC 함수 존재 확인');
  try {
    const { data, error } = await supabase.rpc('get_post_likes', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ get_post_likes 함수 오류:', error.message);
      testResults.failed++;
      testResults.details.push('get_post_likes 함수 접근 실패');
    } else {
      console.log('✅ get_post_likes 함수 정상 작동');
      console.log(`📊 현재 좋아요 수: ${data?.length || 0}개`);
      testResults.passed++;
      testResults.details.push('get_post_likes 함수 작동 확인');
    }
  } catch (err) {
    console.log('❌ RPC 함수 테스트 실패:', err.message);
    testResults.failed++;
    testResults.details.push('RPC 함수 네트워크 오류');
  }
  
  // 2. 좋아요 추가 테스트
  console.log('\n💝 2. 좋아요 추가 테스트');
  let likeResult = null;
  
  try {
    const { data, error } = await supabase.rpc('toggle_post_like', {
      p_post_id: testPostId,
      p_user_id: testUserId
    });
    
    if (error) {
      console.log('❌ 좋아요 추가 실패:', error.message);
      testResults.failed++;
      testResults.details.push('좋아요 추가 실패');
    } else {
      likeResult = data;
      console.log('✅ 좋아요 추가 성공:', likeResult);
      console.log(`  - 좋아요 여부: ${likeResult.liked}`);
      console.log(`  - 총 좋아요 수: ${likeResult.like_count}`);
      testResults.passed++;
      testResults.details.push(`좋아요 추가 성공 (${likeResult.like_count}개)`);
    }
  } catch (err) {
    console.log('❌ 좋아요 추가 오류:', err.message);
    testResults.failed++;
    testResults.details.push('좋아요 추가 네트워크 오류');
  }
  
  // 3. 좋아요 목록 조회 테스트
  console.log('\n📋 3. 좋아요 목록 조회 테스트');
  try {
    const { data: likes, error } = await supabase.rpc('get_post_likes', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ 좋아요 목록 조회 실패:', error.message);
      testResults.failed++;
      testResults.details.push('좋아요 목록 조회 실패');
    } else {
      console.log(`✅ 좋아요 목록 조회 성공: ${likes.length}개`);
      
      if (likes.length > 0) {
        console.log('💖 좋아요 목록 정보:');
        likes.forEach((like, index) => {
          console.log(`   ${index + 1}. 사용자: ${like.profile_username || 'Anonymous'}`);
          console.log(`      - 좋아요 ID: ${like.id}`);
          console.log(`      - 시간: ${like.created_at}`);
          console.log(`      - 전체 좋아요 수: ${like.like_count}`);
        });
      }
      
      testResults.passed++;
      testResults.details.push(`좋아요 목록 조회 성공 (${likes.length}개)`);
    }
  } catch (err) {
    console.log('❌ 좋아요 목록 조회 오류:', err.message);
    testResults.failed++;
    testResults.details.push('좋아요 목록 조회 네트워크 오류');
  }
  
  // 4. 사용자 좋아요 여부 확인 테스트
  console.log('\n🔍 4. 사용자 좋아요 여부 확인 테스트');
  try {
    const { data: checkResult, error } = await supabase.rpc('check_user_liked_post', {
      p_post_id: testPostId,
      p_user_id: testUserId
    });
    
    if (error) {
      console.log('❌ 좋아요 여부 확인 실패:', error.message);
      testResults.failed++;
      testResults.details.push('좋아요 여부 확인 실패');
    } else {
      console.log('✅ 좋아요 여부 확인 성공:', checkResult);
      console.log(`  - 좋아요 여부: ${checkResult.is_liked}`);
      console.log(`  - 총 좋아요 수: ${checkResult.like_count}`);
      console.log(`  - 좋아요 ID: ${checkResult.like_id || 'N/A'}`);
      testResults.passed++;
      testResults.details.push('좋아요 여부 확인 성공');
    }
  } catch (err) {
    console.log('❌ 좋아요 여부 확인 오류:', err.message);
    testResults.failed++;
    testResults.details.push('좋아요 여부 확인 네트워크 오류');
  }
  
  // 5. 좋아요 수 조회 테스트
  console.log('\n🔢 5. 좋아요 수 조회 테스트');
  try {
    const { data: count, error } = await supabase.rpc('get_post_like_count', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ 좋아요 수 조회 실패:', error.message);
      testResults.failed++;
      testResults.details.push('좋아요 수 조회 실패');
    } else {
      console.log(`✅ 좋아요 수 조회 성공: ${count}개`);
      testResults.passed++;
      testResults.details.push(`좋아요 수 조회 성공 (${count}개)`);
    }
  } catch (err) {
    console.log('❌ 좋아요 수 조회 오류:', err.message);
    testResults.failed++;
    testResults.details.push('좋아요 수 조회 네트워크 오류');
  }
  
  // 6. 사용자별 좋아요 목록 조회 테스트
  console.log('\n👤 6. 사용자별 좋아요 목록 조회 테스트');
  try {
    const { data: userLikes, error } = await supabase.rpc('get_user_likes', {
      p_user_id: testUserId,
      p_limit: 5,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ 사용자 좋아요 목록 조회 실패:', error.message);
      testResults.failed++;
      testResults.details.push('사용자 좋아요 목록 조회 실패');
    } else {
      console.log(`✅ 사용자 좋아요 목록 조회 성공: ${userLikes.length}개`);
      
      if (userLikes.length > 0) {
        console.log('📝 사용자가 좋아요한 게시글들:');
        userLikes.forEach((like, index) => {
          console.log(`   ${index + 1}. 게시글: ${like.post_title || 'No Title'}`);
          console.log(`      - 카테고리: ${like.post_category}`);
          console.log(`      - 작성자: ${like.post_author_name}`);
          console.log(`      - 좋아요 수: ${like.like_count}`);
          console.log(`      - 좋아요 날짜: ${like.created_at}`);
        });
      }
      
      testResults.passed++;
      testResults.details.push(`사용자 좋아요 목록 조회 성공 (${userLikes.length}개)`);
    }
  } catch (err) {
    console.log('❌ 사용자 좋아요 목록 조회 오류:', err.message);
    testResults.failed++;
    testResults.details.push('사용자 좋아요 목록 조회 네트워크 오류');
  }
  
  // 7. 좋아요 취소 테스트
  console.log('\n💔 7. 좋아요 취소 테스트');
  try {
    const { data: cancelResult, error } = await supabase.rpc('toggle_post_like', {
      p_post_id: testPostId,
      p_user_id: testUserId
    });
    
    if (error) {
      console.log('❌ 좋아요 취소 실패:', error.message);
      testResults.failed++;
      testResults.details.push('좋아요 취소 실패');
    } else {
      console.log('✅ 좋아요 취소 성공:', cancelResult);
      console.log(`  - 좋아요 여부: ${cancelResult.liked}`);
      console.log(`  - 총 좋아요 수: ${cancelResult.like_count}`);
      testResults.passed++;
      testResults.details.push('좋아요 취소 성공');
    }
  } catch (err) {
    console.log('❌ 좋아요 취소 오류:', err.message);
    testResults.failed++;
    testResults.details.push('좋아요 취소 네트워크 오류');
  }
  
  // 8. 최종 상태 확인
  console.log('\n🔄 8. 최종 상태 확인');
  try {
    const { data: finalLikes, error } = await supabase.rpc('get_post_likes', { 
      p_post_id: testPostId 
    });
    
    if (error) {
      console.log('❌ 최종 상태 확인 실패:', error.message);
      testResults.failed++;
      testResults.details.push('최종 상태 확인 실패');
    } else {
      console.log(`✅ 최종 좋아요 수: ${finalLikes.length}개`);
      testResults.passed++;
      testResults.details.push(`최종 상태 확인 완료 (${finalLikes.length}개)`);
    }
  } catch (err) {
    console.log('❌ 최종 상태 확인 오류:', err.message);
    testResults.failed++;
    testResults.details.push('최종 상태 확인 네트워크 오류');
  }
  
  // 9. 최종 결과 출력
  console.log('\n' + '=' .repeat(60));
  console.log('📊 좋아요 시스템 RPC 함수 테스트 결과');
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
    console.log('\n🎉 모든 테스트 통과! 좋아요 시스템이 완전히 작동합니다.');
    console.log('💡 이제 프론트엔드에서 실제 사용자 테스트를 해보세요!');
  } else {
    console.log('\n⚠️ 일부 테스트가 실패했습니다. 문제를 해결해주세요.');
  }
  
  console.log('\n🌐 프론트엔드 테스트 가이드:');
  console.log('1. 브라우저에서 localhost:3000 접속');
  console.log('2. 소셜 피드 페이지로 이동');
  console.log('3. 게시글의 좋아요 버튼 클릭');
  console.log('4. 좋아요 수 변화 확인');
  console.log('5. 좋아요 목록 모달 확인 (좋아요 수 클릭)');
  console.log('6. 좋아요 취소 기능 테스트');
  
  return testResults;
}

testLikeSystem().catch(console.error);