'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { ReportsList } from '@/components/reports/reports-list'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from '@/lib/hooks/use-translations'

export default function ReportsPage() {
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
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Moderation</h1>
                    <p className="text-muted-foreground">
                        Manage reported posts and comments from sensitivity groups.
                    </p>
                </div>
                <ReportsList />
            </div>
        </AdminLayout>
    )
}
