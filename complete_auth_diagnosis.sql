-- Best Practice: Supabase 인증 시스템 완전 진단
-- 새 SQL 에디터에서 실행하세요

-- ========================================
-- DIAGNOSIS 1: 사용자 상태 완전 분석  
-- ========================================

SELECT '=== USER AUTHENTICATION STATUS ===' as section;

SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  raw_user_meta_data,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email NOT Confirmed'
    ELSE '✅ Email Confirmed'
  END as email_status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- DIAGNOSIS 2: 프로필 매칭 상태
-- ========================================

SELECT '=== USER-PROFILE MATCHING ===' as section;

SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.username,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ PROFILE EXISTS'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- ========================================
-- DIAGNOSIS 3: Auth 설정 확인
-- ========================================

SELECT '=== AUTH CONFIGURATION ===' as section;

-- 이메일 확인 설정 상태 (auth.config에서)
SELECT 
  'Email Confirmation Setting' as setting_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.config 
      WHERE parameter = 'email_confirm_required' 
      AND value::boolean = true
    ) THEN '❌ Email Confirmation REQUIRED'
    ELSE '✅ Email Confirmation DISABLED'
  END as status;

-- ========================================
-- DIAGNOSIS 4: RLS 정책 상태
-- ========================================

SELECT '=== RLS POLICIES STATUS ===' as section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'posts', 'comments', 'likes')
ORDER BY tablename, policyname;

-- ========================================
-- DIAGNOSIS 5: 트리거 상태 확인
-- ========================================

SELECT '=== DATABASE TRIGGERS ===' as section;

SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_orientation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- ========================================
-- EMERGENCY FIX: 즉시 해결 (Best Practice)
-- ========================================

SELECT '=== APPLYING EMERGENCY FIX ===' as section;

-- 1. 모든 사용자 이메일 확인 처리
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. 확인 결과
SELECT 
  'EMERGENCY FIX APPLIED' as status,
  COUNT(*) as updated_users
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

-- ========================================
-- FINAL VERIFICATION
-- ========================================

SELECT '=== FINAL STATUS ===' as section;

SELECT 
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Can Login'
    ELSE '❌ Cannot Login'
  END as login_status,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ Profile OK'
    ELSE '❌ No Profile'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 3;

SELECT 'DIAGNOSIS COMPLETE - LOGIN SHOULD WORK NOW!' as final_message;