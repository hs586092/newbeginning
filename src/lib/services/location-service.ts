import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database.types'

const supabase = createClient()

export interface LocationInfo {
  city: string
  district: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface NearbyUser extends Profile {
  distance?: number
  location_info?: LocationInfo
}

export class LocationService {
  // Get user's current location
  static async getCurrentLocation(): Promise<LocationInfo | null> {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported')
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            try {
              // Reverse geocoding using a public API (or implement with your preferred service)
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`
              )

              if (!response.ok) {
                throw new Error('Geocoding failed')
              }

              const data = await response.json()

              resolve({
                city: data.city || data.locality || '알 수 없음',
                district: data.principalSubdivision || '알 수 없음',
                coordinates: {
                  lat: latitude,
                  lng: longitude
                }
              })
            } catch (error) {
              // Fallback to coordinates only
              resolve({
                city: '알 수 없음',
                district: '알 수 없음',
                coordinates: {
                  lat: latitude,
                  lng: longitude
                }
              })
            }
          },
          (error) => {
            console.error('Geolocation error:', error)
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      })
    } catch (error) {
      console.error('위치 정보 조회 오류:', error)
      return null
    }
  }

  // Update user's location
  static async updateUserLocation(location: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('profiles')
        .update({ location })
        .eq('id', user.id)

      return !error
    } catch (error) {
      console.error('사용자 위치 업데이트 오류:', error)
      return false
    }
  }

  // Get nearby users
  static async getNearbyUsers(limit: number = 20): Promise<NearbyUser[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get current user's location
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single()

      if (!currentProfile?.location) return []

      // Simple location-based search (you can implement more sophisticated geospatial queries)
      const { data: nearbyUsers, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_points!inner(total_points)
        `)
        .neq('id', user.id)
        .eq('is_active', true)
        .ilike('location', `%${currentProfile.location.split(' ')[0]}%`) // Match by city/region
        .limit(limit)

      if (error) throw error

      // Add distance calculation (simplified - you can implement proper geospatial distance)
      return (nearbyUsers || []).map(nearbyUser => ({
        ...nearbyUser,
        distance: Math.floor(Math.random() * 50) + 1, // Placeholder distance in km
        location_info: {
          city: nearbyUser.location?.split(' ')[0] || '알 수 없음',
          district: nearbyUser.location?.split(' ')[1] || '알 수 없음'
        }
      }))
    } catch (error) {
      console.error('주변 사용자 조회 오류:', error)
      return []
    }
  }

  // Get location-based events
  static async getLocalEvents(location?: string, limit: number = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let searchLocation = location
      if (!searchLocation && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location')
          .eq('id', user.id)
          .single()

        searchLocation = profile?.location
      }

      if (!searchLocation) return []

      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url),
          event_participants(id, user_id, status)
        `)
        .eq('is_active', true)
        .gte('start_date', new Date().toISOString())
        .ilike('location', `%${searchLocation.split(' ')[0]}%`)
        .order('start_date', { ascending: true })
        .limit(limit)

      return events || []
    } catch (error) {
      console.error('지역 이벤트 조회 오류:', error)
      return []
    }
  }

  // Get location-based groups
  static async getLocalGroups(location?: string, limit: number = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let searchLocation = location
      if (!searchLocation && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location')
          .eq('id', user.id)
          .single()

        searchLocation = profile?.location
      }

      if (!searchLocation) return []

      // Get user's joined groups to exclude
      const { data: userGroups } = user ? await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id) : { data: null }

      const joinedGroupIds = userGroups?.map(g => g.group_id) || []

      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members(id, user_id),
          group_posts(id, created_at)
        `)
        .eq('is_active', true)
        .eq('privacy_level', 'public')

      // Filter by location keywords
      if (searchLocation) {
        query = query.or(`location.ilike.%${searchLocation.split(' ')[0]}%,description.ilike.%${searchLocation.split(' ')[0]}%`)
      }

      // Exclude already joined groups
      if (joinedGroupIds.length > 0) {
        query = query.not('id', 'in', `(${joinedGroupIds.join(',')})`)
      }

      const { data: groups, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (groups || []).map(group => ({
        ...group,
        member_count: group.group_members?.length || 0,
        recent_activity: group.group_posts?.filter((post: any) => {
          const postDate = new Date(post.created_at)
          const daysSince = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysSince <= 7
        }).length || 0
      }))
    } catch (error) {
      console.error('지역 그룹 조회 오류:', error)
      return []
    }
  }

  // Search locations (for autocomplete)
  static async searchLocations(query: string): Promise<string[]> {
    try {
      // Korean major cities and districts
      const koreanLocations = [
        '서울특별시 강남구', '서울특별시 강동구', '서울특별시 강북구', '서울특별시 강서구',
        '서울특별시 관악구', '서울특별시 광진구', '서울특별시 구로구', '서울특별시 금천구',
        '서울특별시 노원구', '서울특별시 도봉구', '서울특별시 동대문구', '서울특별시 동작구',
        '서울특별시 마포구', '서울특별시 서대문구', '서울특별시 서초구', '서울특별시 성동구',
        '서울특별시 성북구', '서울특별시 송파구', '서울특별시 양천구', '서울특별시 영등포구',
        '서울특별시 용산구', '서울특별시 은평구', '서울특별시 종로구', '서울특별시 중구',
        '서울특별시 중랑구',
        '부산광역시 중구', '부산광역시 서구', '부산광역시 동구', '부산광역시 영도구',
        '부산광역시 부산진구', '부산광역시 동래구', '부산광역시 남구', '부산광역시 북구',
        '부산광역시 해운대구', '부산광역시 사하구', '부산광역시 금정구', '부산광역시 강서구',
        '인천광역시 중구', '인천광역시 동구', '인천광역시 서구', '인천광역시 남동구',
        '인천광역시 부평구', '인천광역시 계양구', '인천광역시 연수구',
        '대구광역시 중구', '대구광역시 동구', '대구광역시 서구', '대구광역시 남구',
        '대구광역시 북구', '대구광역시 수성구', '대구광역시 달서구',
        '광주광역시 동구', '광주광역시 서구', '광주광역시 남구', '광주광역시 북구',
        '광주광역시 광산구',
        '대전광역시 동구', '대전광역시 중구', '대전광역시 서구', '대전광역시 유성구',
        '대전광역시 대덕구',
        '울산광역시 중구', '울산광역시 남구', '울산광역시 동구', '울산광역시 북구',
        '울산광역시 울주군'
      ]

      return koreanLocations
        .filter(location =>
          location.toLowerCase().includes(query.toLowerCase()) ||
          location.replace(/시|구|군|특별시|광역시/g, '').includes(query)
        )
        .slice(0, 10)
    } catch (error) {
      console.error('위치 검색 오류:', error)
      return []
    }
  }

  // Calculate simple distance (placeholder - implement proper geospatial calculation)
  static calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat)
    const dLng = this.toRadians(coord2.lng - coord1.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Get popular locations
  static async getPopularLocations(limit: number = 10): Promise<{ location: string; count: number }[]> {
    try {
      const { data: locations, error } = await supabase
        .from('profiles')
        .select('location')
        .not('location', 'is', null)
        .neq('location', '')

      if (error) throw error

      // Count occurrences of each location
      const locationCounts = (locations || []).reduce((acc: Record<string, number>, profile) => {
        if (profile.location) {
          const city = profile.location.split(' ')[0] // Get city part
          acc[city] = (acc[city] || 0) + 1
        }
        return acc
      }, {})

      // Sort by count and return top locations
      return Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([location, count]) => ({ location, count }))
    } catch (error) {
      console.error('인기 지역 조회 오류:', error)
      return []
    }
  }
}