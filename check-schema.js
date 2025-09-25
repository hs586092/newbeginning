#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwqvqncgveqenzymwlmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyMzYsImV4cCI6MjA3MzQ5NTIzNn0.UG11UfT3c9qUxAAMj9Uv3_7L5upD1KwX6iI_MKLOeu0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 데이터베이스 스키마 확인...\n');

  try {
    // 1. 전체 포스트 조회 (모든 컬럼)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ 오류:', error);
      return;
    }

    console.log(`📊 전체 포스트 수: ${posts?.length || 0}개\n`);

    if (posts && posts.length > 0) {
      console.log('🗂️ 첫 번째 포스트 스키마:');
      console.log(JSON.stringify(posts[0], null, 2));

      console.log('\n📋 사용 가능한 컬럼들:');
      Object.keys(posts[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof posts[0][key]}`);
      });

      console.log('\n📝 모든 포스트 요약:');
      posts.forEach((post, index) => {
        console.log(`\n${index + 1}. ID: ${post.id}`);
        console.log(`   제목: ${post.title || '없음'}`);
        console.log(`   내용: ${(post.content || '없음').substring(0, 50)}...`);
        console.log(`   작성일: ${post.created_at}`);
        console.log(`   작성자: ${post.user_id}`);
      });
    } else {
      console.log('⚠️ 포스트가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 스키마 확인 오류:', error);
  }
}

checkSchema();