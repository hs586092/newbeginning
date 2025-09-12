'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: '전체',
    icon: '🏠',
    color: 'gray',
    description: 'Posts from all categories'
  },
  {
    id: 'pregnancy',
    name: 'Pregnancy',
    icon: '🤰',
    color: 'purple',
    description: 'Pregnancy experiences and information'
  },
  {
    id: 'newborn',
    name: 'Newborn',
    icon: '👶',
    color: 'pink',
    description: '0-3 months newborn care'
  },
  {
    id: 'infant',
    name: 'Infant',
    icon: '🍼',
    color: 'blue',
    description: '4-12 months infant care'
  },
  {
    id: 'babyfood',
    name: 'Baby Food',
    icon: '🥄',
    color: 'green',
    description: 'Baby food recipes and tips'
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: '😴',
    color: 'indigo',
    description: 'Sleep patterns and training'
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    color: 'red',
    description: 'Baby health and medical info'
  },
  {
    id: 'daily',
    name: 'Daily Life',
    icon: '💬',
    color: 'yellow',
    description: 'Parenting daily life and stories'
  },
  {
    id: 'emergency',
    name: 'Emergency',
    icon: '🚨',
    color: 'red',
    description: 'Emergency response and safety'
  }
]

const getCategoryColorClasses = (color: string, isSelected: boolean) => {
  const colors = {
    gray: isSelected ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    purple: isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    pink: isSelected ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    blue: isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
    indigo: isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    red: isSelected ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200',
    yellow: isSelected ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  }
  return colors[color as keyof typeof colors] || colors.gray
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false)
  
  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, 6)
  const hasMore = CATEGORIES.length > 6

  return (
    <Card variant="default" className="mb-6">
      <CardHeader compact={true}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <Badge variant="secondary">
            {selectedCategory === 'all' ? 'All' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {visibleCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`p-4 rounded-lg transition-all duration-200 text-center group ${
              getCategoryColorClasses(category.color, selectedCategory === category.id)
            }`}
            title={category.description}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <div className="text-sm font-medium">{category.name}</div>
          </button>
        ))}
      </div>

        {hasMore && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        )}

        {selectedCategory !== 'all' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {CATEGORIES.find(c => c.id === selectedCategory)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}