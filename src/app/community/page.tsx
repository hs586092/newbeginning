'use client'

import { useState } from 'react'
import { PlusCircle, Heart, Users, TrendingUp, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SocialFeed from '@/components/social/social-feed'
import CategoryFilter from '@/components/social/category-filter'
import PostForm from '@/components/social/post-form'
import { useTranslation } from '@/lib/i18n'

export default function CommunityPage() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBabyMonth, setSelectedBabyMonth] = useState<number | undefined>()
  const [showPostForm, setShowPostForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full text-pink-700 font-medium mb-4">
            <Users className="w-5 h-5" />
            <span>👶 {t('community.subtitle')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
              {t('community.title')}
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('community.description')}
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">2,847</div>
            <div className="text-sm text-gray-600">{t('community.activeParents')}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">12,456</div>
            <div className="text-sm text-gray-600">{t('community.sharedStories')}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">89,234</div>
            <div className="text-sm text-gray-600">{t('community.supportiveHearts')}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">94%</div>
            <div className="text-sm text-gray-600">{t('community.satisfaction')}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Category Filter */}
          <div className="lg:w-80">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('community.quickActions')}</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowPostForm(true)}
                  className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {t('community.writeNewPost')}
                </Button>
                <Button 
                  onClick={() => setShowPostForm(true)}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('community.askQuestion')}
                </Button>
              </div>
            </div>

            {/* Baby Month Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('community.babyAge')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: undefined, label: t('categories.all') },
                  { value: 0, label: t('community.newborn') },
                  { value: 1, label: `1${t('postForm.monthShort')}` },
                  { value: 3, label: `3${t('postForm.monthShort')}` },
                  { value: 6, label: `6${t('postForm.monthShort')}` },
                  { value: 9, label: `9${t('postForm.monthShort')}` },
                  { value: 12, label: `12${t('postForm.monthShort')}` }
                ].map(month => (
                  <button
                    key={month.value || 'all'}
                    onClick={() => setSelectedBabyMonth(month.value)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedBabyMonth === month.value
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Social Feed */}
          <div className="flex-1">
            <SocialFeed
              selectedCategory={selectedCategory === 'all' ? undefined : selectedCategory}
              selectedBabyMonth={selectedBabyMonth}
            />
          </div>
        </div>
      </div>
      
      {/* Post Form Modal */}
      {showPostForm && (
        <PostForm
          onClose={() => setShowPostForm(false)}
          onSubmit={(postData) => {
            console.log('New post:', postData)
            // TODO: Submit to database
            setShowPostForm(false)
          }}
        />
      )}
    </div>
  )
}