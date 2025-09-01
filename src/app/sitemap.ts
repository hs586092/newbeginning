import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
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
    const supabase = await createServerSupabaseClient()
    const { data: posts } = await supabase
      .from('posts')
      .select('id, updated_at, category')
      .order('updated_at', { ascending: false })
      .limit(1000)

    if (posts) {
      dynamicPages = posts.map((post) => ({
        url: `${baseUrl}/post/${post.id}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: post.category === 'job_offer' ? 'weekly' as const : 'monthly' as const,
        priority: post.category === 'job_offer' ? 0.7 : 0.6,
      }))
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return [...staticPages, ...dynamicPages]
}