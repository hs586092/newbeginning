-- RPC 함수 수정: 트랜잭션 명령 제거 및 개별 명령 실행
CREATE OR REPLACE FUNCTION execute_migration(migration_sql text)
RETURNS json AS $$
DECLARE
    result json;
    clean_sql text;
BEGIN
    -- BEGIN/COMMIT 제거하고 SQL 정리
    clean_sql := migration_sql;
    clean_sql := regexp_replace(clean_sql, '\s*BEGIN\s*;\s*', '', 'gi');
    clean_sql := regexp_replace(clean_sql, '\s*COMMIT\s*;\s*', '', 'gi');
    clean_sql := regexp_replace(clean_sql, '--[^\r\n]*', '', 'g');
    clean_sql := regexp_replace(clean_sql, '\s+', ' ', 'g');
    clean_sql := trim(clean_sql);
    
    -- 정리된 SQL 실행
    IF clean_sql != '' THEN
        EXECUTE clean_sql;
    END IF;
    
    -- 성공 응답
    result := json_build_object(
        'status', 'success',
        'message', 'Migration executed successfully',
        'timestamp', NOW()
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- 에러 응답
        result := json_build_object(
            'status', 'error',
            'message', SQLERRM,
            'detail', SQLSTATE,
            'timestamp', NOW()
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 권한 재설정
GRANT EXECUTE ON FUNCTION execute_migration(text) TO service_role;
GRANT EXECUTE ON FUNCTION execute_migration(text) TO authenticated;

-- 수정 완료 메시지
SELECT 'RPC 함수 execute_migration 수정 완료 (트랜잭션 호환)!' as fix_status;