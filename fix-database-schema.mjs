import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0'

// Use service role key for admin operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkxOTIzNiwiZXhwIjoyMDczNDk1MjM2fQ.kvetLwT9IkYxZouRAYLb2qgiY6qqL-rNrn0iAQKfhOg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...')

  try {
    // Check if full_name column exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .eq('column_name', 'full_name')

    if (columnError) {
      console.log('❌ Error checking columns:', columnError.message)
      return
    }

    console.log('Existing full_name columns:', columns)

    if (!columns || columns.length === 0) {
      console.log('📋 Adding full_name column to profiles table...')

      // Add full_name column
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
          CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
          UPDATE public.profiles SET full_name = username WHERE full_name IS NULL OR full_name = '';
          COMMENT ON COLUMN public.profiles.full_name IS 'Display name for user profile, defaults to username if not provided';
        `
      })

      if (error) {
        console.log('❌ Error adding column:', error.message)
        console.log('Trying alternative approach...')

        // Try direct SQL execution
        const { data: result, error: sqlError } = await supabase.rpc('sql', {
          query: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT'
        })

        if (sqlError) {
          console.log('❌ SQL Error:', sqlError.message)
          console.log('📝 Please run this SQL manually in Supabase dashboard:')
          console.log(`
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
UPDATE public.profiles SET full_name = username WHERE full_name IS NULL OR full_name = '';
COMMENT ON COLUMN public.profiles.full_name IS 'Display name for user profile, defaults to username if not provided';
          `)
        } else {
          console.log('✅ Column added successfully via direct SQL')
        }
      } else {
        console.log('✅ full_name column added successfully')
      }
    } else {
      console.log('✅ full_name column already exists')
    }

    // Test profile query to verify schema
    console.log('🧪 Testing profile query...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .limit(1)

    if (testError) {
      console.log('❌ Test query error:', testError.message)
    } else {
      console.log('✅ Profile query test successful:', testData)
    }

    // Check for other common schema issues
    console.log('🔍 Checking for other schema issues...')

    // Check posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)

    if (postsError) {
      console.log('⚠️ Posts table issue:', postsError.message)
    } else {
      console.log('✅ Posts table working')
    }

    // Check chat_messages table
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1)

    if (messagesError) {
      console.log('⚠️ Chat messages table issue:', messagesError.message)
    } else {
      console.log('✅ Chat messages table working')
    }

    console.log('🎉 Database schema check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

fixDatabaseSchema()