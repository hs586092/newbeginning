import { createClient } from '@/lib/supabase/client'
import { Event, EventParticipant, EventWithDetails, MentorshipProgram, MentorshipWithProfiles, ExpertVerification } from '@/types/database.types'

const supabase = createClient()

export class EventsService {
  // Create event
  static async createEvent({
    title,
    description,
    eventType,
    location,
    virtualLink,
    startDate,
    endDate,
    maxParticipants,
    ageRange,
    cost,
    requirements
  }: {
    title: string
    description: string
    eventType: 'playdate' | 'workshop' | 'meetup' | 'support_group' | 'online_class'
    location?: string
    virtualLink?: string
    startDate: string
    endDate: string
    maxParticipants?: number
    ageRange?: string
    cost?: number
    requirements?: string
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title,
          description,
          event_type: eventType,
          location,
          virtual_link: virtualLink,
          start_date: startDate,
          end_date: endDate,
          max_participants: maxParticipants,
          current_participants: 0,
          age_range: ageRange,
          cost,
          requirements,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      return event.id
    } catch (error) {
      console.error('이벤트 생성 오류:', error)
      return null
    }
  }

  // Get events
  static async getEvents({
    eventType,
    location,
    upcoming = true,
    limit = 20,
    offset = 0
  }: {
    eventType?: string
    location?: string
    upcoming?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<EventWithDetails[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          created_by_profile:profiles!events_created_by_fkey(username, full_name, avatar_url),
          event_participants(
            *,
            profiles!inner(username, full_name, avatar_url)
          )
        `)
        .eq('is_active', true)

      if (eventType) {
        query = query.eq('event_type', eventType)
      }

      if (location) {
        query = query.eq('location', location)
      }

      if (upcoming) {
        query = query.gte('start_date', new Date().toISOString())
      }

      const { data, error } = await query
        .order('start_date', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Get user participation status
      const { data: { user } } = await supabase.auth.getUser()
      const eventsWithParticipation: EventWithDetails[] = []

      for (const event of data || []) {
        let userParticipation = undefined

        if (user) {
          const participation = event.event_participants.find(
            (p: any) => p.user_id === user.id
          )
          userParticipation = participation
        }

        eventsWithParticipation.push({
          ...event,
          user_participation: userParticipation
        })
      }

      return eventsWithParticipation
    } catch (error) {
      console.error('이벤트 조회 오류:', error)
      return []
    }
  }

  // Join event
  static async joinEvent(eventId: string, status: 'attending' | 'maybe' = 'attending'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if event exists and has capacity
      const { data: event } = await supabase
        .from('events')
        .select('max_participants, current_participants')
        .eq('id', eventId)
        .single()

      if (!event) return false

      if (event.max_participants && event.current_participants >= event.max_participants) {
        // Add to waitlist
        const { error } = await supabase
          .from('event_participants')
          .upsert({
            event_id: eventId,
            user_id: user.id,
            status: 'waitlist'
          })

        return !error
      }

      // Register for event
      const { error } = await supabase
        .from('event_participants')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        })

      if (error) throw error

      // Update participant count
      await supabase.rpc('increment_event_participants', {
        event_id: eventId
      })

      return true
    } catch (error) {
      console.error('이벤트 참가 오류:', error)
      return false
    }
  }

  // Leave event
  static async leaveEvent(eventId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update participant count
      await supabase.rpc('decrement_event_participants', {
        event_id: eventId
      })

      return true
    } catch (error) {
      console.error('이벤트 탈퇴 오류:', error)
      return false
    }
  }
}

export class MentorshipService {
  // Request mentorship
  static async requestMentorship({
    mentorId,
    topicFocus,
    durationWeeks,
    meetingFrequency
  }: {
    mentorId: string
    topicFocus?: string
    durationWeeks?: number
    meetingFrequency?: string
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('mentorship_programs')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          status: 'pending',
          topic_focus: topicFocus,
          duration_weeks: durationWeeks,
          meeting_frequency: meetingFrequency
        })

      return !error
    } catch (error) {
      console.error('멘토십 요청 오류:', error)
      return false
    }
  }

  // Get mentorship programs
  static async getMentorshipPrograms(): Promise<MentorshipWithProfiles[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('mentorship_programs')
        .select(`
          *,
          mentor_profile:profiles!mentorship_programs_mentor_id_fkey(
            username, full_name, avatar_url,
            expert_verification(*)
          ),
          mentee_profile:profiles!mentorship_programs_mentee_id_fkey(
            username, full_name, avatar_url
          )
        `)
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('멘토십 프로그램 조회 오류:', error)
      return []
    }
  }

  // Update mentorship status
  static async updateMentorshipStatus(
    programId: string,
    status: 'active' | 'completed' | 'cancelled'
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('mentorship_programs')
        .update({ status })
        .eq('id', programId)
        .eq('mentor_id', user.id) // Only mentor can update status

      return !error
    } catch (error) {
      console.error('멘토십 상태 업데이트 오류:', error)
      return false
    }
  }
}

export class ExpertVerificationService {
  // Apply for expert verification
  static async applyForVerification({
    profession,
    credentials,
    verificationDocument
  }: {
    profession: 'pediatrician' | 'childcare_specialist' | 'nutritionist' | 'child_psychologist' | 'lactation_consultant' | 'other'
    credentials: string
    verificationDocument?: string
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('expert_verification')
        .insert({
          user_id: user.id,
          profession,
          credentials,
          verification_document: verificationDocument,
          verification_status: 'pending'
        })

      return !error
    } catch (error) {
      console.error('전문가 인증 신청 오류:', error)
      return false
    }
  }

  // Get verified experts
  static async getVerifiedExperts(profession?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('expert_verification')
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url, parenting_stage)
        `)
        .eq('verification_status', 'verified')

      if (profession) {
        query = query.eq('profession', profession)
      }

      const { data, error } = await query
        .order('verified_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('전문가 조회 오류:', error)
      return []
    }
  }
}