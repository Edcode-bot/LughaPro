import { z } from 'zod'

export const roleSchema = z.enum(['student', 'tutor', 'admin'])
export const paymentMethodSchema = z.enum(['cusd', 'celo', 'fiat'])
export const bookingStatusSchema = z.enum(['pending', 'pending_fiat', 'paid', 'active', 'completed', 'cancelled', 'disputed'])

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: roleSchema,
  referral_code: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const walletLoginSchema = z.object({
  wallet_address: z.string().min(10),
  signature: z.string().min(10),
  message: z.string().min(1),
})

export const tutorUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  hourly_rate: z.number().positive().optional(),
  specialty: z.string().nullable().optional(),
  languages: z.array(z.string()).optional(),
  location: z.string().nullable().optional(),
  accepts_cusd: z.boolean().optional(),
  accepts_celo: z.boolean().optional(),
  accepts_fiat: z.boolean().optional(),
  availability: z.array(z.object({
    day_of_week: z.number().min(0).max(6).nullable().optional(),
    start_time: z.string().nullable().optional(),
    end_time: z.string().nullable().optional(),
    available_at: z.string().datetime().nullable().optional(),
    is_available: z.boolean().default(true),
  })).optional(),
})

export const onlineSchema = z.object({
  is_online: z.boolean(),
})

export const bookingCreateSchema = z.object({
  tutor_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().positive(),
  payment_method: paymentMethodSchema,
  notes: z.string().nullable().optional(),
})

export const bookingStatusUpdateSchema = z.object({
  status: bookingStatusSchema,
  tx_hash: z.string().nullable().optional(),
})

export const reviewCreateSchema = z.object({
  booking_id: z.string().uuid(),
  tutor_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
})

