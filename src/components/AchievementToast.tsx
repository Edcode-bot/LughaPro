'use client'

import { useEffect, useState } from 'react'

export type Achievement = {
  key: string
  name: string
  icon: string
  description: string
  xp: number
}

export const BADGES: Record<string, Achievement> = {
  first_post: { key: 'first_post', name: 'First Words', icon: '✍️', description: 'Published your first content', xp: 50 },
  first_sale: { key: 'first_sale', name: 'First Sale', icon: '💰', description: 'Made your first sale', xp: 100 },
  ten_learners: { key: 'ten_learners', name: 'Teacher', icon: '🎓', description: 'Taught 10 learners', xp: 150 },
  first_purchase: { key: 'first_purchase', name: 'Knowledge Seeker', icon: '📚', description: 'Bought your first content', xp: 50 },
  profile_complete: { key: 'profile_complete', name: 'Identity', icon: '👤', description: 'Completed your profile', xp: 30 },
  five_posts: { key: 'five_posts', name: 'Storyteller', icon: '📖', description: 'Published 5 pieces of content', xp: 100 },
  griot_level: { key: 'griot_level', name: 'Griot', icon: '🥁', description: 'Reached the highest level', xp: 500 },
}

type Props = {
  achievement: Achievement | null
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!achievement) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 4000)
    return () => clearTimeout(t)
  }, [achievement, onDismiss])

  if (!achievement) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-4 rounded-2xl bg-[#171717] border border-[#FFBF00]/30 px-5 py-4 shadow-2xl shadow-black/40 max-w-sm">
        <div className="h-12 w-12 rounded-full bg-[#FFBF00]/20 flex items-center justify-center text-2xl flex-shrink-0">
          {achievement.icon}
        </div>
        <div>
          <div className="text-xs font-semibold text-[#FFBF00] uppercase tracking-wider mb-0.5">Achievement Unlocked!</div>
          <div className="font-bold text-white">{achievement.name}</div>
          <div className="text-xs text-white/50 mt-0.5">{achievement.description}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="font-black text-[#FFBF00]">+{achievement.xp}</div>
          <div className="text-xs text-white/40">XP</div>
        </div>
      </div>
    </div>
  )
}
