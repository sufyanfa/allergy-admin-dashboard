/**
 * Product Trust Tab Component
 * 
 * Displays trust information for a product
 */

'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrustScoreBadge } from '@/components/trust/trust-score-badge'
import { FieldTrustCard } from '@/components/trust/field-trust-card'
import { useTrustStore } from '@/lib/stores/trust-store'
import { Shield, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductTrustTabProps {
    productId: string
}

export function ProductTrustTab({ productId }: ProductTrustTabProps) {
    const { productTrust, loading, error, fetchProductTrust } = useTrustStore()
    const trustData = productTrust[productId] || []

    useEffect(() => {
        if (productId) {
            fetchProductTrust(productId)
        }
    }, [productId, fetchProductTrust])

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p>Failed to load trust information: {error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (trustData.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Trust Data</h3>
                        <p className="text-muted-foreground">
                            This product doesn&apos;t have any trust information yet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate overall trust score (average of all fields)
    const overallScore =
        trustData.reduce((sum, field) => sum + field.trustScore, 0) / trustData.length

    // Get overall field if it exists
    const overallField = trustData.find((f) => f.fieldType === 'overall')

    return (
        <div className="space-y-6">
            {/* Overall Trust Score */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Overall Trust Score
                            </CardTitle>
                            <CardDescription>
                                Based on {trustData.length} field{trustData.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                        <TrustScoreBadge score={overallField?.trustScore || overallScore} size="lg" />
                    </div>
                </CardHeader>
                {overallField && (
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {overallField.approvalCount}
                                </div>
                                <div className="text-sm text-muted-foreground">Approvals</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {overallField.rejectionCount}
                                </div>
                                <div className="text-sm text-muted-foreground">Rejections</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {overallField.flagCount}
                                </div>
                                <div className="text-sm text-muted-foreground">Flags</div>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Field-by-Field Trust */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Field Trust Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {trustData
                        .filter((field) => field.fieldType !== 'overall')
                        .map((field) => (
                            <FieldTrustCard
                                key={field.id}
                                fieldTrust={field}
                                onViewDetails={() => {
                                    // Navigate to detailed view or open modal
                                    console.log('View details for', field.fieldType)
                                }}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}
