// TypeScript 타입 시스템 직접 검증
import type { Database } from '@/types/database.types'

// Comments 테이블 타입이 올바르게 정의되었는지 확인
type CommentsTable = Database['public']['Tables']['comments']
type CommentsRow = CommentsTable['Row']
type CommentsInsert = CommentsTable['Insert']

// 타입 검증: 이 코드가 컴파일 오류 없이 통과해야 함
const mockComment: CommentsInsert = {
  post_id: 'test-uuid',
  user_id: 'test-uuid', 
  content: 'test content',
  author_name: 'test author'
}

// 타입 추론 테스트
const mockRow: CommentsRow = {
  id: 'test-uuid',
  post_id: 'test-uuid',
  user_id: 'test-uuid',
  content: 'test content', 
  author_name: 'test author',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

console.log('Type definitions are working correctly', { mockComment, mockRow })