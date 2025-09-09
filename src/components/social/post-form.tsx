'use client'

import { useState } from 'react'
import { Camera, MapPin, Hash, Smile, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface PostFormProps {
  onClose?: () => void
  onSubmit?: (postData: PostFormData) => void
}

interface PostFormData {
  content: string
  category_id: string
  baby_month?: number
  images?: File[]
  tags: string[]
  mood?: string
  is_question: boolean
}

const CATEGORY_CONFIG = [
  { id: 'daily', icon: '💬', color: 'yellow' },
  { id: 'pregnancy', icon: '🤰', color: 'purple' },
  { id: 'newborn', icon: '👶', color: 'pink' },
  { id: 'infant', icon: '🍼', color: 'blue' },
  { id: 'babyfood', icon: '🥄', color: 'green' },
  { id: 'sleep', icon: '😴', color: 'indigo' },
  { id: 'health', icon: '🏥', color: 'red' },
  { id: 'emergency', icon: '🚨', color: 'red' }
]

const MOOD_CONFIG = [
  { value: 'happy', emoji: '😊', color: 'yellow' },
  { value: 'worried', emoji: '😰', color: 'blue' },
  { value: 'tired', emoji: '😴', color: 'gray' },
  { value: 'grateful', emoji: '🥰', color: 'pink' },
  { value: 'curious', emoji: '🤔', color: 'purple' },
  { value: 'proud', emoji: '😌', color: 'green' }
]

export default function PostForm({ onClose, onSubmit }: PostFormProps) {
  const { t } = useTranslation()
  
  const CATEGORIES = CATEGORY_CONFIG.map(config => ({
    id: config.id,
    name: t(`categories.${config.id}`),
    icon: config.icon,
    color: config.color
  }))
  
  const MOODS = MOOD_CONFIG.map(config => ({
    value: config.value,
    name: t(`moods.${config.value}`),
    emoji: config.emoji,
    color: config.color
  }))
  
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('daily')
  const [babyMonth, setBabyMonth] = useState<number | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | undefined>()
  const [isQuestion, setIsQuestion] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length <= 4) {
      setImages([...images, ...files])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    
    const postData: PostFormData = {
      content: content.trim(),
      category_id: selectedCategory,
      baby_month: babyMonth,
      images: images.length > 0 ? images : undefined,
      tags,
      mood: selectedMood,
      is_question: isQuestion
    }

    try {
      onSubmit?.(postData)
      // Reset form
      setContent('')
      setSelectedCategory('daily')
      setBabyMonth(undefined)
      setTags([])
      setSelectedMood(undefined)
      setIsQuestion(false)
      setImages([])
      onClose?.()
    } catch (error) {
      console.error('Failed to submit post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('postForm.newPost')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('postForm.placeholder')}
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={4}
              maxLength={2000}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">{t('postForm.questionPost')}</span>
                </label>
              </div>
              <span className="text-sm text-gray-500">
                {content.length}/2000
              </span>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('postForm.category')}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedCategory === category.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">{category.icon}</div>
                  <div className="text-xs font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Baby Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('postForm.babyAge')}
            </label>
            <div className="grid grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setBabyMonth(undefined)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  babyMonth === undefined
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('postForm.notApplicable')}
              </button>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setBabyMonth(month)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    babyMonth === month
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {month}{t('postForm.monthShort')}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('postForm.tags')}
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex-1 flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t('postForm.tagPlaceholder')}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.length >= 5}
                  size="sm"
                >
                  {t('postForm.add')}
                </Button>
              </div>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center space-x-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-pink-500 hover:text-pink-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('postForm.mood')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMood(undefined)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMood === undefined
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('postForm.none')}
              </button>
              {MOODS.map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedMood === mood.value
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('postForm.photos')}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 4}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${
                  images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {t('postForm.photoPlaceholder')}
                </span>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? t('postForm.posting') : t('postForm.post')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}