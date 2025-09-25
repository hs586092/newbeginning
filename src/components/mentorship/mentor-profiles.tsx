'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpertVerificationService, MentorshipService } from '@/lib/services/events-service'
import {
  User,
  Star,
  Award,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface ExpertProfile {
  id: string
  user_id: string
  profession: string
  credentials: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_at?: string
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
    bio?: string
    parenting_stage?: string
  }
}

interface MentorProfilesProps {
  className?: string
  currentUserId?: string
}

export function MentorProfiles({ className = '', currentUserId }: MentorProfilesProps) {
  const [mentors, setMentors] = useState<ExpertProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfession, setSelectedProfession] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('verified')

  useEffect(() => {
    loadMentors()
  }, [selectedProfession, activeTab])

  const loadMentors = async () => {
    try {
      setLoading(true)
      let mentorData: ExpertProfile[]

      if (activeTab === 'verified') {
        mentorData = await ExpertVerificationService.getVerifiedExperts(
          selectedProfession !== 'all' ? selectedProfession : undefined
        )
      } else {
        // For 'all' tab, you might want to get all profiles and filter by profession
        mentorData = await ExpertVerificationService.getVerifiedExperts()
      }

      // Filter by search query if provided
      if (searchQuery) {
        mentorData = mentorData.filter(mentor =>
          mentor.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.profiles.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.credentials.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.profession.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setMentors(mentorData)
    } catch (error) {
      console.error('멘토 프로필 로드 오류:', error)
      toast.error('멘토 프로필을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadMentors()
    setRefreshing(false)
    toast.success('멘토 목록이 새로고침되었습니다')
  }

  const handleRequestMentorship = async (mentorId: string) => {
    try {
      const success = await MentorshipService.requestMentorship({
        mentorId: mentorId,
        topicFocus: '육아 상담',
        durationWeeks: 4,
        meetingFrequency: '주 1회'
      })

      if (success) {
        toast.success('멘토십 요청이 전송되었습니다')
      } else {
        toast.error('멘토십 요청에 실패했습니다')
      }
    } catch (error) {
      console.error('멘토십 요청 오류:', error)
      toast.error('멘토십 요청에 실패했습니다')
    }
  }

  const professions = [
    { value: 'all', label: '전체' },
    { value: 'pediatrician', label: '소아과 의사' },
    { value: 'childcare_specialist', label: '육아 전문가' },
    { value: 'nutritionist', label: '영양사' },
    { value: 'child_psychologist', label: '아동 심리학자' },
    { value: 'lactation_consultant', label: '수유 상담사' },
    { value: 'other', label: '기타' }
  ]

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            멘토 프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            멘토 프로필
            <Badge variant="secondary">{mentors.length}</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="멘토 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadMentors}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              필터
            </Button>
          </div>

          {/* Profession Filter */}
          <div className="flex flex-wrap gap-2">
            {professions.map(profession => (
              <Button
                key={profession.value}
                variant={selectedProfession === profession.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedProfession(profession.value)}
                className="text-xs"
              >
                {profession.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verified" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              인증된 전문가
            </TabsTrigger>
            <TabsTrigger value="all">모든 멘토</TabsTrigger>
          </TabsList>

          <TabsContent value="verified" className="mt-4">
            <MentorsList
              mentors={mentors.filter(mentor => mentor.verification_status === 'verified')}
              currentUserId={currentUserId}
              onRequestMentorship={handleRequestMentorship}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <MentorsList
              mentors={mentors}
              currentUserId={currentUserId}
              onRequestMentorship={handleRequestMentorship}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface MentorsListProps {
  mentors: ExpertProfile[]
  currentUserId?: string
  onRequestMentorship: (mentorId: string) => void
}

function MentorsList({ mentors, currentUserId, onRequestMentorship }: MentorsListProps) {
  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          멘토가 없습니다
        </h3>
        <p className="text-muted-foreground mb-4">
          검색 조건을 변경하거나 다른 분야를 선택해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {mentors.map(mentor => (
        <div
          key={mentor.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-4">
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
              {mentor.profiles.avatar_url ? (
                <Image
                  src={mentor.profiles.avatar_url}
                  alt={mentor.profiles.full_name || mentor.profiles.username}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium">
                  {(mentor.profiles.full_name || mentor.profiles.username).charAt(0)}
                </span>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-lg">
                      {mentor.profiles.full_name || mentor.profiles.username}
                    </h4>
                    {mentor.verification_status === 'verified' && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          인증됨
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {professions.find(p => p.value === mentor.profession)?.label || mentor.profession}
                    </Badge>
                    {mentor.profiles.parenting_stage && (
                      <Badge variant="outline" className="text-xs">
                        {mentor.profiles.parenting_stage} 단계
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {mentor.profiles.bio || '자기소개가 없습니다'}
                  </p>

                  <div className="text-sm mb-3">
                    <span className="font-medium text-muted-foreground">전문 자격:</span>
                    <p className="text-sm">{mentor.credentials}</p>
                  </div>

                  {mentor.verified_at && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {new Date(mentor.verified_at).toLocaleDateString('ko-KR')}에 인증됨
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => onRequestMentorship(mentor.user_id)}
                    disabled={mentor.user_id === currentUserId}
                    className="flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    멘토십 요청
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <User className="w-3 h-3" />
                    프로필 보기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Separate component for mentorship matching interface
export function MentorshipMatching({ className = '', currentUserId }: { className?: string, currentUserId?: string }) {
  const [mentorshipPrograms, setMentorshipPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMentorshipPrograms()
  }, [])

  const loadMentorshipPrograms = async () => {
    try {
      setLoading(true)
      const programs = await MentorshipService.getMentorshipPrograms()
      setMentorshipPrograms(programs)
    } catch (error) {
      console.error('멘토십 프로그램 로드 오류:', error)
      toast.error('멘토십 프로그램을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (programId: string, status: 'active' | 'completed' | 'cancelled') => {
    try {
      const success = await MentorshipService.updateMentorshipStatus(programId, status)
      if (success) {
        toast.success('멘토십 상태가 업데이트되었습니다')
        loadMentorshipPrograms()
      } else {
        toast.error('상태 업데이트에 실패했습니다')
      }
    } catch (error) {
      console.error('멘토십 상태 업데이트 오류:', error)
      toast.error('상태 업데이트에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            나의 멘토십
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          나의 멘토십
          <Badge variant="secondary">{mentorshipPrograms.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {mentorshipPrograms.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              진행 중인 멘토십이 없습니다
            </h3>
            <p className="text-muted-foreground mb-4">
              전문가와 멘토십을 시작해보세요
            </p>
            <Button className="flex items-center gap-2">
              <User className="w-4 h-4" />
              멘토 찾기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mentorshipPrograms.map(program => (
              <div
                key={program.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {program.mentor_profile?.full_name || program.mentee_profile?.full_name}
                        {currentUserId === program.mentor_id ? ' (멘티)' : ' (멘토)'}
                      </h4>
                      <Badge
                        variant={
                          program.status === 'active' ? 'default' :
                          program.status === 'completed' ? 'secondary' :
                          program.status === 'pending' ? 'outline' :
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {program.status === 'active' ? '진행 중' :
                         program.status === 'completed' ? '완료' :
                         program.status === 'pending' ? '대기 중' :
                         '취소됨'}
                      </Badge>
                    </div>
                    {program.topic_focus && (
                      <p className="text-sm text-muted-foreground mb-1">
                        주제: {program.topic_focus}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {program.duration_weeks && (
                        <span>기간: {program.duration_weeks}주</span>
                      )}
                      {program.meeting_frequency && (
                        <span>빈도: {program.meeting_frequency}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {program.status === 'pending' && currentUserId === program.mentor_id && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(program.id, 'active')}
                      >
                        승인
                      </Button>
                    )}
                    {program.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(program.id, 'completed')}
                      >
                        완료
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}