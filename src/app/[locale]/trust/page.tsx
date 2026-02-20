'use client'

import { TrustOverviewCards } from '@/components/trust/trust-overview-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from '@/lib/hooks/use-translations'

import { AdminLayout } from '@/components/layout/admin-layout'

export default function TrustDashboardPage() {
    const t = useTranslations('trust')
    const locale = useLocale()

    return (
        <AdminLayout>
            <div className="flex-1 space-y-6 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                        <p className="text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Buttons removed as requested for simplicity ("Admin Vote btns to be simple and clean") - 
                            Wait, the user said "Admin Vote btns to be simple and clean". 
                            The user also said "remove this components Cast Admin Vote... Review Products... Audit Trail... Trust Analytics... User Trust Stats... becuse it not use we have slide and Audit Trail".
                            This implies the Quick Actions CARDS should be removed.
                            The user wants "Admin Vote btns to be simple and clean". Use your best judgment. 
                            I'll Keep the header buttons but perhaps simplify them or leave them as the primary navigation since the cards are gone.
                            Actually, if I remove the cards, these buttons are the only way to navigate. 
                            Let's keep the header buttons for now as they are "simple and clean" compared to the big cards.
                            
                            Re-reading: "Admin Vote btns to be simple and clean" might refer to the specific "Cast Admin Vote" card or the button itself. 
                            Given the context of removing cards, I will keep the header buttons but ensure they are clean.
                         */}
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/${locale}/trust/audit`}>
                                <FileText className="h-4 w-4 mr-2" />
                                {t('auditTrail')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/${locale}/trust/review`}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Review Queue
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={`/${locale}/trust/admin-vote`}>
                                <Shield className="h-4 w-4 mr-2" />
                                {t('adminVote')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Overview Cards */}
                <TrustOverviewCards />

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('systemInfo.title')}</CardTitle>
                        <CardDescription>
                            {t('systemInfo.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">{t('systemInfo.concurrency')}</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ {t('systemInfo.concurrency1')}</li>
                                    <li>✓ {t('systemInfo.concurrency2')}</li>
                                    <li>✓ {t('systemInfo.concurrency3')}</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">{t('systemInfo.adminControls')}</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ {t('systemInfo.adminControls1')}</li>
                                    <li>✓ {t('systemInfo.adminControls2')}</li>
                                    <li>✓ {t('systemInfo.adminControls3')}</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">{t('systemInfo.audit')}</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ {t('systemInfo.audit1')}</li>
                                    <li>✓ {t('systemInfo.audit2')}</li>
                                    <li>✓ {t('systemInfo.audit3')}</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">{t('systemInfo.userTrust')}</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ {t('systemInfo.userTrust1')}</li>
                                    <li>✓ {t('systemInfo.userTrust2')}</li>
                                    <li>✓ {t('systemInfo.userTrust3')}</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
