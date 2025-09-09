export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ParentWise',
    description: 'Global parenting community for pregnancy, newborn care, and child development support',
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

