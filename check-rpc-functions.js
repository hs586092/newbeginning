import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRPCFunctions() {
  console.log('🔍 Checking RPC functions in Supabase...\n');

  // Check if functions exist in pg_proc
  const { data: functions, error: functionsError } = await supabase
    .rpc('sql', {
      query: `
        SELECT proname, prosrc 
        FROM pg_proc 
        WHERE proname IN (
          'get_post_comments', 
          'create_comment', 
          'update_comment', 
          'delete_comment',
          'toggle_comment_like',
          'get_post_comment_count',
          'get_user_comments'
        )
        ORDER BY proname;
      `
    });

  if (functionsError) {
    console.error('❌ Error checking functions:', functionsError);
    
    // Try alternative approach - direct SQL execution
    console.log('\n🔄 Trying alternative approach...');
    
    const functionNames = [
      'get_post_comments', 
      'create_comment', 
      'update_comment', 
      'delete_comment',
      'toggle_comment_like',
      'get_post_comment_count',
      'get_user_comments'
    ];

    for (const funcName of functionNames) {
      try {
        const { data, error } = await supabase.rpc(funcName, {});
        if (error) {
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log(`❌ ${funcName}: Function does not exist`);
          } else {
            console.log(`⚠️ ${funcName}: Function exists but has error: ${error.message}`);
          }
        } else {
          console.log(`✅ ${funcName}: Function exists and callable`);
        }
      } catch (err) {
        console.log(`❌ ${funcName}: ${err.message}`);
      }
    }
  } else {
    console.log('📊 Found functions in pg_proc:');
    if (functions && functions.length > 0) {
      functions.forEach(func => {
        console.log(`\n📋 Function: ${func.proname}`);
        console.log(`   Source: ${func.prosrc.substring(0, 200)}...`);
      });
    } else {
      console.log('❌ No RPC functions found in database');
    }
  }

  console.log('\n🧪 Testing each function individually:');
  
  // Test get_post_comments
  try {
    const { data, error } = await supabase.rpc('get_post_comments', { post_id: 'test' });
    console.log(`✅ get_post_comments: ${error ? 'Error - ' + error.message : 'Working'}`);
  } catch (err) {
    console.log(`❌ get_post_comments: ${err.message}`);
  }

  // Test create_comment
  try {
    const { data, error } = await supabase.rpc('create_comment');
    console.log(`✅ create_comment: ${error ? 'Error - ' + error.message : 'Working'}`);
  } catch (err) {
    console.log(`❌ create_comment: ${err.message}`);
  }

  // Test other functions
  const otherFunctions = ['update_comment', 'delete_comment', 'toggle_comment_like', 'get_post_comment_count', 'get_user_comments'];
  
  for (const funcName of otherFunctions) {
    try {
      const { data, error } = await supabase.rpc(funcName);
      console.log(`✅ ${funcName}: ${error ? 'Error - ' + error.message : 'Working'}`);
    } catch (err) {
      console.log(`❌ ${funcName}: ${err.message}`);
    }
  }
}

checkRPCFunctions().catch(console.error);