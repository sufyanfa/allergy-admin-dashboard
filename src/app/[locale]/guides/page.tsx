'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { GuidesOverview } from '@/components/guides/guides-overview'

export default function GuidesPage() {
  return (
    <AdminLayout>
      <GuidesOverview />
    </AdminLayout>
  )
}
