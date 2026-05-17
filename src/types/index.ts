export type BookingStatus = 'pending' | 'paid' | 'active' | 'completed' | 'cancelled' | 'disputed'
export type PaymentMethod = 'cusd' | 'celo' | 'fiat'
export type UserRole = 'student' | 'tutor' | 'admin'

export type Profile = {
  id: string
  email: string | null
  full_name: string
  role: UserRole
  avatar_url: string | null
  wallet_address: string | null
  referral_code: string | null
  created_at: string
  updated_at: string | null
}

export type Tutor = {
  id: string
  profile_id: string
  bio: string | null
  specialty: string | null
  languages: string[] | null
  hourly_rate: number
  rating: number
  review_count: number
  is_online: boolean
  accepts_cusd: boolean
  accepts_celo: boolean
  accepts_fiat: boolean
  location: string | null
  created_at: string
  updated_at: string | null
}

export type Availability = {
  id: string
  tutor_id: string
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
  available_at: string | null
  is_available: boolean
  created_at: string
}

export type Booking = {
  id: string
  student_id: string
  tutor_id: string
  scheduled_at: string
  duration_minutes: number
  payment_method: PaymentMethod
  status: BookingStatus
  amount: number | null
  tx_hash: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export type Review = {
  id: string
  booking_id: string
  tutor_id: string
  student_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type Referral = {
  id: string
  referrer_id: string
  referred_id: string | null
  referral_code: string
  status: 'pending' | 'rewarded'
  reward_amount: number
  created_at: string
  rewarded_at: string | null
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: string | null
  read: boolean
  created_at: string
}

export type TutorWithProfile = Tutor & {
  profile: Profile
  availability?: Availability[]
  reviews?: ReviewWithStudent[]
}

export type BookingWithDetails = Booking & {
  student: Profile
  tutor: TutorWithProfile
}

export type ReviewWithStudent = Review & {
  student: Profile
}

export type ApiResponse<T> = {
  data: T | null
  error: string | null
  message: string
}

export type PaginatedResponse<T> = {
  items: T[]
  page: number
  limit: number
  total: number
}

