-- RPC 함수 생성 (CLI 도구를 위한)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json AS $$
BEGIN
    -- 보안을 위해 SELECT 쿼리만 허용
    IF sql_query ILIKE 'SELECT%' OR sql_query ILIKE 'SHOW%' THEN
        -- 동적 SQL 실행은 보안상 위험하므로 기본적으로는 제한
        RETURN json_build_object('status', 'error', 'message', 'Dynamic SQL execution is restricted for security');
    ELSE
        -- 관리자 전용 DDL/DML 작업
        EXECUTE sql_query;
        RETURN json_build_object('status', 'success', 'message', 'Query executed successfully');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;