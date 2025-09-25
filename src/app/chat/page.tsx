'use client'

/**
 * 💬 메인 채팅 페이지
 * - 실제 채팅 기능이 작동하는 페이지
 * - 채팅방 목록 + 채팅 윈도우
 */

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import ChatRoomList from '@/components/chat/chat-room-list'
import ChatWindow from '@/components/chat/chat-window'
import CreateRoomModal from '@/components/chat/create-room-modal'
import { Plus } from 'lucide-react'

export default function ChatPage() {
  const { user, isLoading } = useAuth()
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [showCreateRoom, setShowCreateRoom] = useState(false)

  const handleRoomCreated = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowCreateRoom(false)
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  // 비로그인 상태
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">채팅 기능</h2>
          <p className="text-gray-600 mb-6">
            다른 부모들과 실시간으로 대화하려면<br/>
            로그인이 필요합니다.
          </p>
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            로그인하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">채팅</h1>
            <p className="text-sm text-gray-500">
              다른 부모들과 실시간으로 소통해보세요
            </p>
          </div>
          <Button
            onClick={() => setShowCreateRoom(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 채팅방
          </Button>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* 채팅방 목록 */}
          <div className="lg:col-span-1">
            <ChatRoomList
              onRoomSelect={setSelectedRoomId}
              selectedRoomId={selectedRoomId || undefined}
              onCreateRoom={() => setShowCreateRoom(true)}
              className="h-full"
            />
          </div>

          {/* 채팅 윈도우 */}
          <div className="lg:col-span-2">
            {selectedRoomId ? (
              <ChatWindow
                roomId={selectedRoomId}
                height="100%"
                className="h-full"
              />
            ) : (
              <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">💬</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    채팅방을 선택하세요
                  </h3>
                  <p className="text-gray-500">
                    왼쪽에서 채팅방을 선택하거나 새 채팅방을 만들어보세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 새 채팅방 만들기 모달 */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  )
}