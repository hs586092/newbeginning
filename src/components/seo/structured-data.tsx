export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '뉴비기닝',
    description: '개발자와 IT 전문가를 위한 구인구직 및 커뮤니티 플랫폼',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app',
    sameAs: [
      'https://github.com/newbeginning-dev',
      'https://twitter.com/newbeginning_dev'
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app'}/?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

interface JobPostingProps {
  post: {
    id: string
    title: string
    content: string
    company?: string
    location?: string
    salary?: string
    category: string
    created_at: string
    deadline?: string
  }
}

export function JobPostingStructuredData({ post }: JobPostingProps) {
  if (post.category !== 'job_offer') return null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.content,
    datePosted: post.created_at,
    validThrough: post.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: post.company || '미공개',
      sameAs: process.env.NEXT_PUBLIC_SITE_URL || 'https://newbeginning-community.vercel.app'
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: post.location || '위치 미공개',
        addressCountry: 'KR'
      }
    },
    baseSalary: post.salary ? {
      '@type': 'MonetaryAmount',
      currency: 'KRW',
      value: {
        '@type': 'QuantitativeValue',
        value: post.salary
      }
    } : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}