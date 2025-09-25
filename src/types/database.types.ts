export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name?: string
          avatar_url?: string
          created_at: string
          // Global parenting profile
          parenting_stage?: 'expecting' | 'newborn' | 'infant' | 'toddler' | 'preschool' | 'school_age' | 'teen' | 'adult_child'
          parenting_role?: 'mother' | 'father' | 'guardian' | 'caregiver' | 'grandparent' | 'expecting_parent'
          location?: string
          timezone?: string
          language_preference?: string
          baby_info?: {
            due_date?: string
            birth_dates?: string[]
            child_count?: number
            child_ages?: number[]
          }
          privacy_settings?: {
            show_location?: boolean
            show_children_info?: boolean
            allow_messages?: boolean
          }
        }
        Insert: {
          id: string
          username: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          parenting_stage?: 'expecting' | 'newborn' | 'infant' | 'toddler' | 'preschool' | 'school_age' | 'teen' | 'adult_child'
          parenting_role?: 'mother' | 'father' | 'guardian' | 'caregiver' | 'grandparent' | 'expecting_parent'
          location?: string
          timezone?: string
          language_preference?: string
          baby_info?: {
            due_date?: string
            birth_dates?: string[]
            child_count?: number
            child_ages?: number[]
          }
          privacy_settings?: {
            show_location?: boolean
            show_children_info?: boolean
            allow_messages?: boolean
          }
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          parenting_stage?: 'expecting' | 'newborn' | 'infant' | 'toddler' | 'preschool' | 'school_age' | 'teen' | 'adult_child'
          parenting_role?: 'mother' | 'father' | 'guardian' | 'caregiver' | 'grandparent' | 'expecting_parent'
          location?: string
          timezone?: string
          language_preference?: string
          baby_info?: {
            due_date?: string
            birth_dates?: string[]
            child_count?: number
            child_ages?: number[]
          }
          privacy_settings?: {
            show_location?: boolean
            show_children_info?: boolean
            allow_messages?: boolean
          }
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          author_name: string
          title: string
          content: string
          category: 'community' | 'expecting' | 'newborn' | 'toddler' | 'expert'
          image_url?: string
          view_count: number
          created_at: string
          updated_at: string
          is_question?: boolean
          baby_month?: number
          tags?: string[]
          mood?: string
        }
        Insert: {
          id?: string
          user_id: string
          author_name: string
          title: string
          content: string
          category: 'community' | 'expecting' | 'newborn' | 'toddler' | 'expert'
          image_url?: string
          view_count?: number
          created_at?: string
          updated_at?: string
          is_question?: boolean
          baby_month?: number
          tags?: string[]
          mood?: string
        }
        Update: {
          id?: string
          user_id?: string
          author_name?: string
          title?: string
          content?: string
          category?: 'community' | 'expecting' | 'newborn' | 'toddler' | 'expert'
          image_url?: string
          view_count?: number
          created_at?: string
          updated_at?: string
          is_question?: boolean
          baby_month?: number
          tags?: string[]
          mood?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          author_name: string
          content: string
          parent_comment_id: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          author_name: string
          content: string
          parent_comment_id?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          author_name?: string
          content?: string
          parent_comment_id?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      educational_metadata: {
        Row: {
          id: string
          post_id: string
          display_priority: number
          target_audience: 'expecting_parents' | 'new_parents' | 'toddler_parents' | 'all_parents'
          content_type: 'article' | 'infographic' | 'checklist' | 'guide' | 'tips'
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          estimated_read_time: number
          keywords: string[]
          is_featured: boolean
          expert_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          display_priority?: number
          target_audience: 'expecting_parents' | 'new_parents' | 'toddler_parents' | 'all_parents'
          content_type: 'article' | 'infographic' | 'checklist' | 'guide' | 'tips'
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_read_time?: number
          keywords?: string[]
          is_featured?: boolean
          expert_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          display_priority?: number
          target_audience?: 'expecting_parents' | 'new_parents' | 'toddler_parents' | 'all_parents'
          content_type?: 'article' | 'infographic' | 'checklist' | 'guide' | 'tips'
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_read_time?: number
          keywords?: string[]
          is_featured?: boolean
          expert_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'follow' | 'like' | 'comment' | 'reply' | 'mention'
          title: string
          message: string
          read: boolean
          data?: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'follow' | 'like' | 'comment' | 'reply' | 'mention'
          title: string
          message: string
          read?: boolean
          data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'follow' | 'like' | 'comment' | 'reply' | 'mention'
          title?: string
          message?: string
          read?: boolean
          data?: any
          created_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: 'post_created' | 'comment_added' | 'post_liked' | 'user_followed'
          target_id?: string
          target_type?: 'post' | 'comment' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'post_created' | 'comment_added' | 'post_liked' | 'user_followed'
          target_id?: string
          target_type?: 'post' | 'comment' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'post_created' | 'comment_added' | 'post_liked' | 'user_followed'
          target_id?: string
          target_type?: 'post' | 'comment' | 'user'
          created_at?: string
        }
      }
      // Phase 2: Gamification System
      user_points: {
        Row: {
          id: string
          user_id: string
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          points: number
          action_type: 'post_created' | 'comment_added' | 'post_liked' | 'comment_liked' | 'user_followed' | 'daily_login' | 'profile_completed' | 'helpful_answer' | 'badge_earned'
          reference_id?: string
          reference_type?: 'post' | 'comment' | 'user' | 'badge'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          action_type: 'post_created' | 'comment_added' | 'post_liked' | 'comment_liked' | 'user_followed' | 'daily_login' | 'profile_completed' | 'helpful_answer' | 'badge_earned'
          reference_id?: string
          reference_type?: 'post' | 'comment' | 'user' | 'badge'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          action_type?: 'post_created' | 'comment_added' | 'post_liked' | 'comment_liked' | 'user_followed' | 'daily_login' | 'profile_completed' | 'helpful_answer' | 'badge_earned'
          reference_id?: string
          reference_type?: 'post' | 'comment' | 'user' | 'badge'
          description?: string
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
          progress?: number
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
          progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
          progress?: number
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: 'posting' | 'engagement' | 'social' | 'milestone' | 'special'
          requirement_type: 'count' | 'streak' | 'achievement'
          requirement_value: number
          requirement_action?: string
          points_reward: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          category: 'posting' | 'engagement' | 'social' | 'milestone' | 'special'
          requirement_type: 'count' | 'streak' | 'achievement'
          requirement_value: number
          requirement_action?: string
          points_reward: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: 'posting' | 'engagement' | 'social' | 'milestone' | 'special'
          requirement_type?: 'count' | 'streak' | 'achievement'
          requirement_value?: number
          requirement_action?: string
          points_reward?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          is_active?: boolean
          created_at?: string
        }
      }
      // Phase 2: Messaging System
      conversations: {
        Row: {
          id: string
          type: 'private' | 'group'
          name?: string
          description?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'private' | 'group'
          name?: string
          description?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'private' | 'group'
          name?: string
          description?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: 'member' | 'moderator' | 'admin'
          joined_at: string
          last_read_at?: string
          is_active: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: 'member' | 'moderator' | 'admin'
          joined_at?: string
          last_read_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: 'member' | 'moderator' | 'admin'
          joined_at?: string
          last_read_at?: string
          is_active?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          content: string
          message_type: 'text' | 'image' | 'file' | 'system'
          reply_to_id?: string
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          content: string
          message_type?: 'text' | 'image' | 'file' | 'system'
          reply_to_id?: string
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'system'
          reply_to_id?: string
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Phase 2: Groups and Communities
      groups: {
        Row: {
          id: string
          name: string
          description: string
          category: 'parenting_stage' | 'topic_based' | 'location' | 'special_interest'
          privacy: 'public' | 'private' | 'invite_only'
          avatar_url?: string
          cover_image?: string
          member_count: number
          post_count: number
          rules?: string
          tags?: string[]
          location?: string
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'parenting_stage' | 'topic_based' | 'location' | 'special_interest'
          privacy?: 'public' | 'private' | 'invite_only'
          avatar_url?: string
          cover_image?: string
          member_count?: number
          post_count?: number
          rules?: string
          tags?: string[]
          location?: string
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'parenting_stage' | 'topic_based' | 'location' | 'special_interest'
          privacy?: 'public' | 'private' | 'invite_only'
          avatar_url?: string
          cover_image?: string
          member_count?: number
          post_count?: number
          rules?: string
          tags?: string[]
          location?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'member' | 'moderator' | 'admin' | 'owner'
          status: 'active' | 'pending' | 'banned'
          joined_at: string
          last_activity_at?: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'member' | 'moderator' | 'admin' | 'owner'
          status?: 'active' | 'pending' | 'banned'
          joined_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'member' | 'moderator' | 'admin' | 'owner'
          status?: 'active' | 'pending' | 'banned'
          joined_at?: string
          last_activity_at?: string
        }
      }
      group_posts: {
        Row: {
          id: string
          group_id: string
          post_id: string
          pinned: boolean
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          post_id: string
          pinned?: boolean
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          post_id?: string
          pinned?: boolean
          featured?: boolean
          created_at?: string
        }
      }
      // Phase 2: Bookmarking and Social Sharing
      bookmarks: {
        Row: {
          id: string
          user_id: string
          post_id: string
          category?: string
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          category?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          category?: string
          notes?: string
          created_at?: string
        }
      }
      social_shares: {
        Row: {
          id: string
          post_id: string
          user_id: string
          platform: 'facebook' | 'twitter' | 'instagram' | 'kakaotalk' | 'line' | 'link_copy'
          share_count: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          platform: 'facebook' | 'twitter' | 'instagram' | 'kakaotalk' | 'line' | 'link_copy'
          share_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          platform?: 'facebook' | 'twitter' | 'instagram' | 'kakaotalk' | 'line' | 'link_copy'
          share_count?: number
          created_at?: string
        }
      }
      // Phase 2: Events and Mentorship
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_type: 'playdate' | 'workshop' | 'meetup' | 'support_group' | 'online_class'
          location?: string
          virtual_link?: string
          start_date: string
          end_date: string
          max_participants?: number
          current_participants: number
          age_range?: string
          cost?: number
          requirements?: string
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_type: 'playdate' | 'workshop' | 'meetup' | 'support_group' | 'online_class'
          location?: string
          virtual_link?: string
          start_date: string
          end_date: string
          max_participants?: number
          current_participants?: number
          age_range?: string
          cost?: number
          requirements?: string
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_type?: 'playdate' | 'workshop' | 'meetup' | 'support_group' | 'online_class'
          location?: string
          virtual_link?: string
          start_date?: string
          end_date?: string
          max_participants?: number
          current_participants?: number
          age_range?: string
          cost?: number
          requirements?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'attending' | 'maybe' | 'not_attending' | 'waitlist'
          registered_at: string
          attended: boolean
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: 'attending' | 'maybe' | 'not_attending' | 'waitlist'
          registered_at?: string
          attended?: boolean
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: 'attending' | 'maybe' | 'not_attending' | 'waitlist'
          registered_at?: string
          attended?: boolean
        }
      }
      mentorship_programs: {
        Row: {
          id: string
          mentor_id: string
          mentee_id: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          topic_focus?: string
          duration_weeks?: number
          meeting_frequency?: string
          start_date?: string
          end_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          mentee_id: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          topic_focus?: string
          duration_weeks?: number
          meeting_frequency?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          mentee_id?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          topic_focus?: string
          duration_weeks?: number
          meeting_frequency?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      expert_verification: {
        Row: {
          id: string
          user_id: string
          profession: 'pediatrician' | 'childcare_specialist' | 'nutritionist' | 'child_psychologist' | 'lactation_consultant' | 'other'
          credentials: string
          verification_document?: string
          verification_status: 'pending' | 'verified' | 'rejected'
          verified_by?: string
          verified_at?: string
          expires_at?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profession: 'pediatrician' | 'childcare_specialist' | 'nutritionist' | 'child_psychologist' | 'lactation_consultant' | 'other'
          credentials: string
          verification_document?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verified_by?: string
          verified_at?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profession?: 'pediatrician' | 'childcare_specialist' | 'nutritionist' | 'child_psychologist' | 'lactation_consultant' | 'other'
          credentials?: string
          verification_document?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verified_by?: string
          verified_at?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
}

export type PostWithDetails = Database['public']['Tables']['posts']['Row'] & {
  profiles: {
    username: string
    avatar_url?: string
  }
  likes: { id: string }[]
  comments: { id: string }[]
  educational_metadata?: Database['public']['Tables']['educational_metadata']['Row']
  _count?: {
    likes: number
    comments: number
  }
}

export type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: {
    username: string
    avatar_url?: string
  }
  replies?: CommentWithProfile[]
}

// RPC 함수 결과 타입
export type CommentRPC = {
  id: string
  post_id: string
  user_id: string
  author_name: string
  content: string
  parent_comment_id: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
  profile_username: string | null
  profile_avatar_url: string | null
  reply_count: number
  like_count: number
}

// 좋아요 시스템용 새 타입들
export type PostLike = Database['public']['Tables']['likes']['Row']

export type PostLikeWithProfile = PostLike & {
  profiles: {
    username: string
    avatar_url?: string
  }
  posts: {
    title: string
    category: string
  }
}

export type PostLikeRPC = {
  id: string
  post_id: string
  user_id: string
  created_at: string
  profile_username: string | null
  profile_avatar_url: string | null
  post_title: string
  post_category: string
  like_count: number
}

export type LikeToggleResponse = {
  success: boolean
  liked: boolean
  like_count: number
}

// 확장 가능한 인터랙션 타입
export type InteractionType = 'like' | 'bookmark' | 'comment' | 'share'

export type PostInteraction = {
  id: string
  post_id: string
  user_id: string
  type: InteractionType
  created_at: string
  metadata?: Record<string, any>
}

// 팔로우 시스템 타입들
export type Follow = Database['public']['Tables']['follows']['Row']

export type FollowWithProfile = Follow & {
  follower_profile: {
    username: string
    full_name?: string
    avatar_url?: string
    parenting_stage?: string
  }
  following_profile: {
    username: string
    full_name?: string
    avatar_url?: string
    parenting_stage?: string
  }
}

export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  followers_count: number
  following_count: number
  is_following?: boolean
  is_followed_by?: boolean
}

// 알림 시스템 타입들
export type Notification = Database['public']['Tables']['notifications']['Row']

export type NotificationWithProfile = Notification & {
  from_user?: {
    username: string
    full_name?: string
    avatar_url?: string
  }
}

// 활동 피드 타입들
export type UserActivity = Database['public']['Tables']['user_activities']['Row']

export type ActivityFeedItem = UserActivity & {
  user_profile: {
    username: string
    full_name?: string
    avatar_url?: string
  }
  target_post?: {
    title: string
    category: string
  }
  target_user?: {
    username: string
    full_name?: string
  }
}

// Phase 2: Gamification System Types
export type UserPoints = Database['public']['Tables']['user_points']['Row']
export type PointTransaction = Database['public']['Tables']['point_transactions']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']

export type BadgeWithProgress = Badge & {
  earned?: boolean
  progress?: number
  earned_at?: string
}

export type LeaderboardEntry = {
  user_id: string
  username: string
  full_name?: string
  avatar_url?: string
  total_points: number
  badges_count: number
  rank: number
}

export type PointsEarned = {
  points: number
  action: string
  description: string
  badge_earned?: Badge
}

// Phase 2: Messaging System Types
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export type ConversationWithDetails = Conversation & {
  participants: (ConversationParticipant & {
    profiles: {
      username: string
      full_name?: string
      avatar_url?: string
    }
  })[]
  last_message?: Message & {
    profiles: {
      username: string
      avatar_url?: string
    }
  }
  unread_count: number
}

export type MessageWithProfile = Message & {
  profiles: {
    username: string
    full_name?: string
    avatar_url?: string
  }
  reply_to?: Message & {
    profiles: {
      username: string
    }
  }
}

// Phase 2: Groups and Communities Types
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupPost = Database['public']['Tables']['group_posts']['Row']

export type GroupWithDetails = Group & {
  created_by_profile: {
    username: string
    full_name?: string
    avatar_url?: string
  }
  user_membership?: GroupMember
  recent_posts?: (GroupPost & {
    posts: PostWithDetails
  })[]
}

export type GroupMemberWithProfile = GroupMember & {
  profiles: {
    username: string
    full_name?: string
    avatar_url?: string
    parenting_stage?: string
  }
}

// Phase 2: Social Features Types
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type SocialShare = Database['public']['Tables']['social_shares']['Row']

export type BookmarkWithPost = Bookmark & {
  posts: PostWithDetails
}

export type ShareStats = {
  platform: string
  count: number
}

// Phase 2: Events and Mentorship Types
export type Event = Database['public']['Tables']['events']['Row']
export type EventParticipant = Database['public']['Tables']['event_participants']['Row']
export type MentorshipProgram = Database['public']['Tables']['mentorship_programs']['Row']
export type ExpertVerification = Database['public']['Tables']['expert_verification']['Row']

export type EventWithDetails = Event & {
  created_by_profile: {
    username: string
    full_name?: string
    avatar_url?: string
  }
  participants: (EventParticipant & {
    profiles: {
      username: string
      full_name?: string
      avatar_url?: string
    }
  })[]
  user_participation?: EventParticipant
}

export type MentorshipWithProfiles = MentorshipProgram & {
  mentor_profile: {
    username: string
    full_name?: string
    avatar_url?: string
    expert_verification?: ExpertVerification
  }
  mentee_profile: {
    username: string
    full_name?: string
    avatar_url?: string
  }
}

export type VerifiedExpert = UserProfile & {
  expert_verification: ExpertVerification
}