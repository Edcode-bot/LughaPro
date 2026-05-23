import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const TUTORS = [
  { id: crypto.randomUUID(), full_name: 'Amina Nyerere', country: 'Tanzania', bio: 'Native Kiswahili speaker with 5 years teaching experience', hourly_rate: 15, rating: 4.9, accepts_cusd: true, accepts_fiat: true, languages: ['Kiswahili'], specialty: 'Conversational' },
  { id: crypto.randomUUID(), full_name: 'Baraka Omondi', country: 'Kenya', bio: 'Certified language instructor specializing in conversational Kiswahili', hourly_rate: 12, rating: 4.8, accepts_cusd: true, accepts_fiat: true, languages: ['Kiswahili', 'English'], specialty: 'Beginner-friendly' },
  { id: crypto.randomUUID(), full_name: 'Zawadi Kimani', country: 'Kenya', bio: 'Academic Kiswahili tutor with university-level teaching experience', hourly_rate: 18, rating: 4.7, accepts_cusd: false, accepts_fiat: true, languages: ['Kiswahili'], specialty: 'Academic' },
  { id: crypto.randomUUID(), full_name: 'Jabari Mwangi', country: 'Uganda', bio: 'East African language expert, helps learners reach fluency fast', hourly_rate: 20, rating: 4.9, accepts_cusd: true, accepts_fiat: true, languages: ['Kiswahili', 'Luganda'], specialty: 'Fluency' },
  { id: crypto.randomUUID(), full_name: 'Fatuma Hassan', country: 'Tanzania', bio: 'Zanzibar-born native speaker. Coastal dialect specialist', hourly_rate: 22, rating: 5.0, accepts_cusd: true, accepts_fiat: true, languages: ['Kiswahili'], specialty: 'Coastal dialect' },
  { id: crypto.randomUUID(), full_name: 'Tendai Mutasa', country: 'Kenya', bio: 'Young dynamic tutor focused on modern spoken Kiswahili', hourly_rate: 10, rating: 4.6, accepts_cusd: false, accepts_fiat: true, languages: ['Kiswahili', 'Sheng'], specialty: 'Modern Kiswahili' },
]

export async function GET(request: Request) {
  const authHeader = request.headers.get('x-seed-secret')
  if (authHeader !== process.env.SEED_SECRET && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase seed credentials are missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    for (const tutor of TUTORS) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: tutor.id, full_name: tutor.full_name, role: 'tutor', country: tutor.country, bio: tutor.bio, languages: tutor.languages }, { onConflict: 'id' })
      if (profileError) throw profileError

      const { error: tutorError } = await supabase
        .from('tutors')
        .upsert({ id: tutor.id, hourly_rate: tutor.hourly_rate, rating: tutor.rating, accepts_cusd: tutor.accepts_cusd, accepts_fiat: tutor.accepts_fiat, specialty: [tutor.specialty], is_verified: true, is_featured: true, is_online: true }, { onConflict: 'id' })
      if (tutorError) throw tutorError
    }
    return NextResponse.json({ seeded: true, count: TUTORS.length })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
