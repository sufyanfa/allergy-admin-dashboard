'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { UsersOverview } from '@/components/users/users-overview'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from '@/lib/hooks/use-translations'

export default function UsersPage() {
  const tCommon = useTranslations('common')
  const { isAdmin } = useRequireAuth()

  if (!isAdmin) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{tCommon('accessDenied')}</h2>
              <p className="text-muted-foreground">{tCommon('adminPrivilegesRequired')}</p>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <UsersOverview />
    </AdminLayout>
  )
}