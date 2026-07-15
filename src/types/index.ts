export interface Profile {
  id: string
  partner_id: string | null
  name: string
  avatar_url: string | null
  pairing_code: string | null
  pairing_code_created_by: string | null
  gender: string | null
  age: number | null
  dob: string | null
  bio: string | null
  created_at: string
}

export interface Schedule {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_busy: boolean | null
  label: string | null
  created_at: string
}

export interface Status {
  id: string
  user_id: string
  reason_status: string | null
  emotional_status: string | null
  custom_reason: string | null
  is_auto: boolean | null
  updated_at: string
}

export interface Memory {
  id: string
  user_id: string
  content: string
  image_url: string | null
  media_type: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  media_url: string | null
  media_type: string | null
  is_one_time: boolean | null
  viewed_at: string | null
  created_at: string
}

export interface PartnerStatus {
  profile: Profile
  status: Status | null
  is_online: boolean
}

export interface DisconnectRequest {
  id: string
  requester_id: string
  requestee_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Location {
  id: string
  user_id: string
  latitude: number
  longitude: number
  name: string | null
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'media_shared' | 'status_update' | 'memory_added' | 'partner_connected'
  title: string
  body: string
  read: boolean
  created_at: string
}
