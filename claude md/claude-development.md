# Development Guide - NewBeginning

> 🎯 **컴포넌트 개발, State 관리, Custom Hooks 상세 가이드**

---

## 📚 목차

1. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
2. [State Management 패턴](#state-management-패턴)
3. [Custom Hooks 패턴](#custom-hooks-패턴)
4. [Context 패턴](#context-패턴)
5. [컴포넌트 최적화](#컴포넌트-최적화)
6. [이벤트 처리](#이벤트-처리)
7. [개발 워크플로우](#개발-워크플로우)

---

## 🏗️ 컴포넌트 아키텍처

### 계층 구조
```
src/components/
├── ui/              # 기본 UI 컴포넌트 (Button, Input 등)
├── layout/          # 레이아웃 컴포넌트 (Header, Footer 등)  
├── post/            # 게시글 관련 컴포넌트
├── user/            # 사용자 관련 컴포넌트
├── common/          # 공통 컴포넌트 (ErrorBoundary, Loading 등)
└── pages/           # 페이지별 컴포넌트
```

### 컴포넌트 작성 원칙

#### 1. 단일 책임 원칙
```typescript
// ✅ 좋은 예: 명확한 단일 책임
interface PostCardProps {
  post: PostWithDetails
  onLike?: (postId: string) => void
  showAuthor?: boolean
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, showAuthor = true }) => {
  return (
    <article className="bg-white rounded-lg shadow-sm border p-6">
      {showAuthor && <PostAuthor author={post.profiles} />}
      <PostContent title={post.title} content={post.content} />
      <PostActions post={post} onLike={onLike} />
    </article>
  )
}

// ❌ 나쁜 예: 너무 많은 책임
const PostWithCommentsAndUserProfile = () => {
  // 게시글 + 댓글 + 사용자 프로필 모두 처리
}
```

#### 2. Props 인터페이스 정의
```typescript
// ✅ 명확한 Props 정의
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  className
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        // variant styles
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        // size styles  
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        // state styles
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}
```

#### 3. 컴포넌트 합성 패턴
```typescript
// ✅ 합성 패턴으로 유연성 제공
const PostCard = {
  Root: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <article className={cn("bg-white rounded-lg shadow-sm border", className)}>
      {children}
    </article>
  ),
  
  Header: ({ author, createdAt }: { author: Profile; createdAt: string }) => (
    <header className="flex items-center gap-3 p-4 border-b">
      <Avatar src={author.avatar_url} alt={author.username} />
      <div>
        <h3 className="font-medium">{author.username}</h3>
        <time className="text-sm text-gray-500">{formatDate(createdAt)}</time>
      </div>
    </header>
  ),
  
  Content: ({ title, content }: { title: string; content: string }) => (
    <div className="p-4">
      <h2 className="font-semibold mb-2">{title}</h2>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  ),
  
  Actions: ({ post, onLike }: { post: PostWithDetails; onLike?: (id: string) => void }) => (
    <footer className="flex items-center gap-4 px-4 py-3 border-t">
      <LikeButton 
        postId={post.id} 
        initialLiked={post.userLiked} 
        initialCount={post._count?.likes || 0}
        onLike={onLike}
      />
      <CommentButton postId={post.id} count={post._count?.comments || 0} />
    </footer>
  )
}

// 사용 예시
const PostList = ({ posts }: { posts: PostWithDetails[] }) => {
  const { toggleLike } = useLikePost()
  
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard.Root key={post.id}>
          <PostCard.Header author={post.profiles} createdAt={post.created_at} />
          <PostCard.Content title={post.title} content={post.content} />
          <PostCard.Actions post={post} onLike={toggleLike} />
        </PostCard.Root>
      ))}
    </div>
  )
}
```

---

## 📊 State Management 패턴

### 1. Context + useReducer 패턴

#### 상태 정의
```typescript
// types/auth.types.ts
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' }

// reducers/authReducer.ts
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    
    case 'AUTH_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null }
    
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload }
    
    case 'AUTH_LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    
    case 'AUTH_RESET_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}
```

#### Context 구현
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: false,
    error: null
  })
  
  const supabase = createClientComponentClient<Database>()

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      if (!data.user) throw new Error('로그인에 실패했습니다.')
      
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인 오류'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message })
      throw error
    }
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const resetError = () => {
    dispatch({ type: 'AUTH_RESET_ERROR' })
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, resetError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 2. Optimistic Updates 패턴

```typescript
// hooks/useOptimisticLike.ts
export const useOptimisticLike = () => {
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, {
    liked: boolean
    count: number
  }>>({})

  const toggleLike = async (
    postId: string, 
    currentLiked: boolean, 
    currentCount: number
  ) => {
    const optimisticState = {
      liked: !currentLiked,
      count: currentLiked ? currentCount - 1 : currentCount + 1
    }
    
    // 즉시 UI 업데이트
    setOptimisticLikes(prev => ({
      ...prev,
      [postId]: optimisticState
    }))

    try {
      const { data, error } = await supabase
        .rpc('toggle_post_like', { post_id: postId })
      
      if (error) throw error
      
      // 성공시 실제 데이터로 업데이트 (일관성 확보)
      setOptimisticLikes(prev => ({
        ...prev,
        [postId]: {
          liked: data.liked,
          count: data.like_count
        }
      }))
      
    } catch (error) {
      // 실패시 롤백
      setOptimisticLikes(prev => ({
        ...prev,
        [postId]: {
          liked: currentLiked,
          count: currentCount
        }
      }))
      
      toast.error('좋아요 처리 중 오류가 발생했습니다.')
      throw error
    }
  }

  return { optimisticLikes, toggleLike }
}
```

---

## 🎣 Custom Hooks 패턴

### 1. 데이터 Fetching Hook

```typescript
// hooks/usePosts.ts
interface UsePostsOptions {
  category?: PostCategory
  userId?: string
  limit?: number
  enabled?: boolean
}

interface UsePostsReturn {
  posts: PostWithDetails[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  createPost: (data: PostCreateRequest) => Promise<void>
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const {
    category,
    userId,
    limit = 20,
    enabled = true
  } = options

  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const supabase = createClientComponentClient<Database>()

  const fetchPosts = async (isLoadMore = false) => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          ),
          _count:post_likes_count (
            likes:count
          ),
          _count_comments:post_comments_count (
            comments:count
          )
        `)
        .order('created_at', { ascending: false })
        .range(isLoadMore ? offset : 0, isLoadMore ? offset + limit - 1 : limit - 1)

      if (category) {
        query = query.eq('category', category)
      }
      
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const newPosts = data || []
      
      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts])
        setOffset(prev => prev + limit)
      } else {
        setPosts(newPosts)
        setOffset(limit)
      }
      
      setHasMore(newPosts.length === limit)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loading || !hasMore) return
    await fetchPosts(true)
  }

  const refresh = async () => {
    setOffset(0)
    await fetchPosts(false)
  }

  const createPost = async (data: PostCreateRequest) => {
    try {
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([data])
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // 새 게시글을 목록 상단에 추가
      setPosts(prev => [newPost, ...prev])
      
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글 생성에 실패했습니다.'
      throw new Error(message)
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchPosts(false)
  }, [category, userId, enabled])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    createPost
  }
}
```

### 2. Form 처리 Hook

```typescript
// hooks/useForm.ts
interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Record<keyof T, string>
  onSubmit: (values: T) => Promise<void> | void
}

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, error: string) => void
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  reset: () => void
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> => {
  const { initialValues, validate, onSubmit } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // 값 변경시 해당 필드 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const setError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(field, e.target.value)
  }

  const handleBlur = (field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // blur시 유효성 검증
    if (validate) {
      const fieldErrors = validate(values)
      if (fieldErrors[field]) {
        setError(field, fieldErrors[field])
      }
    }
  }

  const validateForm = (): boolean => {
    if (!validate) return true
    
    const formErrors = validate(values)
    const errorKeys = Object.keys(formErrors) as (keyof T)[]
    
    setErrors(formErrors)
    setTouched(
      errorKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
    )
    
    return errorKeys.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(values)
    } catch (error) {
      // onSubmit에서 발생한 에러는 컴포넌트에서 처리
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  }
}

// 사용 예시
const PostCreateForm = () => {
  const { createPost } = usePosts()
  
  const form = useForm({
    initialValues: {
      title: '',
      content: '',
      category: 'community' as PostCategory
    },
    validate: (values) => {
      const errors: any = {}
      
      if (!values.title.trim()) {
        errors.title = '제목을 입력하세요'
      } else if (values.title.length > 100) {
        errors.title = '제목은 100자를 초과할 수 없습니다'
      }
      
      if (!values.content.trim()) {
        errors.content = '내용을 입력하세요'
      } else if (values.content.length > 1000) {
        errors.content = '내용은 1000자를 초과할 수 없습니다'
      }
      
      return errors
    },
    onSubmit: async (values) => {
      await createPost(values)
      form.reset()
      toast.success('게시글이 생성되었습니다')
    }
  })

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="제목"
          value={form.values.title}
          onChange={form.handleChange('title')}
          onBlur={form.handleBlur('title')}
          className={cn(
            'w-full px-3 py-2 border rounded-md',
            form.errors.title && form.touched.title && 'border-red-500'
          )}
        />
        {form.errors.title && form.touched.title && (
          <p className="text-sm text-red-500 mt-1">{form.errors.title}</p>
        )}
      </div>
      
      <div>
        <textarea
          placeholder="내용"
          value={form.values.content}
          onChange={form.handleChange('content')}
          onBlur={form.handleBlur('content')}
          rows={4}
          className={cn(
            'w-full px-3 py-2 border rounded-md',
            form.errors.content && form.touched.content && 'border-red-500'
          )}
        />
        {form.errors.content && form.touched.content && (
          <p className="text-sm text-red-500 mt-1">{form.errors.content}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        loading={form.isSubmitting}
        disabled={!form.isValid}
      >
        게시글 작성
      </Button>
    </form>
  )
}
```

---

## 🎯 Context 패턴

### Global State Context
```typescript
// contexts/AppContext.tsx
interface AppState {
  theme: 'light' | 'dark'
  language: 'ko' | 'en'
  sidebarOpen: boolean
}

interface AppContextType {
  state: AppState
  toggleTheme: () => void
  setLanguage: (lang: 'ko' | 'en') => void
  toggleSidebar: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    theme: 'light',
    language: 'ko',
    sidebarOpen: false
  })

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }))
  }

  const setLanguage = (language: 'ko' | 'en') => {
    setState(prev => ({ ...prev, language }))
  }

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }

  return (
    <AppContext.Provider value={{
      state,
      toggleTheme,
      setLanguage,
      toggleSidebar
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
```

---

## ⚡ 컴포넌트 최적화

### 1. React.memo와 콜백 최적화
```typescript
// ✅ React.memo로 불필요한 리렌더링 방지
const PostCard = React.memo<PostCardProps>(({ post, onLike, onComment }) => {
  return (
    <article className="post-card">
      <PostContent post={post} />
      <PostActions 
        postId={post.id}
        onLike={onLike}
        onComment={onComment}
      />
    </article>
  )
})

// ✅ 부모 컴포넌트에서 콜백 최적화
const PostList = ({ posts }: { posts: PostWithDetails[] }) => {
  const { toggleLike } = useLikePost()
  const { addComment } = useComments()

  // useCallback으로 함수 안정성 보장
  const handleLike = useCallback((postId: string) => {
    toggleLike(postId)
  }, [toggleLike])

  const handleComment = useCallback((postId: string, content: string) => {
    addComment(postId, content)
  }, [addComment])

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
        />
      ))}
    </div>
  )
}
```

### 2. 가상화(Virtualization) 패턴
```typescript
// hooks/useVirtualizedList.ts
interface UseVirtualizedListOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export const useVirtualizedList = <T>(
  items: T[],
  options: UseVirtualizedListOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + overscan, items.length)

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    startIndex,
    offsetY,
    totalHeight,
    setScrollTop
  }
}

// 사용 예시
const VirtualizedPostList = ({ posts }: { posts: PostWithDetails[] }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const ITEM_HEIGHT = 200
  const CONTAINER_HEIGHT = 600

  const {
    visibleItems,
    startIndex,
    offsetY,
    totalHeight,
    setScrollTop
  } = useVirtualizedList(posts, {
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT
  })

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: CONTAINER_HEIGHT }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((post, index) => (
            <div
              key={post.id}
              style={{ height: ITEM_HEIGHT }}
              className="border-b"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 🎬 이벤트 처리

### 1. 키보드 접근성
```typescript
// hooks/useKeyboardNavigation.ts
export const useKeyboardNavigation = (items: any[], onSelect: (item: any) => void) => {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && items[focusedIndex]) {
          onSelect(items[focusedIndex])
        }
        break
      
      case 'Escape':
        setFocusedIndex(-1)
        break
    }
  }, [items, focusedIndex, onSelect])

  return {
    focusedIndex,
    handleKeyDown,
    setFocusedIndex
  }
}
```

### 2. 제스처 처리 (모바일)
```typescript
// hooks/useSwipeGesture.ts
interface SwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export const useSwipeGesture = (options: SwipeOptions) => {
  const { threshold = 50, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = options
  
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return
    
    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    } else if (isUpSwipe && onSwipeUp) {
      onSwipeUp()
    } else if (isDownSwipe && onSwipeDown) {
      onSwipeDown()
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}
```

---

## 🔄 개발 워크플로우

### 1. 컴포넌트 개발 체크리스트
```typescript
// ✅ 새 컴포넌트 생성시 체크리스트
const ComponentTemplate = () => {
  // 1. Props 인터페이스 정의 ✅
  // 2. 기본값 설정 ✅  
  // 3. 상태 관리 (필요시) ✅
  // 4. 이벤트 핸들러 ✅
  // 5. 접근성 속성 ✅
  // 6. 에러 경계 처리 ✅
  // 7. 로딩 상태 처리 ✅
  // 8. 타입스크립트 검증 ✅
}
```

### 2. 코드 리뷰 가이드라인
- **Props**: 인터페이스가 명확한가?
- **책임**: 단일 책임 원칙을 따르는가?
- **재사용성**: 다른 곳에서 재사용 가능한가?
- **접근성**: 키보드 접근 및 스크린 리더 지원이 있는가?
- **성능**: 불필요한 리렌더링이 없는가?
- **테스트**: 주요 기능이 테스트되었는가?

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-api.md](./claude-api.md)