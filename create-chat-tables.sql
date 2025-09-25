-- 채팅 시스템 데이터베이스 테이블 생성

-- 1. chat_rooms 테이블 생성
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'public')),
  name VARCHAR(255),
  description TEXT,
  avatar_url TEXT,
  max_members INTEGER DEFAULT 100,
  is_private BOOLEAN DEFAULT false,
  invite_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. chat_room_members 테이블 생성
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  is_active BOOLEAN DEFAULT true,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

-- 3. messages 테이블 생성
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'reply')),
  reply_to_id UUID REFERENCES public.messages(id),
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. message_read_status 테이블 생성
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(message_id, user_id)
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON public.chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON public.chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated_at ON public.chat_rooms(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON public.chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_active ON public.chat_room_members(is_active);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted);

CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON public.message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_room_id ON public.message_read_status(room_id);

-- 6. RLS 정책 설정
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- chat_rooms 정책
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.chat_rooms;
CREATE POLICY "Users can view rooms they are members of" ON public.chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = id AND user_id = auth.uid() AND is_active = true
    ) OR is_private = false
  );

DROP POLICY IF EXISTS "Users can create rooms" ON public.chat_rooms;
CREATE POLICY "Users can create rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Room owners can update rooms" ON public.chat_rooms;
CREATE POLICY "Room owners can update rooms" ON public.chat_rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- chat_room_members 정책
DROP POLICY IF EXISTS "Users can view memberships" ON public.chat_room_members;
CREATE POLICY "Users can view memberships" ON public.chat_room_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_room_members;
CREATE POLICY "Users can join rooms" ON public.chat_room_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own membership" ON public.chat_room_members;
CREATE POLICY "Users can update own membership" ON public.chat_room_members
  FOR UPDATE USING (auth.uid() = user_id);

-- messages 정책
DROP POLICY IF EXISTS "Users can view messages in joined rooms" ON public.messages;
CREATE POLICY "Users can view messages in joined rooms" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = messages.room_id AND user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = messages.room_id AND user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- message_read_status 정책
DROP POLICY IF EXISTS "Users can view own read status" ON public.message_read_status;
CREATE POLICY "Users can view own read status" ON public.message_read_status
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark messages as read" ON public.message_read_status;
CREATE POLICY "Users can mark messages as read" ON public.message_read_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 테스트 데이터 삽입 (선택사항)
-- 현재 사용자를 위한 테스트 채팅방 생성
INSERT INTO public.chat_rooms (type, name, description, is_private, created_by)
SELECT 'group', '육아 고민 나누기', '육아 고민을 함께 나누는 채팅방입니다', false, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;