export interface Profile {
  id: string
  partner_id: string | null
  name: string
  avatar_url: string | null
  pairing_code: string | null
  created_at: string
}

export interface Schedule {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_busy: boolean
  label: string | null
}

export interface Status {
  id: string
  user_id: string
  reason_status: ReasonStatus | null
  emotional_status: EmotionalStatus | null
  custom_reason: string | null
  is_auto: boolean
  updated_at: string
}

export type ReasonStatus =
  | 'working'
  | 'busy'
  | 'traveling'
  | 'resting'
  | 'meeting'
  | 'focusing'
  | 'commuting'
  | 'available'

export type EmotionalStatus =
  | 'low_energy'
  | 'need_space'
  | 'miss_you'
  | 'feeling_good'
  | 'stressed'
  | 'grateful'
  | 'loving'
  | 'thoughtful'

export interface Memory {
  id: string
  user_id: string
  content: string
  image_url: string | null
  media_type: 'text' | 'image' | 'video'
  created_at: string
}

export interface PartnerStatus {
  profile: Profile
  status: Status | null
  is_online: boolean
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  media_url: string | null
  media_type: 'text' | 'image' | 'video'
  is_one_time: boolean
  viewed_at: string | null
  created_at: string
}
