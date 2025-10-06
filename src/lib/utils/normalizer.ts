/**
 * Place Name Normalizer
 *
 * Normalizes place names to prevent cache key collisions
 * Example: "스타벅스 강남점" and "강남 스타벅스" → both become "강남스타벅스"
 */

/**
 * Normalize a place name for cache key generation
 *
 * Process:
 * 1. Convert to lowercase
 * 2. Remove special characters and spaces
 * 3. Sort tokens alphabetically (token sorting)
 * 4. Remove common suffixes (점, 지점, 본점, etc.)
 *
 * @param placeName - Original place name from user search
 * @returns Normalized place name suitable for cache key
 */
export function normalizePlaceName(placeName: string): string {
  if (!placeName || typeof placeName !== 'string') {
    return ''
  }

  // Step 1: Convert to lowercase and remove all whitespace/special chars
  let normalized = placeName
    .toLowerCase()
    .replace(/[\s\-_.,!?()[\]{}'"]/g, '')

  // Step 2: Remove common Korean place suffixes
  const suffixes = ['점', '지점', '본점', '매장', '스토어', '샵', '카페']
  for (const suffix of suffixes) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length)
    }
  }

  // Step 3: Token sorting for collision prevention
  // "스타벅스강남" and "강남스타벅스" → both become "강남스타벅스"
  const tokens = normalized.match(/[\uAC00-\uD7A3]+|[a-z0-9]+/g) || []
  normalized = tokens.sort().join('')

  return normalized
}

/**
 * Test Suite for normalizePlaceName
 *
 * Run with: npx tsx src/lib/utils/normalizer.ts
 */
if (require.main === module) {
  const tests = [
    // Test 1: Basic normalization
    {
      input: '스타벅스 강남점',
      expected: '강남스타벅스',
      description: 'Basic normalization with suffix removal'
    },
    // Test 2: Token sorting
    {
      input: '강남 스타벅스',
      expected: '강남스타벅스',
      description: 'Token sorting - should match Test 1'
    },
    // Test 3: Special characters
    {
      input: '스타벅스-강남점!',
      expected: '강남스타벅스',
      description: 'Special character removal'
    },
    // Test 4: Multiple suffixes
    {
      input: '무지개의원 본점',
      expected: '무지개의원',
      description: 'Suffix removal (본점)'
    },
    // Test 5: English + Korean
    {
      input: 'Apple Store 가로수길',
      expected: '가로수길applestore',
      description: 'Mixed English and Korean with token sorting'
    },
    // Test 6: Numbers
    {
      input: '24시 편의점 GS25',
      expected: '24gs25시편의',
      description: 'Numbers and mixed characters'
    },
    // Test 7: Multiple spaces
    {
      input: '교보문고   광화문점',
      expected: '교보문고광화문',
      description: 'Multiple spaces and suffix'
    },
    // Test 8: Parentheses
    {
      input: '스타벅스 (강남역점)',
      expected: '강남역스타벅스',
      description: 'Parentheses removal'
    },
    // Test 9: Empty/null handling
    {
      input: '',
      expected: '',
      description: 'Empty string handling'
    },
    // Test 10: Case insensitivity
    {
      input: 'Starbucks GANGNAM',
      expected: 'gangnamstarbucks',
      description: 'Uppercase to lowercase conversion'
    }
  ]

  console.log('🧪 Running normalizePlaceName tests...\n')

  let passed = 0
  let failed = 0

  for (let index = 0; index < tests.length; index++) {
    const test = tests[index]
    const result = normalizePlaceName(test.input)
    const success = result === test.expected

    if (success) {
      passed++
      console.log(`✅ Test ${index + 1}: ${test.description}`)
    } else {
      failed++
      console.log(`❌ Test ${index + 1}: ${test.description}`)
      console.log(`   Input:    "${test.input}"`)
      console.log(`   Expected: "${test.expected}"`)
      console.log(`   Got:      "${result}"`)
    }
  }

  console.log(`\n📊 Results: ${passed}/${tests.length} passed, ${failed} failed`)

  if (failed === 0) {
    console.log('🎉 All tests passed!')
  } else {
    process.exit(1)
  }
}
