'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <AnalyticsOverview />
    </AdminLayout>
  )
}
