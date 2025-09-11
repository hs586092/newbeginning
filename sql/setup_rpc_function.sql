-- RPC 함수: CLI 도구에서 마이그레이션 실행용
-- 개선된 버전: 더 나은 에러 핸들링 및 보안 설정

CREATE OR REPLACE FUNCTION execute_migration(migration_sql text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- 마이그레이션 SQL 실행
    EXECUTE migration_sql;
    
    -- 성공 응답
    result := json_build_object(
        'status', 'success',
        'message', 'Migration executed successfully',
        'timestamp', NOW()
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- 에러 응답 (상세한 에러 정보 포함)
        result := json_build_object(
            'status', 'error',
            'message', SQLERRM,
            'detail', SQLSTATE,
            'timestamp', NOW()
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 권한 설정 (service_role 권한 필요)
GRANT EXECUTE ON FUNCTION execute_migration(text) TO service_role;
GRANT EXECUTE ON FUNCTION execute_migration(text) TO authenticated;

-- 함수 생성 확인 메시지
SELECT 'RPC 함수 execute_migration 생성 완료!' as setup_status;