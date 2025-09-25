// 카테고리 서비스 - MOCK 데이터 대체용
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface Category {
  id: string
  name: string
  post_count: number
  is_hot: boolean
  icon?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export class CategoryService {
  /**
   * 인기 카테고리 조회 (HOT 카테고리 우선)
   */
  static async getHotCategories(limit: number = 8): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('is_hot', { ascending: false })
        .order('post_count', { ascending: false })
        .limit(limit)

      if (error || !data || data.length === 0) {
        console.error('인기 카테고리 조회 오류:', error)
        // MOCK 데이터 반환
        return this.getMockCategories()
      }

      return data
    } catch (err) {
      console.error('카테고리 서비스 오류:', err)
      return this.getMockCategories()
    }
  }

  /**
   * 모든 카테고리 조회
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('post_count', { ascending: false })

      if (error || !data) {
        console.error('전체 카테고리 조회 오류:', error)
        return this.getMockCategories()
      }

      return data
    } catch (err) {
      console.error('카테고리 서비스 오류:', err)
      return this.getMockCategories()
    }
  }

  /**
   * 카테고리별 게시글 수 업데이트
   */
  static async updateCategoryPostCount(categoryName: string, increment: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('increment_category_post_count', {
          category_name: categoryName,
          increment_value: increment
        })

      if (error) {
        console.error('카테고리 게시글 수 업데이트 오류:', error)

        // RPC 함수가 없으면 수동으로 업데이트
        const { data: category, error: selectError } = await supabase
          .from('categories')
          .select('post_count')
          .eq('name', categoryName)
          .single()

        if (!selectError && category) {
          const { error: updateError } = await supabase
            .from('categories')
            .update({ post_count: category.post_count + increment })
            .eq('name', categoryName)

          return !updateError
        }

        return false
      }

      return true
    } catch (err) {
      console.error('카테고리 업데이트 서비스 오류:', err)
      return false
    }
  }

  /**
   * HOT 카테고리 상태 업데이트 (게시글 수 기준)
   */
  static async updateHotStatus(): Promise<boolean> {
    try {
      // 게시글 수 상위 2개를 HOT으로 설정
      const { data: allCategories, error: selectError } = await supabase
        .from('categories')
        .select('*')
        .order('post_count', { ascending: false })

      if (selectError || !allCategories) {
        console.error('카테고리 조회 오류:', selectError)
        return false
      }

      const hotCategoryIds = allCategories.slice(0, 2).map(cat => cat.id)

      // 모든 카테고리를 NOT HOT으로 설정
      const { error: resetError } = await supabase
        .from('categories')
        .update({ is_hot: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (resetError) {
        console.error('HOT 상태 초기화 오류:', resetError)
        return false
      }

      // 상위 2개를 HOT으로 설정
      if (hotCategoryIds.length > 0) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ is_hot: true })
          .in('id', hotCategoryIds)

        if (updateError) {
          console.error('HOT 상태 업데이트 오류:', updateError)
          return false
        }
      }

      return true
    } catch (err) {
      console.error('HOT 상태 업데이트 서비스 오류:', err)
      return false
    }
  }

  /**
   * 카테고리 생성
   */
  static async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (error) {
        console.error('카테고리 생성 오류:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('카테고리 생성 서비스 오류:', err)
      return null
    }
  }

  /**
   * MOCK 카테고리 데이터 (실제 데이터 조회 실패 시 사용)
   */
  private static getMockCategories(): Category[] {
    return [
      {
        id: 'mock1',
        name: '아기 수유 고민',
        post_count: 124,
        is_hot: true,
        icon: '🍼',
        description: '신생아 및 영아 수유 관련 고민과 노하우'
      },
      {
        id: 'mock2',
        name: '이유식 거부',
        post_count: 89,
        is_hot: true,
        icon: '🥄',
        description: '이유식을 거부하는 아기들을 위한 해결책'
      },
      {
        id: 'mock3',
        name: '밤수유 노하우',
        post_count: 78,
        is_hot: false,
        icon: '🌙',
        description: '밤수유를 편하게 하는 방법들'
      },
      {
        id: 'mock4',
        name: '변비 과열',
        post_count: 67,
        is_hot: false,
        icon: '💊',
        description: '아기 변비 해결법과 관련 정보'
      },
      {
        id: 'mock5',
        name: '놀이 활동',
        post_count: 56,
        is_hot: false,
        icon: '🧸',
        description: '월령별 놀이 활동과 발달 놀이'
      },
      {
        id: 'mock6',
        name: '둘째 조작',
        post_count: 45,
        is_hot: false,
        icon: '👶',
        description: '둘째 아이 키우기와 형제 관계'
      },
      {
        id: 'mock7',
        name: '육아휴직 복직',
        post_count: 34,
        is_hot: false,
        icon: '💼',
        description: '육아휴직 후 직장 복귀 관련'
      },
      {
        id: 'mock8',
        name: '모유수유 노하우',
        post_count: 23,
        is_hot: false,
        icon: '🤱',
        description: '모유수유 성공을 위한 팁'
      }
    ]
  }
}