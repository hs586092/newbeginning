'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { NotificationsService, NotificationPreferences } from '@/lib/services/notifications-service'
import {
  Bell,
  Mail,
  MessageCircle,
  Heart,
  Users,
  Calendar,
  Group,
  Settings,
  Save,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferencesComponent({
  className = ''
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    loadPreferences()
    checkPushSupport()
  }, [])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const prefs = await NotificationsService.getNotificationPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('알림 설정 로드 오류:', error)
      toast.error('알림 설정을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setPushSupported(supported)
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    setPreferences({
      ...preferences,
      [key]: value
    })
  }

  const handleSave = async () => {
    if (!preferences) return

    try {
      setSaving(true)
      const success = await NotificationsService.updateNotificationPreferences(preferences)

      if (success) {
        toast.success('알림 설정이 저장되었습니다')
      } else {
        toast.error('알림 설정 저장에 실패했습니다')
      }
    } catch (error) {
      console.error('알림 설정 저장 오류:', error)
      toast.error('알림 설정 저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleEnablePush = async () => {
    try {
      const subscription = await NotificationsService.registerPushNotifications()

      if (subscription) {
        toast.success('푸시 알림이 활성화되었습니다')
        handlePreferenceChange('push_notifications', true)
      } else {
        toast.error('푸시 알림 활성화에 실패했습니다')
      }
    } catch (error) {
      console.error('푸시 알림 활성화 오류:', error)
      toast.error('푸시 알림 활성화에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            알림 설정을 불러올 수 없습니다
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
            <Settings className="w-5 h-5" />
            알림 설정
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5" />
            <h3 className="text-lg font-medium">이메일 알림</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  이메일 알림 받기
                </Label>
                <p className="text-xs text-muted-foreground">
                  중요한 알림을 이메일로 받습니다
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-1">
                <Label htmlFor="marketing-emails" className="text-sm font-medium">
                  마케팅 이메일 받기
                </Label>
                <p className="text-xs text-muted-foreground">
                  새 기능, 이벤트, 팁 등의 정보를 받습니다
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={preferences.marketing_emails}
                onCheckedChange={(checked) => handlePreferenceChange('marketing_emails', checked)}
                disabled={!preferences.email_notifications}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Push Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5" />
            <h3 className="text-lg font-medium">푸시 알림</h3>
            {!pushSupported && (
              <Badge variant="secondary" className="text-xs">
                지원되지 않음
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  푸시 알림 받기
                </Label>
                <p className="text-xs text-muted-foreground">
                  즉시 알림을 브라우저로 받습니다
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pushSupported && !preferences.push_notifications && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnablePush}
                    className="text-xs"
                  >
                    활성화
                  </Button>
                )}
                <Switch
                  id="push-notifications"
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
                  disabled={!pushSupported}
                />
              </div>
            </div>

            {!pushSupported && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                💡 푸시 알림을 받으려면 HTTPS 환경에서 최신 브라우저를 사용해주세요
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Activity Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" />
            <h3 className="text-lg font-medium">활동 알림</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="message-notifications" className="text-sm font-medium">
                    메시지 알림
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    새 메시지가 도착했을 때
                  </p>
                </div>
              </div>
              <Switch
                id="message-notifications"
                checked={preferences.message_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('message_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="comment-notifications" className="text-sm font-medium">
                    댓글 알림
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    게시글에 댓글이 달렸을 때
                  </p>
                </div>
              </div>
              <Switch
                id="comment-notifications"
                checked={preferences.comment_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('comment_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="reaction-notifications" className="text-sm font-medium">
                    반응 알림
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    게시글에 좋아요나 반응이 있을 때
                  </p>
                </div>
              </div>
              <Switch
                id="reaction-notifications"
                checked={preferences.reaction_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('reaction_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="follow-notifications" className="text-sm font-medium">
                    팔로우 알림
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    새 팔로워가 생겼을 때
                  </p>
                </div>
              </div>
              <Switch
                id="follow-notifications"
                checked={preferences.follow_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('follow_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Community Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Group className="w-5 h-5" />
            <h3 className="text-lg font-medium">커뮤니티 알림</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <Group className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="group-notifications" className="text-sm font-medium">
                    그룹 알림
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    그룹 초대, 새 게시글 등
                  </p>
                </div>
              </div>
              <Switch
                id="group-notifications"
                checked={preferences.group_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('group_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="event-notifications" className="text-sm font-medium">
                    이벤트 알림
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    이벤트 초대, 일정 알림 등
                  </p>
                </div>
              </div>
              <Switch
                id="event-notifications"
                checked={preferences.event_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('event_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}