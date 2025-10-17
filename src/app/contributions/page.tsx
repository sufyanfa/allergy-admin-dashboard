'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { ContributionsOverview } from '@/components/contributions/contributions-overview'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'

export default function ContributionsPage() {
  const { isAdmin } = useRequireAuth()

  if (!isAdmin) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <ContributionsOverview />
    </AdminLayout>
  )
}
