import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app'

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/write`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  // 동적 페이지 (게시글)
  let dynamicPages: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: posts } = await supabase
      .from('posts')
      .select('id, updated_at, category')
      .order('updated_at', { ascending: false })
      .limit(1000)

    if (posts && posts.length > 0) {
      dynamicPages = posts.map((post: any) => ({
        url: `${baseUrl}/post/${post.id}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return [...staticPages, ...dynamicPages]
}