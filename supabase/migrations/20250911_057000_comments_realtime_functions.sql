-- Migration: Comments real-time functions and triggers
-- Created: 2025-09-11T05:70:00.000Z
-- Features: Real-time notifications and updated_at triggers

-- 실시간 알림 함수
CREATE OR REPLACE FUNCTION notify_comment_changes()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('comment_changes', 
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(NEW),
                'post_id', NEW.post_id
            )::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('comment_changes',
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD),
                'post_id', NEW.post_id
            )::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('comment_changes',
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(OLD),
                'post_id', OLD.post_id
            )::text
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER comment_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_comment_changes();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();