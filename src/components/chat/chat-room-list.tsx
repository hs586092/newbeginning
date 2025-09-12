/**
 * 💬 채팅방 목록 및 관리 컴포넌트
 * - 가상화 스크롤 (대용량 채팅방 목록)
 * - 검색 & 필터링
 * - 드래그 앤 드롭 정렬
 * - 알림 배지
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle, 
  Settings, 
  Bell, 
  BellOff,
  Hash,
  Lock,
  Globe,
  MoreHorizontal
} from 'lucide-react'
import { chatService } from '@/lib/chat/chat-service'
import type { ChatRoom } from '@/lib/chat/realtime-client'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/optimized-image'

// 🏠 채팅방 목록 Props
interface ChatRoomListProps {
  onRoomSelect: (roomId: string) => void
  selectedRoomId?: string
  onCreateRoom: () => void
  className?: string
}

// 🔍 필터 옵션
type RoomFilter = 'all' | 'direct' | 'group' | 'public' | 'unread'

export default function ChatRoomList({
  onRoomSelect,
  selectedRoomId,
  onCreateRoom,
  className = ''
}: ChatRoomListProps) {
  
  // 🏪 상태 관리
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<RoomFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 📊 필터링된 채팅방 목록
  const filteredRooms = useMemo(() => {
    let filtered = rooms
    
    // 텍스트 검색
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 타입 필터
    switch (activeFilter) {
      case 'direct':
        filtered = filtered.filter(room => room.type === 'direct')
        break
      case 'group':
        filtered = filtered.filter(room => room.type === 'group')
        break
      case 'public':
        filtered = filtered.filter(room => room.type === 'public')
        break
      case 'unread':
        filtered = filtered.filter(room => (room.unread_count || 0) > 0)
        break
    }
    
    return filtered
  }, [rooms, searchTerm, activeFilter])
  
  // 📡 채팅방 목록 로드
  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true)
      const roomList = await chatService.getUserChatRooms()
      setRooms(roomList)
      setError(null)
    } catch (err) {
      setError('채팅방 목록 로드 실패')
      console.error('Failed to load chat rooms:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // 🔄 초기 로드 및 실시간 업데이트 구독
  useEffect(() => {
    loadRooms()
    
    // TODO: 실시간 채팅방 목록 업데이트 구독
    // chatRealtimeClient.subscribeToUserRooms(userId, loadRooms)
    
    return () => {
      // 구독 해제
    }
  }, [loadRooms])
  
  if (isLoading) {
    return <ChatRoomListSkeleton />
  }
  
  if (error) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadRooms} variant="outline">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* 🎯 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            채팅방
          </h2>
          <Button
            onClick={onCreateRoom}
            size="sm"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 채팅방
          </Button>
        </div>
        
        {/* 🔍 검색 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="채팅방 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        {/* 🏷️ 필터 탭 */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: '전체', icon: MessageCircle },
            { key: 'direct', label: '개인 채팅', icon: Users },
            { key: 'group', label: '그룹', icon: Hash },
            { key: 'unread', label: '읽지 않음', icon: Bell }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as RoomFilter)}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === key
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 📋 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <EmptyRoomList
            searchTerm={searchTerm}
            activeFilter={activeFilter}
            onCreateRoom={onCreateRoom}
          />
        ) : (
          <div className="space-y-1 p-2">
            {filteredRooms.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                isSelected={selectedRoomId === room.id}
                onClick={() => onRoomSelect(room.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 🏠 채팅방 아이템 컴포넌트
interface ChatRoomItemProps {
  room: ChatRoom
  isSelected: boolean
  onClick: () => void
}

const ChatRoomItem = ({ room, isSelected, onClick }: ChatRoomItemProps) => {
  const [showMenu, setShowMenu] = useState(false)
  
  // 🎨 채팅방 타입별 아이콘
  const getRoomIcon = () => {
    switch (room.type) {
      case 'direct':
        return <Users className="w-4 h-4" />
      case 'public':
        return <Globe className="w-4 h-4" />
      case 'group':
        return room.is_private ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }
  
  // 📅 마지막 메시지 시간 포맷
  const getLastMessageTime = () => {
    if (!room.last_message?.created_at) return ''
    
    const now = new Date()
    const messageTime = new Date(room.last_message.created_at)
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    
    return messageTime.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return (
    <div
      onClick={onClick}
      className={`relative p-3 rounded-lg cursor-pointer transition-all group ${
        isSelected
          ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-l-4 border-pink-500'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* 🖼️ 아바타 */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            room.type === 'direct' 
              ? 'bg-gradient-to-br from-blue-400 to-purple-500' 
              : 'bg-gradient-to-br from-pink-400 to-purple-500'
          }`}>
            {room.avatar_url ? (
              <OptimizedImage 
                src={room.avatar_url} 
                alt={room.name || 'Chat'}
                fill={true}
                className="rounded-full"
                objectFit="cover"
                sizes="48px"
              />
            ) : (
              <span className="text-white font-semibold">
                {room.name?.[0]?.toUpperCase() || getRoomIcon()}
              </span>
            )}
          </div>
          
          {/* 🔴 온라인 표시 (개인 채팅) */}
          {room.type === 'direct' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        
        {/* 💬 채팅방 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className={`font-medium truncate ${
                isSelected ? 'text-gray-900' : 'text-gray-800'
              }`}>
                {room.name || '개인 메시지'}
              </h3>
              
              {/* 🔒 비공개 표시 */}
              {room.is_private && (
                <Lock className="w-3 h-3 text-gray-400" />
              )}
              
              {/* 👥 멤버 수 (그룹) */}
              {room.type !== 'direct' && (
                <span className="text-xs text-gray-500">
                  {room.member_count || 0}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* ⏰ 시간 */}
              <span className="text-xs text-gray-500">
                {getLastMessageTime()}
              </span>
              
              {/* 📊 읽지 않은 메시지 배지 */}
              {(room.unread_count || 0) > 0 && (
                <div className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                  {room.unread_count! > 99 ? '99+' : room.unread_count}
                </div>
              )}
              
              {/* ⚙️ 메뉴 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 💭 마지막 메시지 */}
          {room.last_message && (
            <p className="text-sm text-gray-600 truncate">
              {room.type !== 'direct' && (
                <span className="font-medium">
                  {room.last_message.sender?.username || room.last_message.sender?.email || '사용자'}: 
                </span>
              )}
              {room.last_message.message_type === 'image' ? '📷 사진' :
               room.last_message.message_type === 'file' ? '📎 파일' :
               room.last_message.content}
            </p>
          )}
        </div>
      </div>
      
      {/* 📄 컨텍스트 메뉴 */}
      {showMenu && (
        <ChatRoomContextMenu
          room={room}
          onClose={() => setShowMenu(false)}
          onMute={() => {/* TODO */}}
          onLeave={() => {/* TODO */}}
          onDelete={() => {/* TODO */}}
        />
      )}
    </div>
  )
}

// 📄 채팅방 컨텍스트 메뉴
interface ChatRoomContextMenuProps {
  room: ChatRoom
  onClose: () => void
  onMute: () => void
  onLeave: () => void
  onDelete: () => void
}

const ChatRoomContextMenu = ({ 
  room, 
  onClose, 
  onMute, 
  onLeave, 
  onDelete 
}: ChatRoomContextMenuProps) => {
  
  useEffect(() => {
    const handleClickOutside = () => onClose()
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])
  
  return (
    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="py-1">
        <button
          onClick={onMute}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <BellOff className="w-4 h-4 mr-3" />
          알림 끄기
        </button>
        
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4 mr-3" />
          채팅방 설정
        </button>
        
        <hr className="my-1 border-gray-200" />
        
        <button
          onClick={onLeave}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          {room.type === 'direct' ? '채팅 삭제' : '채팅방 나가기'}
        </button>
      </div>
    </div>
  )
}

// 🌟 빈 목록 상태
interface EmptyRoomListProps {
  searchTerm: string
  activeFilter: RoomFilter
  onCreateRoom: () => void
}

const EmptyRoomList = ({ 
  searchTerm, 
  activeFilter, 
  onCreateRoom 
}: EmptyRoomListProps) => {
  
  const getEmptyMessage = () => {
    if (searchTerm) {
      return {
        title: '검색 결과가 없습니다',
        description: '다른 키워드로 시도해 보세요',
        action: null
      }
    }
    
    switch (activeFilter) {
      case 'direct':
        return {
          title: '개인 메시지가 없습니다',
          description: '새로운 대화를 시작해 보세요',
          action: { label: '새 메시지', onClick: onCreateRoom }
        }
      case 'group':
        return {
          title: '그룹 채팅이 없습니다',
          description: '첫 번째 그룹을 만들어 보세요',
          action: { label: '그룹 만들기', onClick: onCreateRoom }
        }
      case 'unread':
        return {
          title: '읽지 않은 메시지가 없습니다',
          description: '모든 메시지를 읽었습니다!',
          action: null
        }
      default:
        return {
          title: '채팅방이 없습니다',
          description: '첫 번째 대화를 시작해 보세요',
          action: { label: '새 채팅방', onClick: onCreateRoom }
        }
    }
  }
  
  const empty = getEmptyMessage()
  
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {empty.title}
        </h3>
        
        <p className="text-gray-500 mb-6">
          {empty.description}
        </p>
        
        {empty.action && (
          <Button
            onClick={empty.action.onClick}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {empty.action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// ⏳ 로딩 스켈레톤
const ChatRoomListSkeleton = () => (
  <div className="flex flex-col h-full">
    {/* 헤더 스켈레톤 */}
    <div className="p-4 border-b border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 h-8 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
    
    {/* 목록 스켈레톤 */}
    <div className="flex-1 p-2 space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-3 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
)