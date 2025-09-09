-- 💬 Best Practice 채팅 시스템 데이터베이스 스키마
-- 확장성, 성능, 보안을 고려한 설계

-- 🏠 채팅방 테이블 (그룹 & 개인 채팅 통합)
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'public')),
  name VARCHAR(100), -- 그룹 채팅방 이름 (개인 채팅은 NULL)
  description TEXT,
  avatar_url TEXT,
  
  -- 그룹 채팅 설정
  max_members INTEGER DEFAULT 100,
  is_private BOOLEAN DEFAULT false,
  invite_only BOOLEAN DEFAULT false,
  
  -- 메타데이터
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스 최적화
  CONSTRAINT valid_group_name CHECK (
    (type = 'direct' AND name IS NULL) OR 
    (type IN ('group', 'public') AND name IS NOT NULL)
  )
);

-- 📝 메시지 테이블 (파티셔닝 준비)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 메시지 내용
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (
    message_type IN ('text', 'image', 'file', 'system', 'reply')
  ),
  
  -- 답장 기능
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- 파일 첨부
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type VARCHAR(50),
  
  -- 메시지 상태
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 성능 최적화 인덱스
  CONSTRAINT valid_file_data CHECK (
    (message_type IN ('image', 'file') AND file_url IS NOT NULL) OR
    (message_type NOT IN ('image', 'file') AND file_url IS NULL)
  )
);

-- 👥 채팅방 참여자 테이블 
CREATE TABLE chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 권한 관리
  role VARCHAR(20) DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'moderator', 'member')
  ),
  
  -- 사용자별 채팅방 설정
  is_muted BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 참여 상태
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- 유니크 제약
  UNIQUE(room_id, user_id),
  
  -- 활성 멤버만 카운트
  CONSTRAINT valid_membership CHECK (
    (is_active = true AND left_at IS NULL) OR
    (is_active = false AND left_at IS NOT NULL)
  )
);

-- 📋 읽음 표시 테이블 (성능 최적화)
CREATE TABLE message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 복합 유니크 인덱스
  UNIQUE(message_id, user_id)
);

-- 🔔 채팅 알림 테이블
CREATE TABLE chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('new_message', 'mention', 'room_invite', 'member_joined', 'member_left')
  ),
  
  title VARCHAR(200) NOT NULL,
  body TEXT,
  
  -- 알림 상태
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- 📊 성능 최적화 인덱스
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_type ON messages(message_type) WHERE is_deleted = false;

CREATE INDEX idx_chat_members_user ON chat_room_members(user_id) WHERE is_active = true;
CREATE INDEX idx_chat_members_room ON chat_room_members(room_id) WHERE is_active = true;

CREATE INDEX idx_read_status_user_room ON message_read_status(user_id, room_id);
CREATE INDEX idx_notifications_user_unread ON chat_notifications(user_id) WHERE is_read = false;

-- 🔒 Row Level Security (RLS) 보안 정책
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;

-- 채팅방 접근 권한: 참여자만
CREATE POLICY "Users can view rooms they're members of" ON chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM chat_room_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 메시지 읽기: 채팅방 참여자만
CREATE POLICY "Users can view messages in their rooms" ON messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM chat_room_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 메시지 작성: 채팅방 참여자만
CREATE POLICY "Users can send messages to their rooms" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    room_id IN (
      SELECT room_id FROM chat_room_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 🔄 실시간 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION notify_message_change()
RETURNS trigger AS $$
BEGIN
  -- Supabase Realtime을 통한 실시간 알림
  PERFORM pg_notify(
    'message_changes',
    json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD),
      'room_id', COALESCE(NEW.room_id, OLD.room_id)
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_message_change();

-- 📈 채팅방 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_room_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE chat_rooms 
  SET updated_at = NOW() 
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_room_stats();