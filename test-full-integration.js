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

async function fullIntegrationTest() {
  console.log('🚀 전체 시스템 통합 테스트 시작');
  console.log('댓글 시스템 + 좋아요 시스템 완전 통합 검증');
  console.log('=' .repeat(70));
  
  const testPostId = '11111111-1111-1111-1111-111111111111';
  const testUserId = 'fd29f3c1-7bcc-4f63-b5d9-4c1ce8dffc26';
  
  let totalTests = 0;
  let passedTests = 0;
  const results = [];
  
  // 1. 댓글 시스템 기능 테스트
  console.log('\n💬 1. 댓글 시스템 통합 테스트');
  try {
    // 댓글 목록 조회
    const { data: comments, error: commentError } = await supabase
      .rpc('get_post_comments', { p_post_id: testPostId });
    
    totalTests++;
    if (commentError) {
      console.log('❌ 댓글 시스템 오류:', commentError.message);
      results.push('댓글 시스템 - 실패');
    } else {
      console.log(`✅ 댓글 시스템 정상 작동 (${comments?.length || 0}개 댓글)`);
      passedTests++;
      results.push(`댓글 시스템 - 성공 (${comments?.length || 0}개)`);
    }
  } catch (err) {
    totalTests++;
    console.log('❌ 댓글 시스템 네트워크 오류:', err.message);
    results.push('댓글 시스템 - 네트워크 오류');
  }
  
  // 2. 좋아요 시스템 기능 테스트
  console.log('\n💖 2. 좋아요 시스템 통합 테스트');
  try {
    // 좋아요 목록 조회
    const { data: likes, error: likeError } = await supabase
      .rpc('get_post_likes', { p_post_id: testPostId });
    
    totalTests++;
    if (likeError) {
      console.log('❌ 좋아요 시스템 오류:', likeError.message);
      results.push('좋아요 시스템 - 실패');
    } else {
      console.log(`✅ 좋아요 시스템 정상 작동 (${likes?.length || 0}개 좋아요)`);
      passedTests++;
      results.push(`좋아요 시스템 - 성공 (${likes?.length || 0}개)`);
    }
  } catch (err) {
    totalTests++;
    console.log('❌ 좋아요 시스템 네트워크 오류:', err.message);
    results.push('좋아요 시스템 - 네트워크 오류');
  }
  
  // 3. 통합 인터랙션 테스트 (댓글 + 좋아요)
  console.log('\n🔗 3. 통합 인터랙션 테스트');
  try {
    // 좋아요 추가
    const { data: likeResult, error: likeToggleError } = await supabase
      .rpc('toggle_post_like', { 
        p_post_id: testPostId, 
        p_user_id: testUserId 
      });
    
    totalTests++;
    if (likeToggleError) {
      console.log('❌ 좋아요 토글 오류:', likeToggleError.message);
      results.push('통합 인터랙션 - 좋아요 실패');
    } else {
      console.log(`✅ 좋아요 토글 성공: ${likeResult.liked ? '좋아요 추가' : '좋아요 취소'} (${likeResult.like_count}개)`);
      passedTests++;
      results.push(`통합 인터랙션 - 좋아요 성공 (${likeResult.like_count}개)`);
      
      // 좋아요 상태에서 댓글 추가 테스트
      try {
        const { data: commentId, error: commentCreateError } = await supabase
          .rpc('create_comment', {
            p_post_id: testPostId,
            p_user_id: testUserId,
            p_author_name: '통합테스트',
            p_content: '좋아요와 댓글 통합 테스트입니다! 🚀💖',
            p_parent_comment_id: null
          });
        
        totalTests++;
        if (commentCreateError) {
          console.log('❌ 통합 댓글 생성 오류:', commentCreateError.message);
          results.push('통합 인터랙션 - 댓글 생성 실패');
        } else {
          console.log('✅ 좋아요 + 댓글 통합 인터랙션 성공:', commentId);
          passedTests++;
          results.push('통합 인터랙션 - 댓글 생성 성공');
          
          // 생성한 댓글 삭제 (정리)
          await supabase.rpc('delete_comment', {
            p_comment_id: commentId,
            p_user_id: testUserId
          });
        }
      } catch (commentErr) {
        totalTests++;
        console.log('❌ 통합 댓글 생성 네트워크 오류:', commentErr.message);
        results.push('통합 인터랙션 - 댓글 생성 네트워크 오류');
      }
      
      // 좋아요 취소 (정리)
      await supabase.rpc('toggle_post_like', { 
        p_post_id: testPostId, 
        p_user_id: testUserId 
      });
    }
  } catch (err) {
    totalTests++;
    console.log('❌ 통합 인터랙션 네트워크 오류:', err.message);
    results.push('통합 인터랙션 - 네트워크 오류');
  }
  
  // 4. RPC 함수 성능 테스트
  console.log('\n⚡ 4. RPC 함수 성능 테스트');
  try {
    const startTime = Date.now();
    
    // 동시에 여러 RPC 함수 호출
    const [commentResult, likeResult, userLikeResult] = await Promise.all([
      supabase.rpc('get_post_comments', { p_post_id: testPostId }),
      supabase.rpc('get_post_likes', { p_post_id: testPostId }),
      supabase.rpc('get_user_likes', { p_user_id: testUserId, p_limit: 5 })
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    totalTests++;
    if (commentResult.error || likeResult.error || userLikeResult.error) {
      console.log('❌ 병렬 RPC 호출 오류');
      results.push('RPC 성능 - 병렬 호출 실패');
    } else {
      console.log(`✅ 병렬 RPC 호출 성공 (${duration}ms)`);
      console.log(`   - 댓글: ${commentResult.data?.length || 0}개`);
      console.log(`   - 좋아요: ${likeResult.data?.length || 0}개`);
      console.log(`   - 사용자 좋아요: ${userLikeResult.data?.length || 0}개`);
      passedTests++;
      results.push(`RPC 성능 - 병렬 호출 성공 (${duration}ms)`);
    }
  } catch (err) {
    totalTests++;
    console.log('❌ RPC 성능 테스트 오류:', err.message);
    results.push('RPC 성능 - 성능 테스트 오류');
  }
  
  // 5. 데이터 일관성 테스트
  console.log('\n🔄 5. 데이터 일관성 테스트');
  try {
    // 게시글별 좋아요 수 vs 좋아요 목록 수 비교
    const { data: likeCount, error: countError } = await supabase
      .rpc('get_post_like_count', { p_post_id: testPostId });
    
    const { data: likeList, error: listError } = await supabase
      .rpc('get_post_likes', { p_post_id: testPostId });
    
    totalTests++;
    if (countError || listError) {
      console.log('❌ 데이터 일관성 테스트 오류');
      results.push('데이터 일관성 - 실패');
    } else {
      const listCount = likeList?.length || 0;
      if (likeCount === listCount) {
        console.log(`✅ 데이터 일관성 검증 성공 (좋아요 수: ${likeCount}개)`);
        passedTests++;
        results.push(`데이터 일관성 - 성공 (${likeCount}개 일치)`);
      } else {
        console.log(`❌ 데이터 불일치: 카운트 ${likeCount} vs 목록 ${listCount}`);
        results.push(`데이터 일관성 - 불일치 (${likeCount} vs ${listCount})`);
      }
    }
  } catch (err) {
    totalTests++;
    console.log('❌ 데이터 일관성 네트워크 오류:', err.message);
    results.push('데이터 일관성 - 네트워크 오류');
  }
  
  // 최종 결과
  console.log('\n' + '=' .repeat(70));
  console.log('🏆 전체 시스템 통합 테스트 완료');
  console.log('=' .repeat(70));
  
  const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
  
  console.log(`📊 테스트 결과:`);
  console.log(`   🎯 총 테스트: ${totalTests}개`);
  console.log(`   ✅ 성공: ${passedTests}개`);
  console.log(`   ❌ 실패: ${totalTests - passedTests}개`);
  console.log(`   📈 성공률: ${successRate}%`);
  
  console.log('\n📋 세부 결과:');
  results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result}`);
  });
  
  if (passedTests === totalTests) {
    console.log('\n🎉 🎉 🎉 완벽한 통합 시스템! 🎉 🎉 🎉');
    console.log('✨ 댓글 시스템과 좋아요 시스템이 완전히 통합되었습니다!');
    console.log('🚀 프로덕션 환경에서도 안정적으로 작동할 것입니다!');
  } else {
    console.log('\n⚠️ 일부 테스트가 실패했습니다.');
    console.log('🔧 실패한 부분을 확인하고 수정해주세요.');
  }
  
  console.log('\n🌐 사용자 테스트 가이드:');
  console.log('1. 브라우저: localhost:3000 접속');
  console.log('2. 페이지: 커뮤니티/소셜 피드 이동');
  console.log('3. 기능: 좋아요 버튼 클릭 → 좋아요 토글');
  console.log('4. 기능: 좋아요 수 클릭 → 좋아요 목록 모달');
  console.log('5. 기능: 댓글 버튼 클릭 → 댓글 모달');
  console.log('6. 통합: 좋아요 + 댓글 동시 기능 테스트');
  console.log('7. 확인: 실시간 업데이트 및 상태 동기화');
  
  return { totalTests, passedTests, successRate, results };
}

fullIntegrationTest().catch(console.error);