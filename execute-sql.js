import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

async function executeSQLFile() {
  console.log('📂 Reading SQL file...');
  
  try {
    const sqlContent = readFileSync('comments-rpc-functions.sql', 'utf8');
    console.log('✅ SQL file read successfully');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length < 10) continue; // Skip very short statements
      
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
      console.log(`📝 ${statement.substring(0, 100)}...`);
      
      try {
        // Use the PostgREST admin API to execute raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({ 
            sql: statement + ';'
          })
        });
        
        if (response.ok) {
          console.log('✅ Success');
          successCount++;
        } else {
          const errorData = await response.text();
          console.log(`❌ Error: ${response.status} - ${errorData}`);
          
          // Try alternative approach with supabase.from()
          try {
            const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (error) {
              console.log(`❌ Alternative approach failed: ${error.message}`);
              errorCount++;
            } else {
              console.log('✅ Alternative approach succeeded');
              successCount++;
            }
          } catch (altError) {
            console.log(`❌ Alternative approach error: ${altError.message}`);
            errorCount++;
          }
        }
      } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
        errorCount++;
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Execution Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    
    // Test functions after execution
    console.log('\n🧪 Testing functions...');
    await testFunctions();
    
  } catch (error) {
    console.error('💥 Failed to read or execute SQL file:', error);
  }
}

async function testFunctions() {
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
      // Test with minimal parameters
      let testParams = {};
      
      switch (funcName) {
        case 'get_post_comments':
          testParams = { p_post_id: '00000000-0000-0000-0000-000000000000' };
          break;
        case 'get_post_comment_count':
          testParams = { p_post_id: '00000000-0000-0000-0000-000000000000' };
          break;
        case 'get_user_comments':
          testParams = { 
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_limit: 1,
            p_offset: 0
          };
          break;
        default:
          // For other functions, just try without parameters to see if they exist
          testParams = {};
      }
      
      const { data, error } = await supabase.rpc(funcName, testParams);
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${funcName}: Function not found`);
        } else {
          console.log(`⚠️ ${funcName}: Function exists (${error.message.substring(0, 50)}...)`);
        }
      } else {
        console.log(`✅ ${funcName}: Function working correctly`);
      }
    } catch (err) {
      console.log(`❌ ${funcName}: ${err.message.substring(0, 50)}...`);
    }
  }
}

executeSQLFile().catch(console.error);