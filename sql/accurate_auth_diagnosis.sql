-- Best Practice: 정확한 Supabase 인증 진단
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
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email NOT Confirmed'
    ELSE '✅ Email Confirmed'
  END as email_status,
  CASE 
    WHEN last_sign_in_at IS NULL THEN '❌ Never Logged In'
    ELSE '✅ Has Logged In'
  END as login_status
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
-- DIAGNOSIS 3: 특정 사용자 상세 분석 (가장 최근 가입자)
-- ========================================

SELECT '=== LATEST USER DETAILED ANALYSIS ===' as section;

WITH latest_user AS (
  SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  'User ID' as field, id::text as value FROM latest_user
UNION ALL
SELECT 
  'Email' as field, email as value FROM latest_user
UNION ALL
SELECT 
  'Email Confirmed At' as field, 
  COALESCE(email_confirmed_at::text, 'NULL - THIS IS THE PROBLEM!') as value 
FROM latest_user
UNION ALL
SELECT 
  'Created At' as field, created_at::text as value FROM latest_user
UNION ALL
SELECT 
  'Raw User Meta Data' as field, raw_user_meta_data::text as value FROM latest_user
UNION ALL
SELECT 
  'Profile Username' as field, 
  COALESCE(p.username, 'NO PROFILE FOUND') as value
FROM latest_user u
LEFT JOIN public.profiles p ON u.id = p.id;

-- ========================================
-- EMERGENCY FIX: 즉시 해결
-- ========================================

SELECT '=== APPLYING EMERGENCY FIX ===' as section;

-- 1. 모든 사용자 이메일 확인 처리
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. 결과 확인
SELECT 
  'Email confirmation fix applied to' as message,
  COUNT(*) as affected_users
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

-- ========================================
-- VERIFICATION: 최종 상태 확인
-- ========================================

SELECT '=== POST-FIX VERIFICATION ===' as section;

SELECT 
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Ready to Login'
    ELSE '❌ Still Cannot Login'
  END as login_ready_status,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ Profile Ready'
    ELSE '❌ Profile Missing'
  END as profile_ready_status,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 3;

-- ========================================
-- FINAL MESSAGE
-- ========================================

SELECT 'DIAGNOSIS COMPLETE!' as status,
       'If any user shows "Ready to Login" = ✅, they can login immediately!' as instruction;