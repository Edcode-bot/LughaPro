import type { Book } from '@/types'

/** Books table uses `tutor_id`; posts use `author_id`. */
export function getBookOwnerId(book: Book & { tutor_id?: string }): string {
  return book.tutor_id ?? book.author_id ?? ''
}
