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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          author_name: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          author_name?: string
          content?: string
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
}