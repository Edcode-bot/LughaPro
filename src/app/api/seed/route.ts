import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    const secret = request.headers.get('x-seed-secret')
    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const tutors = [
    { id: '11111111-1111-1111-1111-111111111111', full_name: 'Amina Kariuki', role: 'tutor', country: 'Kenya', bio: 'Senior Kiswahili instructor with 10+ years experience. Former lecturer at University of Nairobi.', languages: ['Kiswahili', 'English'], wallet_address: '0x0000000000000000000000000000000000000001' },
    { id: '22222222-2222-2222-2222-222222222222', full_name: 'Juma Mwanga', role: 'tutor', country: 'Tanzania', bio: 'Patient and encouraging. Perfect for beginners. Conversational approach from day one.', languages: ['Kiswahili'], wallet_address: '0x0000000000000000000000000000000000000002' },
    { id: '33333333-3333-3333-3333-333333333333', full_name: 'Fatuma Abdi', role: 'tutor', country: 'Kenya', bio: 'Blends language with East African culture, proverbs, and history.', languages: ['Kiswahili', 'English'], wallet_address: '0x0000000000000000000000000000000000000003' },
    { id: '44444444-4444-4444-4444-444444444444', full_name: 'Kwame Osei', role: 'tutor', country: 'Uganda', bio: 'PhD candidate in African linguistics. Specialises in formal and academic Kiswahili.', languages: ['Kiswahili', 'Luganda', 'English'], wallet_address: '0x0000000000000000000000000000000000000004' },
    { id: '55555555-5555-5555-5555-555555555555', full_name: 'Zara Hassan', role: 'tutor', country: 'Tanzania', bio: 'Native Zanzibar dialect speaker — pure coastal Kiswahili.', languages: ['Kiswahili'], wallet_address: '0x0000000000000000000000000000000000000005' },
    { id: '66666666-6666-6666-6666-666666666666', full_name: 'Daniel Kimani', role: 'tutor', country: 'Kenya', bio: 'Specialises in tourism and hospitality Kiswahili.', languages: ['Kiswahili', 'English'], wallet_address: '0x0000000000000000000000000000000000000006' },
  ]

  const tutorDetails = [
    { id: '11111111-1111-1111-1111-111111111111', profile_id: '11111111-1111-1111-1111-111111111111', hourly_rate: 28, rating: 4.98, total_reviews: 214, review_count: 214, accepts_cusd: true, accepts_fiat: true, specialty: 'Business Kiswahili', is_verified: true, is_featured: true, is_online: true, location: 'Nairobi, Kenya' },
    { id: '22222222-2222-2222-2222-222222222222', profile_id: '22222222-2222-2222-2222-222222222222', hourly_rate: 18, rating: 4.95, total_reviews: 187, review_count: 187, accepts_cusd: true, accepts_fiat: true, specialty: 'Beginners', is_verified: true, is_featured: true, is_online: true, location: 'Dar es Salaam, Tanzania' },
    { id: '33333333-3333-3333-3333-333333333333', profile_id: '33333333-3333-3333-3333-333333333333', hourly_rate: 22, rating: 4.92, total_reviews: 156, review_count: 156, accepts_cusd: true, accepts_fiat: true, specialty: 'Cultural Context', is_verified: true, is_featured: false, is_online: false, location: 'Mombasa, Kenya' },
    { id: '44444444-4444-4444-4444-444444444444', profile_id: '44444444-4444-4444-4444-444444444444', hourly_rate: 25, rating: 4.89, total_reviews: 98, review_count: 98, accepts_cusd: false, accepts_fiat: true, specialty: 'Academic', is_verified: true, is_featured: false, is_online: true, location: 'Kampala, Uganda' },
    { id: '55555555-5555-5555-5555-555555555555', profile_id: '55555555-5555-5555-5555-555555555555', hourly_rate: 32, rating: 5.0, total_reviews: 73, review_count: 73, accepts_cusd: true, accepts_fiat: false, specialty: 'Coastal Dialect', is_verified: true, is_featured: true, is_online: true, location: 'Zanzibar, Tanzania' },
    { id: '66666666-6666-6666-6666-666666666666', profile_id: '66666666-6666-6666-6666-666666666666', hourly_rate: 20, rating: 4.94, total_reviews: 142, review_count: 142, accepts_cusd: true, accepts_fiat: true, specialty: 'Tourism', is_verified: true, is_featured: false, is_online: false, location: 'Nairobi, Kenya' },
  ]

  const books = [
    { id: 'b1111111-1111-1111-1111-111111111111', tutor_id: '11111111-1111-1111-1111-111111111111', title: 'Business Kiswahili Essentials', description: 'Professional vocabulary for meetings, emails, and negotiations.', level: 'B2', price: 12, content_type: 'book', language: 'Kiswahili', tags: ['business'] },
    { id: 'b2222222-2222-2222-2222-222222222222', tutor_id: '22222222-2222-2222-2222-222222222222', title: 'Kiswahili for Beginners', description: 'A gentle introduction with dialogues and pronunciation drills.', level: 'A1', price: 0, content_type: 'book', language: 'Kiswahili', tags: ['beginner'] },
    { id: 'b3333333-3333-3333-3333-333333333333', tutor_id: '33333333-3333-3333-3333-333333333333', title: 'Proverbs & Culture', description: 'Methali, stories, and cultural context from across East Africa.', level: 'B1', price: 8, content_type: 'book', language: 'Bilingual', tags: ['culture'] },
    { id: 'b4444444-4444-4444-4444-444444444444', tutor_id: '55555555-5555-5555-5555-555555555555', title: 'Coastal Dialect Masterclass', description: 'Video lessons on Zanzibar Kiswahili pronunciation and idioms.', level: 'C1', price: 15, content_type: 'lesson', language: 'Kiswahili', tags: ['dialect', 'video'] },
  ]

  const posts = [
    { id: 'p1111111-1111-1111-1111-111111111111', author_id: '22222222-2222-2222-2222-222222222222', title: '5 Greetings Every Learner Should Know', content: 'Hujambo, Habari, Shikamoo, Habari za asubuhi, and Habari za jioni — with usage notes and audio tips.', is_premium: false, price: 0, language: 'Kiswahili', tags: ['greetings'] },
    { id: 'p2222222-2222-2222-2222-222222222222', author_id: '44444444-4444-4444-4444-444444444444', title: 'Academic Writing in Kiswahili', content: 'Structure, connectors, and formal register for university essays and research papers.', is_premium: true, price: 3, language: 'Kiswahili', tags: ['academic'] },
    { id: 'p3333333-3333-3333-3333-333333333333', author_id: '66666666-6666-6666-6666-666666666666', title: 'Safari Kiswahili Phrasebook', content: 'Essential phrases for guides, hospitality staff, and travellers across Kenya and Tanzania.', is_premium: false, price: 0, language: 'English', tags: ['tourism'] },
  ]

  try {
    for (const tutor of tutors) {
      await supabase.from('profiles').upsert(tutor, { onConflict: 'id' })
    }
    for (const detail of tutorDetails) {
      await supabase.from('tutors').upsert(detail, { onConflict: 'id' })
    }
    for (const book of books) {
      await supabase.from('books').upsert(book, { onConflict: 'id' })
    }
    for (const post of posts) {
      await supabase.from('posts').upsert(post, { onConflict: 'id' })
    }
    return NextResponse.json({ seeded: true, count: tutors.length, books: books.length, posts: posts.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
