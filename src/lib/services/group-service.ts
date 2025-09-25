// 그룹 서비스 - MOCK 데이터 대체용
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface Group {
  id: string
  name: string
  description: string
  member_count: number
  is_public: boolean
  icon?: string
  color?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface GroupMembership {
  id: string
  group_id: string
  user_id: string
  role: 'member' | 'admin' | 'owner'
  joined_at: string
}

export class GroupService {
  /**
   * 추천 그룹 조회 (멤버 수 기준)
   */
  static async getRecommendedGroups(userId?: string, limit: number = 4): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('member_count', { ascending: false })
        .limit(limit)

      if (error || !data || data.length === 0) {
        console.error('추천 그룹 조회 오류:', error)
        // MOCK 데이터 반환
        return this.getMockGroups()
      }

      return data
    } catch (err) {
      console.error('그룹 서비스 오류:', err)
      return this.getMockGroups()
    }
  }

  /**
   * 사용자가 가입한 그룹 조회
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          groups (*)
        `)
        .eq('user_id', userId)

      if (error || !data) {
        console.error('사용자 그룹 조회 오류:', error)
        return []
      }

      return data.map(membership => membership.groups).filter(Boolean)
    } catch (err) {
      console.error('사용자 그룹 조회 서비스 오류:', err)
      return []
    }
  }

  /**
   * 그룹 가입
   */
  static async joinGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 이미 가입되어 있는지 확인
      const { data: existing, error: checkError } = await supabase
        .from('group_memberships')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        return { success: false, message: '이미 가입된 그룹입니다.' }
      }

      // 그룹 가입
      const { error: insertError } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        })

      if (insertError) {
        console.error('그룹 가입 오류:', insertError)
        return { success: false, message: '그룹 가입에 실패했습니다.' }
      }

      // 그룹 멤버 수 증가 (트리거가 있으면 자동으로 처리됨)
      const { error: updateError } = await supabase
        .rpc('increment_group_member_count', { group_id: groupId })

      if (updateError) {
        // 트리거가 없으면 수동으로 증가
        const { data: group, error: selectError } = await supabase
          .from('groups')
          .select('member_count')
          .eq('id', groupId)
          .single()

        if (!selectError && group) {
          await supabase
            .from('groups')
            .update({ member_count: group.member_count + 1 })
            .eq('id', groupId)
        }
      }

      return { success: true, message: '그룹에 성공적으로 가입되었습니다!' }
    } catch (err) {
      console.error('그룹 가입 서비스 오류:', err)
      return { success: false, message: '그룹 가입 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 그룹 탈퇴
   */
  static async leaveGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error: deleteError } = await supabase
        .from('group_memberships')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('그룹 탈퇴 오류:', deleteError)
        return { success: false, message: '그룹 탈퇴에 실패했습니다.' }
      }

      // 그룹 멤버 수 감소
      const { error: updateError } = await supabase
        .rpc('decrement_group_member_count', { group_id: groupId })

      if (updateError) {
        // 트리거가 없으면 수동으로 감소
        const { data: group, error: selectError } = await supabase
          .from('groups')
          .select('member_count')
          .eq('id', groupId)
          .single()

        if (!selectError && group) {
          await supabase
            .from('groups')
            .update({ member_count: Math.max(group.member_count - 1, 0) })
            .eq('id', groupId)
        }
      }

      return { success: true, message: '그룹에서 성공적으로 탈퇴되었습니다.' }
    } catch (err) {
      console.error('그룹 탈퇴 서비스 오류:', err)
      return { success: false, message: '그룹 탈퇴 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 그룹 멤버 목록 조회
   */
  static async getGroupMembers(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          profiles (id, username, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false })

      if (error || !data) {
        console.error('그룹 멤버 조회 오류:', error)
        return []
      }

      return data
    } catch (err) {
      console.error('그룹 멤버 조회 서비스 오류:', err)
      return []
    }
  }

  /**
   * 그룹 생성
   */
  static async createGroup(
    group: Omit<Group, 'id' | 'created_at' | 'updated_at'>,
    createdBy: string
  ): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...group,
          created_by: createdBy
        })
        .select()
        .single()

      if (error) {
        console.error('그룹 생성 오류:', error)
        return null
      }

      // 생성자를 owner로 자동 가입
      await supabase
        .from('group_memberships')
        .insert({
          group_id: data.id,
          user_id: createdBy,
          role: 'owner'
        })

      return data
    } catch (err) {
      console.error('그룹 생성 서비스 오류:', err)
      return null
    }
  }

  /**
   * 그룹 검색
   */
  static async searchGroups(query: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('member_count', { ascending: false })

      if (error || !data) {
        console.error('그룹 검색 오류:', error)
        return []
      }

      return data
    } catch (err) {
      console.error('그룹 검색 서비스 오류:', err)
      return []
    }
  }

  /**
   * MOCK 그룹 데이터 (실제 데이터 조회 실패 시 사용)
   */
  private static getMockGroups(): Group[] {
    return [
      {
        id: 'mock1',
        name: '신생아맘 모임',
        description: '0-6개월 신생아를 키우는 엄마들의 정보 공유 모임입니다. 수유, 잠자리, 발달 등 신생아 육아의 모든 것을 함께 나눠요.',
        member_count: 124,
        is_public: true,
        icon: '👶',
        color: 'purple'
      },
      {
        id: 'mock2',
        name: '이유식 레시피',
        description: '이유식 레시피 공유와 노하우를 나누는 그룹입니다. 초기부터 완료기까지 다양한 레시피와 팁을 공유해요.',
        member_count: 89,
        is_public: true,
        icon: '🍼',
        color: 'green'
      },
      {
        id: 'mock3',
        name: '워킹맘 라이프',
        description: '일과 육아를 병행하는 워킹맘들의 소통 공간입니다. 시간 관리, 육아 팁, 스트레스 관리법을 함께 나눠요.',
        member_count: 156,
        is_public: true,
        icon: '💼',
        color: 'blue'
      },
      {
        id: 'mock4',
        name: '아빠 육아단',
        description: '육아에 적극적으로 참여하는 아빠들의 모임입니다. 아빠만의 육아 노하우와 경험담을 공유해요.',
        member_count: 67,
        is_public: true,
        icon: '👨',
        color: 'orange'
      }
    ]
  }
}