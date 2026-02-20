'use client'

import { AdminVoteForm } from '@/components/trust/admin-vote-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTranslations, useLocale } from '@/lib/hooks/use-translations'

export default function AdminVotePage() {
    const t = useTranslations('trust.adminVotePage')
    const locale = useLocale()

    return (
        <AdminLayout>
            <div className="flex-1 space-y-6 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/${locale}/trust`}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t('backToDashboard')}
                                </Link>
                            </Button>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Shield className="h-8 w-8 text-primary" />
                            {t('title')}
                        </h2>
                        <p className="text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <AdminVoteForm />
                    </div>

                    {/* Guidelines */}
                    <div className="space-y-4">
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <CardTitle className="text-lg">{t('guidelines.title')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">{t('guidelines.weightTitle')}</h4>
                                    <p className="text-muted-foreground">
                                        {t('guidelines.weightDesc')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">{t('guidelines.docTitle')}</h4>
                                    <p className="text-muted-foreground">
                                        {t('guidelines.docDesc')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">{t('guidelines.auditTitle')}</h4>
                                    <p className="text-muted-foreground">
                                        {t('guidelines.auditDesc')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">{t('guidelines.legalTitle')}</h4>
                                    <p className="text-muted-foreground">
                                        {t('guidelines.legalDesc')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('whenToUse.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    <p>{t('whenToUse.expert')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    <p>{t('whenToUse.error')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    <p>{t('whenToUse.deadlock')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    <p>{t('whenToUse.flag')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('bestPractices.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5" />
                                    <p>{t('bestPractices.reason')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5" />
                                    <p>{t('bestPractices.evidence')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5" />
                                    <p>{t('bestPractices.legal')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5" />
                                    <p>{t('bestPractices.review')}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
