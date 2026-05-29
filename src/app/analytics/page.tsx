'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { RoleGuard } from '@/components/RoleGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FadeIn } from '@/components/ui/FadeIn'

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <RoleGuard allow={['tutor', 'admin']}>
        <DashboardLayout role="tutor">
          <FadeIn>
            <h1 className="font-serif text-4xl font-black text-forest">Analytics</h1>
            <p className="mt-2 text-foreground/65">Track how your content performs over time.</p>
            <div className="mt-8 rounded-2xl border border-dashed border-forest/20 bg-cream p-12 text-center">
              <p className="font-semibold text-forest">Detailed analytics coming soon</p>
              <p className="mt-2 text-sm text-foreground/60">
                Views, conversion rates, and learner cohorts will appear here. Check Earnings for on-chain revenue today.
              </p>
            </div>
          </FadeIn>
        </DashboardLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
