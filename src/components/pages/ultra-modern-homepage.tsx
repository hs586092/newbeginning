'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  Users,
  Sparkles,
  Baby,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Play,
  Award,
  Smile,
  Camera,
  BookOpen,
  Clock
} from 'lucide-react'

interface UltraModernHomepageProps {
  searchParams: { [key: string]: string | undefined }
}

export function UltraModernHomepage({ searchParams }: UltraModernHomepageProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showDemo, setShowDemo] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const testimonials = [
    {
      name: "김수민",
      role: "7개월 아기 엄마",
      avatar: "김",
      text: "ParentWise 덕분에 처음 엄마가 되는 두려움을 극복했어요. 실시간 조언과 24시간 커뮤니티 지원이 정말 감동이었습니다! 🥰",
      rating: 5,
      gradient: "from-pink-400 to-rose-500"
    },
    {
      name: "박지영",
      role: "쌍둥이 엄마 (2세)",
      avatar: "박",
      text: "쌍둥이 키우기가 이렇게 힘든 줄 몰랐는데, 여기서 만난 다른 엄마들과 전문가 조언으로 행복한 육아를 하고 있어요! ✨",
      rating: 5,
      gradient: "from-purple-400 to-indigo-500"
    },
    {
      name: "이준호",
      role: "3세 아이 아빠",
      avatar: "이",
      text: "아빠로서 어떻게 육아에 참여해야 할지 고민이 많았는데, ParentWise에서 만난 아빠들과 함께 성장하고 있어요! 💪",
      rating: 5,
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      name: "정혜원",
      role: "임신 32주차",
      avatar: "정",
      text: "임신부터 출산, 육아까지 모든 단계를 체계적으로 준비할 수 있어서 너무 든든해요. AI 조언이 정말 정확해요! 🤱",
      rating: 5,
      gradient: "from-emerald-400 to-teal-500"
    }
  ]

  useEffect(() => {
    setMounted(true)

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin">
              <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600 font-medium">ParentWise 로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 animate-float">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl opacity-20 rotate-12" />
          </div>
          <div className="absolute top-32 right-20 animate-float-delayed">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-30" />
          </div>
          <div className="absolute bottom-32 left-32 animate-float">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl opacity-25 -rotate-12" />
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20 mb-8 hover:bg-white/20 transition-all duration-300">
              <div className="relative">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 w-5 h-5 text-yellow-400 animate-ping" />
              </div>
              <span className="text-lg font-semibold text-white">AI × Global Community</span>
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none animate-bounce">
                🚀 혁신
              </Badge>
            </div>

            {/* Main Headline with Typewriter Effect */}
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
              <div className="inline-block">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                  ParentWise
                </span>
                <div className="inline-block ml-4 animate-bounce">✨</div>
              </div>
              <br />
              <div className="text-4xl md:text-6xl text-gray-300 mt-4">
                <span className="typewriter">육아의 새로운 패러다임</span>
              </div>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              <span className="text-pink-400 font-bold">AI 기반 맞춤 조언</span> ×
              <span className="text-purple-400 font-bold"> 글로벌 커뮤니티</span> ×
              <span className="text-blue-400 font-bold"> 전문가 네트워크</span>
              <br />
              <span className="text-2xl text-gray-400 mt-2 block">당신의 육아 여정을 혁신적으로 바꿀 플랫폼</span>
            </p>

            {/* Interactive Demo Button */}
            <div className="mb-12">
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="group relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-1 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="bg-slate-900 rounded-xl px-8 py-4 group-hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 w-6 h-6 bg-white/20 rounded-full animate-ping" />
                    </div>
                    <span className="text-xl font-bold text-white">실제 기능 미리보기</span>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {isAuthenticated ? (
                <div className="flex gap-6">
                  <Link href="/community">
                    <Button
                      size="lg"
                      className="relative group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 px-12 py-6 text-xl font-bold rounded-2xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative flex items-center gap-3">
                        <Users className="w-6 h-6" />
                        커뮤니티 입장
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                  </Link>
                  <Link href="/write">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                      <Baby className="w-6 h-6 mr-3" />
                      경험 공유하기
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-6">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="relative group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 px-12 py-6 text-xl font-bold rounded-2xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative flex items-center gap-3">
                        <Heart className="w-6 h-6 animate-pulse" />
                        무료로 시작하기
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                  </Link>
                  <Link href="/community">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                      <Globe className="w-6 h-6 mr-3" />
                      둘러보기
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "15,247", label: "활성 부모들", icon: Users, color: "from-pink-400 to-rose-500" },
                { number: "127,891", label: "공유된 경험", icon: MessageCircle, color: "from-purple-400 to-indigo-500" },
                { number: "24/7", label: "실시간 지원", icon: Clock, color: "from-blue-400 to-cyan-500" },
                { number: "98.7%", label: "만족도", icon: Star, color: "from-emerald-400 to-teal-500" }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-white mb-2 animate-counter">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">
                      {stat.label}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      {showDemo && (
        <section className="relative py-20 px-4 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 text-lg">
                🎯 실제 기능 체험
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                이것이 바로 <span className="text-purple-400">ParentWise</span>입니다
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {[
                  {
                    icon: Baby,
                    title: "AI 맞춤 조언",
                    description: "아기 월령, 성격, 발달 상황을 분석해서 개인 맞춤 육아 조언을 실시간으로 제공",
                    color: "from-pink-400 to-rose-500"
                  },
                  {
                    icon: Users,
                    title: "글로벌 커뮤니티",
                    description: "전 세계 15,000+ 부모들과 실시간으로 소통하며 다양한 경험을 공유",
                    color: "from-purple-400 to-indigo-500"
                  },
                  {
                    icon: Shield,
                    title: "전문가 검증",
                    description: "소아과 의사, 육아 전문가들이 직접 검증한 신뢰할 수 있는 정보만 제공",
                    color: "from-blue-400 to-cyan-500"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-6 group animate-on-scroll">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-8 shadow-2xl">
                  <div className="bg-slate-900 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Baby className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">AI 조언봇</div>
                        <div className="text-gray-400 text-sm">온라인</div>
                      </div>
                    </div>
                    <div className="bg-purple-600 text-white p-4 rounded-2xl mb-4 animate-fade-in">
                      "7개월 아기가 밤에 자주 깨요. 어떻게 해야 할까요?"
                    </div>
                    <div className="bg-slate-700 text-white p-4 rounded-2xl animate-fade-in-delayed">
                      7개월 아기의 수면 패턴을 분석한 결과, 다음 방법들을 추천드려요:
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                        <li>일정한 수면 루틴 만들기</li>
                        <li>낮잠 시간 조절하기</li>
                        <li>밤중 수유 점진적 줄이기</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-500 text-white">실시간 답변</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Premium Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 text-lg font-bold">
              ⭐ 실제 후기
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              부모들의 <span className="text-yellow-400">진짜 경험담</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-white/20 p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 text-yellow-400 fill-current animate-bounce" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                </div>

                <blockquote className="text-2xl md:text-3xl text-white font-medium text-center mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>

                <div className="flex items-center justify-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${testimonials[currentTestimonial].gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6`}>
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-purple-300">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? 'bg-purple-500 w-8'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Award className="w-16 h-16 text-yellow-300 mx-auto mb-4 animate-bounce" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            당신의 육아 혁신이
            <br />
            <span className="text-yellow-300">지금 시작됩니다</span>
          </h2>

          <p className="text-xl text-pink-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            15,000명의 부모들이 선택한 가장 혁신적인 육아 플랫폼
            <br />
            <span className="text-2xl font-bold text-yellow-300">무료로 지금 바로 시작하세요!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="relative group bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:shadow-white/50 transition-all duration-300 px-12 py-6 text-xl font-black rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-purple-600/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="relative flex items-center gap-3">
                      <Heart className="w-6 h-6 animate-pulse" />
                      지금 무료 시작
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                </Link>
                <Link href="/community">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Globe className="w-6 h-6 mr-3" />
                    커뮤니티 둘러보기
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="text-pink-200 text-lg">
            ✨ 100% 무료 · 신용카드 불필요 · 언제든 탈퇴 가능 ✨
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes counter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0px); }
        }

        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0px); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-counter { animation: counter 1s ease-out; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.8s ease-out 0.5s both;
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }

        .typewriter {
          overflow: hidden;
          border-right: 0.15em solid rgba(255, 255, 255, 0.8);
          white-space: nowrap;
          margin: 0 auto;
          animation: typing 2s steps(20, end), blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: rgba(255, 255, 255, 0.8); }
        }
      `}</style>
    </div>
  )
}