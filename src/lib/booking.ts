import { Availability, BookingStatus } from '@/types'

export function generateBookingId(): string {
  return crypto.randomUUID()
}

export function calculateSessionPrice(hourlyRate: number, durationMinutes: number): number {
  return Number(((hourlyRate * durationMinutes) / 60).toFixed(2))
}

export function getSessionEndTime(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60_000)
}

export function isSlotAvailable(slots: Availability[], requestedTime: Date, duration: number): boolean {
  const requestedEnd = getSessionEndTime(requestedTime, duration)
  return slots.some((slot) => {
    if (!slot.is_available) return false
    if (slot.available_at) {
      const slotStart = new Date(slot.available_at)
      return slotStart.getTime() === requestedTime.getTime()
    }
    if (slot.day_of_week === null || !slot.start_time || !slot.end_time) return false
    if (requestedTime.getDay() !== slot.day_of_week) return false
    const [startHour = 0, startMinute = 0] = slot.start_time.split(':').map(Number)
    const [endHour = 0, endMinute = 0] = slot.end_time.split(':').map(Number)
    const slotStart = new Date(requestedTime)
    slotStart.setHours(startHour, startMinute, 0, 0)
    const slotEnd = new Date(requestedTime)
    slotEnd.setHours(endHour, endMinute, 0, 0)
    return requestedTime >= slotStart && requestedEnd <= slotEnd
  })
}

export function formatSessionDateTime(date: Date, durationMinutes = 60): string {
  const end = getSessionEndTime(date, durationMinutes)
  const day = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date)
  const monthDay = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(date)
  const startTime = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
  const endTime = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(end)
  return `${day}, ${monthDay} · ${startTime} – ${endTime}`
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    pending: 'bg-gold/15 text-forest border-gold/30',
    paid: 'bg-jade/10 text-jade border-jade/20',
    active: 'bg-mint/15 text-jade border-mint/30',
    completed: 'bg-forest text-cream border-forest',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    disputed: 'bg-orange-50 text-orange-700 border-orange-200',
  }
  return colors[status]
}
