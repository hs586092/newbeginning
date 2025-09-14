import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSingleFunction() {
  console.log('🔧 Creating a simple RPC function for testing...\n');
  
  // Try to create a simple test function first
  const testFunctionSQL = `
    CREATE OR REPLACE FUNCTION test_connection()
    RETURNS TEXT AS $$
    BEGIN
        RETURN 'Connection successful';
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  console.log('📝 Creating test function...');
  
  try {
    // Use the edge functions method
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'test_connection',
        definition: testFunctionSQL
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test function created:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create test function:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  // Test the function
  console.log('\n🧪 Testing the function...');
  try {
    const { data, error } = await supabase.rpc('test_connection');
    if (error) {
      console.log('❌ Function test failed:', error.message);
    } else {
      console.log('✅ Function test succeeded:', data);
    }
  } catch (err) {
    console.log('❌ Function call error:', err.message);
  }
  
  // Check function existence in pg_proc
  console.log('\n🔍 Checking function in pg_proc...');
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'test_connection');
    
    if (error) {
      console.log('❌ Cannot query pg_proc:', error.message);
    } else {
      console.log('📊 pg_proc query result:', data);
    }
  } catch (err) {
    console.log('❌ pg_proc query error:', err.message);
  }
  
  // Manual approach - show SQL to execute in Supabase dashboard
  console.log('\n📋 Manual execution required:');
  console.log('Please go to your Supabase dashboard and execute this SQL in the SQL editor:');
  console.log('=' .repeat(80));
  console.log(testFunctionSQL);
  console.log('=' .repeat(80));
  
  // Also show the full comment system SQL
  console.log('\n📋 For the complete comment system, execute this SQL:');
  console.log('Please copy and paste the contents of comments-rpc-functions.sql');
  console.log('into your Supabase SQL editor and execute it.');
}

createSingleFunction().catch(console.error);