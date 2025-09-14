#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// .env.local에서 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 연결 정보가 없습니다. .env.local 파일을 확인하세요.');
  process.exit(1);
}

async function executeSQL() {
  try {
    console.log('🚀 댓글 시스템 RPC 함수 배포 시작...');
    
    // SQL 파일 읽기
    const sqlFile = path.join(__dirname, 'comments-rpc-functions.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 SQL 파일 로드 완료');
    console.log(`📝 SQL 길이: ${sqlContent.length} 글자`);
    
    // SQL을 개별 CREATE 함수로 분리
    const functionBlocks = [];
    const lines = sqlContent.split('\n');
    let currentBlock = '';
    let inFunction = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('CREATE OR REPLACE FUNCTION')) {
        if (currentBlock.trim()) {
          functionBlocks.push(currentBlock.trim());
        }
        currentBlock = line + '\n';
        inFunction = true;
      } else if (line.trim().startsWith('DROP TRIGGER') || line.trim().startsWith('CREATE TRIGGER')) {
        if (currentBlock.trim()) {
          functionBlocks.push(currentBlock.trim());
        }
        currentBlock = line + '\n';
        inFunction = false;
      } else if (line.trim().startsWith('GRANT EXECUTE')) {
        if (currentBlock.trim()) {
          functionBlocks.push(currentBlock.trim());
        }
        currentBlock = line + '\n';
        inFunction = false;
      } else if (line.trim().startsWith('SELECT \'🎉')) {
        if (currentBlock.trim()) {
          functionBlocks.push(currentBlock.trim());
        }
        currentBlock = line + '\n';
        inFunction = false;
      } else {
        currentBlock += line + '\n';
      }
    }
    
    // 마지막 블록 추가
    if (currentBlock.trim()) {
      functionBlocks.push(currentBlock.trim());
    }
    
    console.log(`📊 총 ${functionBlocks.length}개의 SQL 블록을 실행합니다...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 각 블록을 개별 실행
    for (let i = 0; i < functionBlocks.length; i++) {
      const block = functionBlocks[i].trim();
      
      if (!block || block.startsWith('--') || block.match(/^\s*$/)) {
        continue;
      }
      
      try {
        console.log(`\n실행 중 (${i + 1}/${functionBlocks.length}):`, 
          block.split('\n')[0].substring(0, 60) + '...');
        
        // fetch를 사용해서 직접 SQL 실행
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ sql: block })
        });
        
        if (response.ok) {
          console.log(`✅ 블록 ${i + 1} 실행 성공`);
          successCount++;
        } else {
          const errorText = await response.text();
          console.error(`❌ 블록 ${i + 1} 실행 실패 (${response.status}):`, errorText);
          errorCount++;
        }
        
        // 실행 간격
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        console.error(`❌ 블록 ${i + 1} 실행 중 예외:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 배포 결과:');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    if (successCount > 0) {
      console.log('\n🎉 RPC 함수 배포가 완료되었습니다!');
      return true;
    } else {
      console.log('\n⚠️ 모든 함수 배포에 실패했습니다.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 배포 실패:', error.message);
    return false;
  }
}

// 메인 실행
async function main() {
  console.log('🔧 Supabase 댓글 시스템 RPC 함수 배포');
  console.log('=====================================\n');
  
  const success = await executeSQL();
  
  if (!success) {
    console.log('\n🔧 대안 방법:');
    console.log('1. Supabase 대시보드의 SQL Editor에서 수동 실행');
    console.log('2. PostgreSQL 클라이언트 도구 사용');
    console.log('3. 개별 함수를 하나씩 복사해서 실행');
  }
}

// fetch polyfill for older Node.js versions
if (!global.fetch) {
  const { default: fetch } = require('node-fetch');
  global.fetch = fetch;
}

if (require.main === module) {
  main().catch(console.error);
}