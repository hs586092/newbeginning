#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runDatabaseDiagnosis() {
    console.log('🔍 Supabase 데이터베이스 진단을 시작합니다...\n');
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ 환경 변수가 설정되지 않았습니다:');
        console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
        console.error(`SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅' : '❌'}`);
        process.exit(1);
    }
    
    console.log('✅ 환경 변수 확인 완료');
    console.log(`📍 Supabase URL: ${supabaseUrl}\n`);
    
    // Supabase 클라이언트 생성 (서비스 롤 키 사용)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        // SQL 파일 읽기
        const sqlContent = fs.readFileSync('/Users/hyeonsoo/newbeginning/database-diagnosis.sql', 'utf8');
        
        // SQL 쿼리를 개별적으로 분리하여 실행
        const queries = [
            // 1. 테이블 존재 확인
            `SELECT 
                '=== 테이블 존재 확인 ===' as check_type,
                table_name, 
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('comments', 'profiles', 'posts', 'comment_likes')
            ORDER BY table_name`,
            
            // 2. comments 테이블 구조 확인
            `SELECT 
                '=== comments 테이블 구조 ===' as check_type,
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'comments'
            ORDER BY ordinal_position`,
            
            // 3. profiles 테이블 구조 확인
            `SELECT 
                '=== profiles 테이블 구조 ===' as check_type,
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            ORDER BY ordinal_position`,
            
            // 4. 외래키 관계 확인
            `SELECT 
                '=== 외래키 관계 확인 ===' as check_type,
                tc.table_name as from_table, 
                kcu.column_name as from_column,
                ccu.table_name as to_table,
                ccu.column_name as to_column,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            ORDER BY tc.table_name`,
            
            // 5. RLS 정책 확인
            `SELECT 
                '=== RLS 정책 확인 ===' as check_type,
                schemaname,
                tablename,
                policyname,
                roles,
                cmd,
                qual
            FROM pg_policies 
            WHERE schemaname = 'public'
            AND tablename IN ('comments', 'profiles', 'comment_likes')
            ORDER BY tablename, policyname`,
            
            // 6. 데이터 샘플 확인
            `SELECT '=== comments 데이터 샘플 ===' as check_type, COUNT(*) as record_count FROM comments`,
            
            `SELECT '=== profiles 데이터 샘플 ===' as check_type, COUNT(*) as record_count FROM profiles`
        ];
        
        console.log('🔄 데이터베이스 쿼리 실행 중...\n');
        
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            console.log(`📊 쿼리 ${i + 1}/${queries.length} 실행 중...`);
            
            try {
                const { data, error } = await supabase.rpc('exec_sql', { sql: query });
                
                if (error) {
                    // RPC가 없으면 직접 쿼리 시도
                    const { data: directData, error: directError } = await supabase
                        .from('information_schema.tables')
                        .select('*')
                        .limit(1);
                    
                    if (directError) {
                        console.log('⚠️  직접 쿼리 실행을 시도합니다...');
                        // PostgreSQL 직접 연결 없이는 복잡한 쿼리 실행이 어려움
                        console.log('❌ Supabase JavaScript 클라이언트로는 복잡한 진단 쿼리 실행이 제한됩니다.');
                        console.log('💡 대안: Supabase 대시보드의 SQL Editor를 사용하거나 psql을 사용해주세요.');
                        break;
                    }
                }
                
                if (data) {
                    console.log('✅ 결과:');
                    console.table(data);
                    console.log('\n');
                }
            } catch (queryError) {
                console.log(`❌ 쿼리 실행 오류: ${queryError.message}`);
            }
        }
        
        // 기본적인 테이블 확인을 Supabase API로 시도
        console.log('🔍 기본 테이블 확인을 시도합니다...\n');
        
        // comments 테이블 확인
        try {
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*')
                .limit(1);
                
            if (commentsError) {
                console.log('❌ comments 테이블 접근 실패:', commentsError.message);
            } else {
                console.log('✅ comments 테이블 존재 및 접근 가능');
                if (commentsData && commentsData.length > 0) {
                    console.log('📊 comments 테이블 컬럼:', Object.keys(commentsData[0]));
                }
            }
        } catch (e) {
            console.log('❌ comments 테이블 확인 실패:', e.message);
        }
        
        // profiles 테이블 확인
        try {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .limit(1);
                
            if (profilesError) {
                console.log('❌ profiles 테이블 접근 실패:', profilesError.message);
            } else {
                console.log('✅ profiles 테이블 존재 및 접근 가능');
                if (profilesData && profilesData.length > 0) {
                    console.log('📊 profiles 테이블 컬럼:', Object.keys(profilesData[0]));
                }
            }
        } catch (e) {
            console.log('❌ profiles 테이블 확인 실패:', e.message);
        }
        
        // posts 테이블 확인
        try {
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .limit(1);
                
            if (postsError) {
                console.log('❌ posts 테이블 접근 실패:', postsError.message);
            } else {
                console.log('✅ posts 테이블 존재 및 접근 가능');
                if (postsData && postsData.length > 0) {
                    console.log('📊 posts 테이블 컬럼:', Object.keys(postsData[0]));
                }
            }
        } catch (e) {
            console.log('❌ posts 테이블 확인 실패:', e.message);
        }
        
        // comment_likes 테이블 확인
        try {
            const { data: likesData, error: likesError } = await supabase
                .from('comment_likes')
                .select('*')
                .limit(1);
                
            if (likesError) {
                console.log('❌ comment_likes 테이블 접근 실패:', likesError.message);
            } else {
                console.log('✅ comment_likes 테이블 존재 및 접근 가능');
                if (likesData && likesData.length > 0) {
                    console.log('📊 comment_likes 테이블 컬럼:', Object.keys(likesData[0]));
                }
            }
        } catch (e) {
            console.log('❌ comment_likes 테이블 확인 실패:', e.message);
        }
        
        console.log('\n🏁 진단 완료');
        
    } catch (error) {
        console.error('❌ 진단 중 오류 발생:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
runDatabaseDiagnosis();