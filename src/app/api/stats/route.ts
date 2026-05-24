import { jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const [{ count: creators }, { count: learners }, booksResult, postsResult, ratingResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tutor'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('books').select('id', { count: 'exact', head: true }).eq('published', true),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
      supabaseAdmin.from('tutors').select('rating'),
    ])

    const bookCount = booksResult.count ?? 0
    const postCount = postsResult.count ?? 0
    const ratings = (ratingResult.data ?? []).map((row) => Number(row.rating ?? 0)).filter((value) => value > 0)
    const rating = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0

    return jsonOk({
      creators: creators ?? 0,
      content: bookCount + postCount,
      learners: learners ?? 0,
      rating: Number(rating.toFixed(1)),
    })
  } catch {
    const [{ count: creators }, { count: learners }] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tutor'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    ])
    const books = await supabaseAdmin.from('books').select('id', { count: 'exact', head: true })
    const posts = await supabaseAdmin.from('posts').select('id', { count: 'exact', head: true })
    const ratingRows = await supabaseAdmin.from('tutors').select('rating')
    const ratings = (ratingRows.data ?? []).map((row) => Number(row.rating ?? 0)).filter((value) => value > 0)
    const rating = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 4.9

    return jsonOk({
      creators: creators ?? 0,
      content: (books.count ?? 0) + (posts.count ?? 0),
      learners: learners ?? 0,
      rating: Number(rating.toFixed(1)),
    })
  }
}
