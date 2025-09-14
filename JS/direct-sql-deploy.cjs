const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정 (서비스 롤 키 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function deployRPCFunctionsDirectly() {
  try {
    console.log('🚀 Supabase RPC 함수 직접 배포 시작...');
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // SQL 파일 읽기
    const sqlFilePath = path.join(__dirname, 'comments-rpc-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL 파일 읽기 완료');
    
    // 1. 먼저 get_post_comments 함수 생성
    const getPostCommentsSQL = `
CREATE OR REPLACE FUNCTION get_post_comments(p_post_id UUID)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    user_id UUID,
    author_name TEXT,
    content TEXT,
    parent_comment_id UUID,
    is_deleted BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    profile_username TEXT,
    profile_avatar_url TEXT,
    reply_count BIGINT,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.author_name,
        c.content,
        c.parent_comment_id,
        c.is_deleted,
        c.created_at,
        c.updated_at,
        p.username as profile_username,
        p.avatar_url as profile_avatar_url,
        (SELECT COUNT(*)::BIGINT FROM comments cc WHERE cc.parent_comment_id = c.id AND cc.is_deleted = FALSE) as reply_count,
        (SELECT COUNT(*)::BIGINT FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count
    FROM comments c
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.post_id = p_post_id 
    AND c.is_deleted = FALSE
    ORDER BY 
        CASE WHEN c.parent_comment_id IS NULL THEN c.created_at ELSE NULL END ASC NULLS LAST,
        CASE WHEN c.parent_comment_id IS NOT NULL THEN c.created_at ELSE NULL END ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
`;

    console.log('🔧 get_post_comments 함수 생성 중...');
    
    try {
      // Supabase에서 직접 SQL 실행을 위해 REST API 사용
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: getPostCommentsSQL
        })
      });

      if (!response.ok) {
        console.log('ℹ️  REST API 방법 실패, 다른 방법 시도 중...');
        
        // Supabase 클라이언트의 query 메소드 사용
        const { data, error } = await supabase.from('_migrations').select('*').limit(1);
        
        if (error) {
          console.log('ℹ️  직접 쿼리 접근 제한됨');
        }
        
        // 최종 방법: Edge Function 형태로 접근 시도
        console.log('🎯 Edge Function 방식으로 함수 배포 시도...');
        
        // Edge Functions는 별도 배포가 필요하므로 Supabase CLI 방법 안내
        console.log('⚠️  직접 SQL 실행이 제한되어 있습니다.');
        console.log('📋 아래 방법 중 하나를 사용해주세요:');
        console.log('');
        console.log('방법 1: Supabase Dashboard 사용');
        console.log('🔗 https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new');
        console.log('  - 위 링크에서 SQL Editor를 열어주세요');
        console.log('  - comments-rpc-functions.sql 파일의 내용을 복사해서 실행해주세요');
        console.log('');
        console.log('방법 2: Supabase CLI 사용');
        console.log('  $ npx supabase login');
        console.log('  $ npx supabase link --project-ref spgcihtrquywmaieflue');
        console.log('  $ npx supabase db push');
        console.log('');
        
        return { 
          success: false, 
          error: '직접 SQL 실행이 제한되어 수동 배포가 필요합니다.',
          dashboard_url: 'https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new'
        };
        
      } else {
        console.log('✅ get_post_comments 함수 생성 성공!');
      }
      
    } catch (fetchError) {
      console.log('ℹ️  HTTP 요청 실패:', fetchError.message);
    }
    
    // 함수 존재 여부 테스트
    console.log('🧪 get_post_comments 함수 테스트 중...');
    
    const testPostId = '00000000-0000-0000-0000-000000000001';
    
    const { data: testData, error: testError } = await supabase
      .rpc('get_post_comments', { p_post_id: testPostId });
    
    if (testError) {
      console.error('❌ 함수 테스트 실패:', testError.message);
      console.log('');
      console.log('📋 수동 배포 방법:');
      console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new');
      console.log('📄 실행할 SQL 파일: comments-rpc-functions.sql');
      console.log('');
      
      return { 
        success: false, 
        error: testError.message,
        dashboard_url: 'https://supabase.com/dashboard/project/spgcihtrquywmaieflue/sql/new'
      };
    } else {
      console.log('✅ get_post_comments 함수 테스트 성공!');
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
  deployRPCFunctionsDirectly()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 성공:', result.message);
        process.exit(0);
      } else {
        console.error('\n💀 실패:', result.error);
        if (result.dashboard_url) {
          console.log('\n🌐 Supabase Dashboard에서 수동으로 배포해주세요:');
          console.log('   ', result.dashboard_url);
        }
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 예상치 못한 오류:', error);
      process.exit(1);
    });
}

module.exports = { deployRPCFunctionsDirectly };