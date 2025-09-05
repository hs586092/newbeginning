// Test different Supabase query approaches
const { chromium } = require('playwright');

async function testSupabaseQueries() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 TESTING SUPABASE QUERY APPROACHES');
  console.log('====================================\n');
  
  // Test different query patterns in browser console
  await page.goto('https://newbeginning-seven.vercel.app/');
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Try to test queries in browser console
  const queryResults = await page.evaluate(async () => {
    // Try different query approaches
    const results = {};
    
    try {
      // Test 1: Simple posts query without JOIN
      console.log('Testing simple posts query...');
      results.simple = 'Testing in browser console';
      
      // Test 2: Check what tables exist
      console.log('Available window objects:', Object.keys(window));
      
      return results;
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('Query test results:', queryResults);
  
  await browser.close();
}

testSupabaseQueries().catch(console.error);