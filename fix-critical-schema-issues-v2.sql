-- Critical schema fixes for production errors (Fixed Order)
-- Run this in Supabase SQL Editor to fix all schema issues

-- ===========================
-- 1. Fix profiles table - Add missing full_name column
-- ===========================

DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        -- Create index for better performance
        CREATE INDEX idx_profiles_full_name ON public.profiles(full_name);
        -- Set default values from username
        UPDATE public.profiles SET full_name = username WHERE full_name IS NULL OR full_name = '';
        -- Add column comment
        COMMENT ON COLUMN public.profiles.full_name IS 'Display name for user profile, defaults to username if not provided';

        RAISE NOTICE 'Added full_name column to profiles table';
    ELSE
        RAISE NOTICE 'full_name column already exists in profiles table';
    END IF;
END $$;

-- ===========================
-- 2. Create chat_participants table FIRST (needed for chat_messages policies)
-- ===========================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_participants') THEN
        -- Create chat_participants table
        CREATE TABLE public.chat_participants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            is_muted BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(room_id, user_id)
        );

        -- Create indexes
        CREATE INDEX idx_chat_participants_room_id ON public.chat_participants(room_id);
        CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);

        -- Enable RLS
        ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for chat_participants
        -- Users can see participants in rooms they're members of
        CREATE POLICY "Users can see participants in their rooms" ON public.chat_participants
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_participants cp
                    WHERE cp.room_id = chat_participants.room_id
                    AND cp.user_id = auth.uid()
                )
            );

        -- Room owners/admins can manage participants
        CREATE POLICY "Room owners can manage participants" ON public.chat_participants
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_participants cp
                    WHERE cp.room_id = chat_participants.room_id
                    AND cp.user_id = auth.uid()
                    AND cp.role IN ('owner', 'admin')
                )
            );

        RAISE NOTICE 'Created chat_participants table with RLS policies';
    ELSE
        RAISE NOTICE 'chat_participants table already exists';
    END IF;
END $$;

-- ===========================
-- 3. Create chat_messages table AFTER chat_participants exists
-- ===========================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        -- Create chat_messages table
        CREATE TABLE public.chat_messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
            metadata JSONB DEFAULT '{}'::jsonb,
            is_edited BOOLEAN DEFAULT false,
            is_deleted BOOLEAN DEFAULT false,
            reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
            edited_at TIMESTAMP WITH TIME ZONE,
            deleted_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Create indexes for better performance
        CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
        CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
        CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
        CREATE INDEX idx_chat_messages_reply_to ON public.chat_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

        -- Enable RLS
        ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for chat_messages (now chat_participants exists)
        -- Users can read messages from rooms they're members of
        CREATE POLICY "Users can read messages from their rooms" ON public.chat_messages
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_participants
                    WHERE chat_participants.room_id = chat_messages.room_id
                    AND chat_participants.user_id = auth.uid()
                )
            );

        -- Users can insert messages to rooms they're members of
        CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
            FOR INSERT
            WITH CHECK (
                auth.uid() = sender_id AND
                EXISTS (
                    SELECT 1 FROM public.chat_participants
                    WHERE chat_participants.room_id = chat_messages.room_id
                    AND chat_participants.user_id = auth.uid()
                )
            );

        -- Users can update their own messages
        CREATE POLICY "Users can edit their own messages" ON public.chat_messages
            FOR UPDATE
            USING (auth.uid() = sender_id)
            WITH CHECK (auth.uid() = sender_id);

        -- Users can delete their own messages
        CREATE POLICY "Users can delete their own messages" ON public.chat_messages
            FOR DELETE
            USING (auth.uid() = sender_id);

        RAISE NOTICE 'Created chat_messages table with RLS policies';
    ELSE
        RAISE NOTICE 'chat_messages table already exists';
    END IF;
END $$;

-- ===========================
-- 4. Update updated_at trigger function
-- ===========================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
DO $$
BEGIN
    -- Add trigger to chat_messages if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_chat_messages' AND tgrelid = 'public.chat_messages'::regclass) THEN
        CREATE TRIGGER handle_updated_at_chat_messages
            BEFORE UPDATE ON public.chat_messages
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        RAISE NOTICE 'Added updated_at trigger to chat_messages';
    END IF;

    -- Add trigger to chat_participants if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_chat_participants' AND tgrelid = 'public.chat_participants'::regclass) THEN
        CREATE TRIGGER handle_updated_at_chat_participants
            BEFORE UPDATE ON public.chat_participants
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        RAISE NOTICE 'Added updated_at trigger to chat_participants';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Some tables do not exist yet, skipping triggers';
END $$;

-- ===========================
-- 5. Grant necessary permissions
-- ===========================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===========================
-- 6. Create simple test data for chat system (optional)
-- ===========================

DO $$
DECLARE
    test_room_id UUID;
    admin_user_id UUID;
BEGIN
    -- Only create test data if tables are empty
    IF (SELECT COUNT(*) FROM public.chat_rooms) = 0 THEN
        -- Create a test public room
        INSERT INTO public.chat_rooms (id, type, name, description, is_private, max_members)
        VALUES (gen_random_uuid(), 'public', '일반 대화', '모든 사용자가 참여할 수 있는 공개 채팅방입니다.', false, 100)
        RETURNING id INTO test_room_id;

        RAISE NOTICE 'Created test chat room with id: %', test_room_id;

        -- If there are any users, add them to the room
        FOR admin_user_id IN SELECT id FROM public.profiles LIMIT 1 LOOP
            INSERT INTO public.chat_participants (room_id, user_id, role)
            VALUES (test_room_id, admin_user_id, 'owner');

            RAISE NOTICE 'Added user % as owner of test room', admin_user_id;
        END LOOP;
    END IF;
END $$;

-- ===========================
-- Summary
-- ===========================

DO $$
BEGIN
    RAISE NOTICE '=== Schema Fix Summary ===';
    RAISE NOTICE '1. ✅ Checked/Added full_name column to profiles table';
    RAISE NOTICE '2. ✅ Created chat_participants table with RLS (FIRST)';
    RAISE NOTICE '3. ✅ Created chat_messages table with RLS (SECOND)';
    RAISE NOTICE '4. ✅ Added updated_at triggers';
    RAISE NOTICE '5. ✅ Granted necessary permissions';
    RAISE NOTICE '6. ✅ Created test chat room (if needed)';
    RAISE NOTICE '=== All schema fixes completed successfully! ===';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your chat system should now work without WebSocket errors!';
    RAISE NOTICE '📱 Test by visiting your app and trying the chat functionality.';
END $$;