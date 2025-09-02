import { PostForm } from '@/components/posts/post-form'

export const dynamic = 'force-dynamic'

export default function WritePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PostForm mode="create" />
    </div>
  )
}