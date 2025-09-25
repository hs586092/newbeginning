'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Users, Hash, Globe, Lock } from 'lucide-react'
import { chatService } from '@/lib/chat/chat-service'
import { useAuth } from '@/contexts/auth-context'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onRoomCreated: (roomId: string) => void
}

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    type: 'group' as 'direct' | 'group' | 'public',
    name: '',
    description: '',
    is_private: false,
    max_members: 50
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    if (!formData.name.trim()) {
      setError('채팅방 이름을 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const room = await chatService.createChatRoom({
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_private: formData.is_private,
        max_members: formData.max_members,
        member_ids: [user.id] // 생성자만 포함
      })

      onRoomCreated(room.id)
      onClose()

      // 폼 초기화
      setFormData({
        type: 'group',
        name: '',
        description: '',
        is_private: false,
        max_members: 50
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : '채팅방 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const roomTypes = [
    {
      value: 'group',
      label: '그룹 채팅',
      icon: Hash,
      description: '여러 사람과 함께하는 채팅방'
    },
    {
      value: 'public',
      label: '공개 채팅',
      icon: Globe,
      description: '누구나 참여할 수 있는 공개 채팅방'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">새 채팅방 만들기</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 채팅방 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              채팅방 유형
            </label>
            <div className="space-y-2">
              {roomTypes.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: value as any }))}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    formData.type === value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${
                      formData.type === value ? 'text-pink-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        formData.type === value ? 'text-pink-900' : 'text-gray-900'
                      }`}>
                        {label}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 채팅방 이름 */}
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              채팅방 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="roomName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="예: 육아 고민 나누기"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100자
            </div>
          </div>

          {/* 채팅방 설명 */}
          <div>
            <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700 mb-2">
              채팅방 설명 (선택)
            </label>
            <textarea
              id="roomDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="이 채팅방에 대해 간단히 설명해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500자
            </div>
          </div>

          {/* 최대 참여자 수 */}
          <div>
            <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
              최대 참여자 수
            </label>
            <select
              id="maxMembers"
              value={formData.max_members}
              onChange={(e) => setFormData(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value={10}>10명</option>
              <option value={20}>20명</option>
              <option value={50}>50명</option>
              <option value={100}>100명</option>
            </select>
          </div>

          {/* 비공개 설정 */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
              />
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">비공개 채팅방</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 ml-7 mt-1">
              비공개 채팅방은 초대를 통해서만 참여할 수 있습니다
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>생성 중...</span>
                </div>
              ) : (
                '채팅방 만들기'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}