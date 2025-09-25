#!/usr/bin/env node

/**
 * 데이터베이스 포스트 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 설정 (환경변수에서 가져오기)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gwqvqncgveqenzymwlmy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXZxbmNndmVxZW56eW13bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MzEyMTYsImV4cCI6MjA1MjAwNzIxNn0.FMcm2XThSY1wg7z1zVg0n7-NQGq7RhYmrk_FHsQGBOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabasePosts() {
  console.log('🔍 데이터베이스 포스트 조회 시작...\n');

  try {
    // 1. 전체 포스트 수 확인
    console.log('1️⃣ 전체 포스트 수 확인...');
    const { count: totalCount, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 포스트 수 조회 오류:', countError);
      return;
    }

    console.log(`📊 전체 포스트 수: ${totalCount}개`);

    // 2. 최근 포스트들 조회
    console.log('\n2️⃣ 최근 포스트들 조회 중...');
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        title,
        category,
        created_at,
        user_id,
        author_name,
        like_count,
        view_count,
        comment_count,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ 포스트 조회 오류:', error);
      return;
    }

    if (!postsData || postsData.length === 0) {
      console.log('⚠️ 데이터베이스에 포스트가 없습니다.');
      return;
    }

    console.log(`📝 조회된 포스트 수: ${postsData.length}개\n`);

    // 3. 포스트 상세 정보 출력
    console.log('3️⃣ 포스트 상세 정보:');
    console.log('=' * 50);

    postsData.forEach((post, index) => {
      console.log(`\n${index + 1}. ID: ${post.id}`);
      console.log(`   제목: ${post.title || '제목 없음'}`);
      console.log(`   내용: ${(post.content || '내용 없음').substring(0, 50)}${(post.content || '').length > 50 ? '...' : ''}`);
      console.log(`   카테고리: ${post.category || '미분류'}`);
      console.log(`   작성자: ${post.profiles?.username || post.author_name || '익명'}`);
      console.log(`   작성일: ${new Date(post.created_at).toLocaleString()}`);
      console.log(`   좋아요: ${post.like_count || 0}, 조회수: ${post.view_count || 0}, 댓글: ${post.comment_count || 0}`);
    });

    // 4. 카테고리별 분포 확인
    console.log('\n4️⃣ 카테고리별 분포:');
    const categoryDistribution = {};
    postsData.forEach(post => {
      const category = post.category || '미분류';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    Object.entries(categoryDistribution).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}개`);
    });

    // 5. 최근 생성된 포스트와 오래된 포스트 비교
    if (postsData.length > 0) {
      const newest = postsData[0];
      const oldest = postsData[postsData.length - 1];

      console.log('\n5️⃣ 시간 범위:');
      console.log(`   가장 최근: ${new Date(newest.created_at).toLocaleString()}`);
      console.log(`   가장 오래됨: ${new Date(oldest.created_at).toLocaleString()}`);
    }

  } catch (error) {
    console.error('❌ 데이터베이스 연결 오류:', error);
  }
}

checkDatabasePosts().catch(console.error);