#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function detailedDiagnosis() {
    console.log('🔍 상세 진단을 시작합니다...\n');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        console.log('📊 테이블별 데이터 개수 확인...\n');
        
        // 각 테이블의 데이터 개수 확인
        const tables = ['comments', 'profiles', 'posts', 'comment_likes'];
        
        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                    
                if (error) {
                    console.log(`❌ ${table} 테이블 카운트 실패:`, error.message);
                } else {
                    console.log(`✅ ${table}: ${count}개 레코드`);
                }
            } catch (e) {
                console.log(`❌ ${table} 테이블 오류:`, e.message);
            }
        }
        
        console.log('\n🔍 샘플 데이터 확인...\n');
        
        // comments 테이블 샘플
        try {
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*')
                .limit(3);
                
            if (commentsError) {
                console.log('❌ comments 샘플 데이터 오류:', commentsError.message);
            } else {
                console.log('📝 comments 샘플 데이터:');
                console.log(JSON.stringify(commentsData, null, 2));
            }
        } catch (e) {
            console.log('❌ comments 샘플 오류:', e.message);
        }
        
        // profiles 테이블 샘플
        try {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .limit(3);
                
            if (profilesError) {
                console.log('❌ profiles 샘플 데이터 오류:', profilesError.message);
            } else {
                console.log('\n👤 profiles 샘플 데이터:');
                console.log(JSON.stringify(profilesData, null, 2));
            }
        } catch (e) {
            console.log('❌ profiles 샘플 오류:', e.message);
        }
        
        console.log('\n🔗 관계 테스트...\n');
        
        // comments와 profiles 조인 테스트
        try {
            const { data: joinData, error: joinError } = await supabase
                .from('comments')
                .select(`
                    id,
                    content,
                    author_name,
                    user_id,
                    profiles:user_id (
                        id,
                        username,
                        full_name
                    )
                `)
                .limit(5);
                
            if (joinError) {
                console.log('❌ comments-profiles 조인 오류:', joinError.message);
                console.log('⚠️  외래키 관계가 설정되지 않았을 수 있습니다.');
            } else {
                console.log('✅ comments-profiles 조인 성공:');
                console.log(JSON.stringify(joinData, null, 2));
            }
        } catch (e) {
            console.log('❌ 조인 테스트 오류:', e.message);
        }
        
        console.log('\n🔐 RLS (Row Level Security) 상태 확인...\n');
        
        // RLS 상태 확인을 위해 익명 클라이언트로 테스트
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const anonSupabase = createClient(supabaseUrl, anonKey);
        
        try {
            const { data: anonData, error: anonError } = await anonSupabase
                .from('comments')
                .select('*')
                .limit(1);
                
            if (anonError) {
                console.log('⚠️  익명 사용자 접근 차단됨 (RLS 활성화됨):', anonError.message);
            } else {
                console.log('✅ 익명 사용자 접근 가능 (RLS 비활성화 또는 public 정책)');
            }
        } catch (e) {
            console.log('❌ RLS 테스트 오류:', e.message);
        }
        
        console.log('\n🏁 상세 진단 완료');
        
    } catch (error) {
        console.error('❌ 상세 진단 중 오류:', error.message);
    }
}

detailedDiagnosis();