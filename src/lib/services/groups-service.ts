import { createClient } from '@/lib/supabase/client'
import { Group, GroupMember, GroupWithDetails, GroupMemberWithProfile } from '@/types/database.types'

const supabase = createClient()

export class GroupsService {
  // Create a new group
  static async createGroup({
    name,
    description,
    category,
    privacy = 'public',
    rules,
    tags,
    location
  }: {
    name: string
    description: string
    category: 'parenting_stage' | 'topic_based' | 'location' | 'special_interest'
    privacy?: 'public' | 'private' | 'invite_only'
    rules?: string
    tags?: string[]
    location?: string
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          category,
          privacy,
          rules,
          tags,
          location,
          created_by: user.id,
          member_count: 1,
          post_count: 0
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as owner
      await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'owner',
          status: 'active'
        })

      return group.id
    } catch (error) {
      console.error('그룹 생성 오류:', error)
      return null
    }
  }

  // Get all groups with filtering options
  static async getGroups({
    category,
    location,
    search,
    userGroups = false,
    limit = 20,
    offset = 0
  }: {
    category?: string
    location?: string
    search?: string
    userGroups?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<GroupWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('groups')
        .select(`
          *,
          created_by_profile:profiles!groups_created_by_fkey(username, full_name, avatar_url),
          group_posts(
            posts(
              id,
              title,
              content,
              created_at,
              profiles!inner(username, avatar_url)
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Apply filters
      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (location) {
        query = query.eq('location', location)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // If userGroups is true, only show groups where user is a member
      if (userGroups && user) {
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('status', 'active')

        if (memberGroups && memberGroups.length > 0) {
          const groupIds = memberGroups.map(mg => mg.group_id)
          query = query.in('id', groupIds)
        } else {
          return [] // User is not a member of any groups
        }
      }

      const { data: groups, error } = await query
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Get user membership status for each group
      const groupsWithMembership: GroupWithDetails[] = []

      for (const group of groups || []) {
        let userMembership = undefined

        if (user) {
          const { data: membership } = await supabase
            .from('group_members')
            .select('*')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .single()

          userMembership = membership
        }

        groupsWithMembership.push({
          ...group,
          user_membership: userMembership,
          recent_posts: group.group_posts.slice(0, 3) // Show only recent 3 posts
        })
      }

      return groupsWithMembership
    } catch (error) {
      console.error('그룹 목록 조회 오류:', error)
      return []
    }
  }

  // Get single group with detailed information
  static async getGroup(groupId: string): Promise<GroupWithDetails | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: group, error } = await supabase
        .from('groups')
        .select(`
          *,
          created_by_profile:profiles!groups_created_by_fkey(username, full_name, avatar_url)
        `)
        .eq('id', groupId)
        .eq('is_active', true)
        .single()

      if (error) throw error

      // Get user membership
      let userMembership = undefined
      if (user) {
        const { data: membership } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single()

        userMembership = membership
      }

      // Get recent posts
      const { data: recentPosts } = await supabase
        .from('group_posts')
        .select(`
          *,
          posts(
            *,
            profiles!inner(username, full_name, avatar_url)
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(5)

      return {
        ...group,
        user_membership: userMembership,
        recent_posts: recentPosts || []
      }
    } catch (error) {
      console.error('그룹 상세 조회 오류:', error)
      return null
    }
  }

  // Join a group
  static async joinGroup(groupId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if group exists and get its privacy setting
      const { data: group } = await supabase
        .from('groups')
        .select('privacy')
        .eq('id', groupId)
        .single()

      if (!group) throw new Error('그룹을 찾을 수 없습니다')

      const status = group.privacy === 'private' || group.privacy === 'invite_only' ? 'pending' : 'active'

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          status
        })

      if (memberError) throw memberError

      // Update member count if immediately active
      if (status === 'active') {
        const { error: countError } = await supabase.rpc('increment_group_member_count', {
          group_id: groupId
        })

        if (countError) console.error('멤버 수 업데이트 오류:', countError)
      }

      return true
    } catch (error) {
      console.error('그룹 가입 오류:', error)
      return false
    }
  }

  // Leave a group
  static async leaveGroup(groupId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Remove user from group
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update member count
      const { error: countError } = await supabase.rpc('decrement_group_member_count', {
        group_id: groupId
      })

      if (countError) console.error('멤버 수 업데이트 오류:', countError)

      return true
    } catch (error) {
      console.error('그룹 탈퇴 오류:', error)
      return false
    }
  }

  // Get group members
  static async getGroupMembers(groupId: string, limit = 20, offset = 0): Promise<GroupMemberWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url, parenting_stage)
        `)
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('그룹 멤버 조회 오류:', error)
      return []
    }
  }

  // Update user role in group (admin/owner only)
  static async updateMemberRole(
    groupId: string,
    userId: string,
    newRole: 'member' | 'moderator' | 'admin'
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if current user has permission to update roles
      const { data: currentUserRole } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole.role)) {
        throw new Error('권한이 없습니다')
      }

      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', userId)

      return !error
    } catch (error) {
      console.error('멤버 역할 업데이트 오류:', error)
      return false
    }
  }

  // Add post to group
  static async addPostToGroup(groupId: string, postId: string, pinned = false): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          post_id: postId,
          pinned,
          featured: false
        })

      if (!error) {
        // Update group post count
        const { error: countError } = await supabase.rpc('increment_group_post_count', {
          group_id: groupId
        })

        if (countError) console.error('게시글 수 업데이트 오류:', countError)
      }

      return !error
    } catch (error) {
      console.error('그룹 게시글 추가 오류:', error)
      return false
    }
  }

  // Get recommended groups for user
  static async getRecommendedGroups(limit = 10): Promise<GroupWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get user's profile to determine parenting stage
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('parenting_stage, location')
        .eq('id', user.id)
        .single()

      let query = supabase
        .from('groups')
        .select(`
          *,
          created_by_profile:profiles!groups_created_by_fkey(username, full_name, avatar_url)
        `)
        .eq('is_active', true)
        .eq('privacy', 'public')

      // Recommend groups based on parenting stage
      if (userProfile?.parenting_stage) {
        query = query.or(`category.eq.parenting_stage,tags.cs.{${userProfile.parenting_stage}}`)
      }

      // Prioritize groups in same location
      if (userProfile?.location) {
        query = query.eq('location', userProfile.location)
      }

      const { data: groups, error } = await query
        .order('member_count', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Filter out groups user is already a member of
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      const userGroupIds = new Set(userGroups?.map(ug => ug.group_id) || [])

      return (groups || [])
        .filter(group => !userGroupIds.has(group.id))
        .map(group => ({
          ...group,
          user_membership: undefined,
          recent_posts: []
        }))
    } catch (error) {
      console.error('추천 그룹 조회 오류:', error)
      return []
    }
  }

  // Search groups
  static async searchGroups(query: string, filters?: {
    category?: string
    location?: string
  }): Promise<GroupWithDetails[]> {
    try {
      return this.getGroups({
        search: query,
        category: filters?.category,
        location: filters?.location,
        limit: 50
      })
    } catch (error) {
      console.error('그룹 검색 오류:', error)
      return []
    }
  }
}