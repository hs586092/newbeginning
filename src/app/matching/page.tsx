'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Target, Zap, Users, TrendingUp, Check, Star, Briefcase, MapPin, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface MatchingResult {
  id: string
  title: string
  company: string
  location: string
  salary: string
  matchScore: number
  skills: string[]
  jobType: string
  experience: string
  posted: string
}

const SAMPLE_MATCHES: MatchingResult[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: '(주)테크스타트업',
    location: '서울 강남구',
    salary: '6000-8000만원',
    matchScore: 95,
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
    jobType: '정규직',
    experience: '3-5년',
    posted: '2일 전'
  },
  {
    id: '2', 
    title: 'Frontend Lead Engineer',
    company: '네이버',
    location: '경기 분당구',
    salary: '8000-1억원',
    matchScore: 88,
    skills: ['React', 'Vue.js', 'JavaScript', 'AWS'],
    jobType: '정규직',
    experience: '5년 이상',
    posted: '1주 전'
  },
  {
    id: '3',
    title: 'Full-Stack Developer',
    company: '카카오',
    location: '제주도',
    salary: '5500-7500만원', 
    matchScore: 82,
    skills: ['React', 'Spring Boot', 'MySQL', 'Docker'],
    jobType: '정규직',
    experience: '2-4년',
    posted: '3일 전'
  }
]

export default function MatchingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const handleStartMatching = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="https://newbeginning-seven.vercel.app/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
              <span>홈으로</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI 스마트 매칭</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!showResults ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                <span>AI 기반 맞춤 추천</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                당신에게 완벽한 기회를 찾아드립니다
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                AI가 당신의 경력, 기술스택, 선호도를 종합 분석해 95% 이상의 매칭률로 최적의 채용공고를 추천합니다
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">정밀한 분석</h3>
                <p className="text-gray-600">
                  경력, 기술스택, 프로젝트 경험을 종합해 당신의 프로필을 정밀 분석합니다
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">기업 매칭</h3>
                <p className="text-gray-600">
                  5000+ 검증된 기업 데이터베이스에서 당신과 가장 잘 맞는 회사를 찾습니다
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">성장 예측</h3>
                <p className="text-gray-600">
                  해당 포지션에서의 성장 가능성과 커리어 패스를 예측해드립니다
                </p>
              </div>
            </div>

            {/* Matching Process */}
            <div className="bg-white rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-center mb-8">매칭 프로세스</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">프로필 분석</h4>
                  <p className="text-sm text-gray-600">경력과 기술스택을 AI가 분석</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">선호도 매칭</h4>
                  <p className="text-sm text-gray-600">희망 근무지, 연봉, 기업문화 고려</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">AI 추천</h4>
                  <p className="text-sm text-gray-600">최적의 채용공고 추천</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h4 className="font-semibold mb-2">결과 제공</h4>
                  <p className="text-sm text-gray-600">매칭률과 상세 정보 제공</p>
                </div>
              </div>
            </div>

            {/* Start Matching */}
            <div className="text-center">
              {!isAnalyzing ? (
                <Button
                  onClick={handleStartMatching}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-full"
                >
                  <Target className="w-5 h-5 mr-2" />
                  AI 매칭 시작하기
                </Button>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg font-medium text-gray-700">
                    AI가 당신에게 맞는 기회를 찾고 있습니다...
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Check className="w-4 h-4" />
                <span>매칭 완료</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                당신에게 맞는 {SAMPLE_MATCHES.length}개의 기회를 찾았습니다
              </h2>
              <p className="text-gray-600">
                평균 매칭률 88% · 예상 합격 확률 73%
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">필터</h3>
              <div className="flex flex-wrap gap-2">
                {['90% 이상 매칭', '서울', '5000만원 이상', '정규직', 'React'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilters.includes(filter)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {SAMPLE_MATCHES.map((match) => (
                <div key={match.id} className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{match.title}</h3>
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{match.matchScore}% 매칭</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{match.company}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{match.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{match.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{match.jobType}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{match.posted}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {match.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Button className="mb-2">
                        지원하기
                      </Button>
                      <p className="text-sm text-gray-500">예상 합격률 {Math.floor(Math.random() * 30) + 60}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
                className="mr-4"
              >
                다시 매칭하기
              </Button>
              <Link href="/jobs">
                <Button>
                  전체 채용공고 보기
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}