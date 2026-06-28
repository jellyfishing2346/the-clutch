export type TrustLevel = 'new' | 'established' | 'trusted' | 'verified'

export type TaskCategory =
  | 'simple_help'
  | 'errands'
  | 'skilled'
  | 'moving'
  | 'delivery'
  | 'cleaning'
  | 'tech_help'
  | 'tutoring'
  | 'repairs'
  | 'pet_care'
  | 'cooking'
  | 'other'

export type PaymentType = 'cash' | 'credits' | 'exchange' | 'free'

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export type NotificationType =
  | 'new_application'
  | 'application_accepted'
  | 'application_rejected'
  | 'new_message'
  | 'task_completed'
  | 'new_review'
  | 'referral_bonus'

export type ReportTargetType = 'task' | 'profile' | 'message' | 'review'
export type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'scam' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface UserProfile {
  id: string
  name: string
  avatar_url: string | null
  image_url: string | null
  bio: string | null
  neighborhood: string | null
  borough: string | null
  credits_balance: number
  trust_level: TrustLevel
  rating_avg: number
  rating_count: number
  tasks_completed: number
  tasks_posted: number
  languages: string[]
  skills: string[]
  is_id_verified: boolean
  created_at: string
}

export interface Task {
  id: string
  creator_id: string
  creator?: UserProfile
  title: string
  description: string
  category: TaskCategory
  required_trust_level: TrustLevel
  location: GeoPoint
  address: string
  neighborhood: string
  borough: string
  payment_type: PaymentType
  payment_amount: number | null
  credits_amount: number | null
  status: TaskStatus
  applicant_count: number
  scheduled_for: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface TaskApplication {
  id: string
  task_id: string
  task?: Task
  applicant_id: string
  applicant?: UserProfile
  message: string
  status: ApplicationStatus
  created_at: string
}

export interface Review {
  id: string
  task_id: string
  reviewer_id: string
  reviewer?: UserProfile
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
}

export interface CreditsTransaction {
  id: string
  user_id: string
  amount: number
  type: 'earned' | 'spent' | 'bonus'
  description: string
  task_id: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender?: UserProfile
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  task_id: string
  task?: Task
  participant_ids: string[]
  participants: UserProfile[]
  last_message: Message | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  resolution_note: string | null
  created_at: string
}
