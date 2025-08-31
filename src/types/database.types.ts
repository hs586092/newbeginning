export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          author_name: string
          title: string
          content: string
          category: 'job_offer' | 'job_seek' | 'community'
          company?: string
          location?: string
          salary?: string
          contact?: string
          deadline?: string
          image_url?: string
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          author_name: string
          title: string
          content: string
          category: 'job_offer' | 'job_seek' | 'community'
          company?: string
          location?: string
          salary?: string
          contact?: string
          deadline?: string
          image_url?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          author_name?: string
          title?: string
          content?: string
          category?: 'job_offer' | 'job_seek' | 'community'
          company?: string
          location?: string
          salary?: string
          contact?: string
          deadline?: string
          image_url?: string
          view_count?: number
          created_at?: string
          updated_at?: string
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
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          author_name: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          author_name?: string
          content?: string
          created_at?: string
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