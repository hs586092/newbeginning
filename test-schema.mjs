import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSchema() {
  console.log('🧪 Testing database schema...')

  try {
    // Test basic profiles query
    console.log('1. Testing basic profiles query...')
    const { data: basicData, error: basicError } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(1)

    if (basicError) {
      console.log('❌ Basic query error:', basicError.message)
    } else {
      console.log('✅ Basic profiles query works:', basicData?.length || 0, 'results')
    }

    // Test full_name column specifically
    console.log('2. Testing full_name column...')
    const { data: fullNameData, error: fullNameError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .limit(1)

    if (fullNameError) {
      console.log('❌ full_name query error:', fullNameError.message)
      console.log('📝 Need to add full_name column!')

      // Try to add the column using SQL RPC
      console.log('3. Attempting to add full_name column...')

      const { data: sqlResult, error: sqlError } = await supabase.rpc('query', {
        sql: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'profiles\' AND table_schema = \'public\''
      })

      if (sqlError) {
        console.log('❌ Unable to query schema:', sqlError.message)
        console.log('📋 Please manually add the column in Supabase dashboard:')
        console.log('   ALTER TABLE public.profiles ADD COLUMN full_name TEXT;')
      } else {
        console.log('📊 Current columns:', sqlResult)
      }

    } else {
      console.log('✅ full_name column exists:', fullNameData?.length || 0, 'results')
      console.log('Sample data:', fullNameData?.[0])
    }

    // Test other potentially problematic tables
    console.log('4. Testing other tables...')

    const tables = ['posts', 'chat_messages', 'chat_rooms', 'follows']

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1)

        if (error) {
          console.log(`⚠️ ${table} table issue:`, error.message)
        } else {
          console.log(`✅ ${table} table OK:`, data?.length || 0, 'records')
        }
      } catch (e) {
        console.log(`❌ ${table} table error:`, e.message)
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testSchema()