import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugChatMessages() {
  console.log('🔍 Debugging chat_messages table...')

  try {
    // 1. Test basic select
    console.log('1. Testing basic select...')
    const { data: basic, error: basicError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1)

    if (basicError) {
      console.log('❌ Basic select error:', basicError.message)
    } else {
      console.log('✅ Basic select works:', basic?.length || 0, 'messages')
    }

    // 2. Test the problematic query structure
    console.log('2. Testing problematic query structure...')
    const { data: complex, error: complexError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        reply_to:reply_to_id(id, content)
      `)
      .eq('room_id', '6d33da32-cf00-400c-bba8-34f1ae115bca')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (complexError) {
      console.log('❌ Complex query error:', complexError.message)
      console.log('Full error:', JSON.stringify(complexError, null, 2))
    } else {
      console.log('✅ Complex query works:', complex?.length || 0, 'messages')
    }

    // 3. Test if the room exists
    console.log('3. Testing if room exists...')
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', '6d33da32-cf00-400c-bba8-34f1ae115bca')
      .single()

    if (roomError) {
      console.log('❌ Room not found:', roomError.message)
    } else {
      console.log('✅ Room exists:', room.name || room.id)
    }

    // 4. Check table structure
    console.log('4. Checking table structure...')
    const { data: columns, error: columnError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'chat_messages'
        ORDER BY ordinal_position;
      `
    })

    if (columnError) {
      console.log('❌ Column query error:', columnError.message)
    } else {
      console.log('✅ Table structure:')
      columns?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
      })
    }

    // 5. Check foreign key constraints
    console.log('5. Checking foreign key constraints...')
    const { data: fks, error: fkError } = await supabase.rpc('sql', {
      query: `
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.constraint_column_usage ccu
          ON kcu.constraint_name = ccu.constraint_name
        WHERE kcu.table_name = 'chat_messages'
          AND kcu.constraint_name LIKE '%_fkey';
      `
    })

    if (fkError) {
      console.log('❌ FK query error:', fkError.message)
    } else {
      console.log('✅ Foreign keys:')
      fks?.forEach(fk => {
        console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugChatMessages()