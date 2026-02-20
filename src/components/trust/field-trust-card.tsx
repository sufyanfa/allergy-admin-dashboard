/**
 * Field Trust Card Component
 * 
 * Displays trust information for a single product field
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrustScoreBadge } from './trust-score-badge'
import { VerificationStatusBadge } from './verification-status-badge'
import { Lock, ThumbsUp, ThumbsDown, Flag } from 'lucide-react'
import type { ProductFieldTrust } from '@/types/trust'

interface FieldTrustCardProps {
    fieldTrust: ProductFieldTrust
    onViewDetails?: () => void
}

const fieldTypeLabels: Record<string, string> = {
    allergens: 'Allergens',
    ingredients_ar: 'Ingredients (Arabic)',
    ingredients_en: 'Ingredients (English)',
    nutrition_facts: 'Nutrition Facts',
    product_name: 'Product Name',
    brand_info: 'Brand Info',
    overall: 'Overall',
}

export function FieldTrustCard({ fieldTrust, onViewDetails }: FieldTrustCardProps) {
    const fieldLabel = fieldTypeLabels[fieldTrust.fieldType] || fieldTrust.fieldType

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">{fieldLabel}</CardTitle>
                        <div className="flex items-center gap-2">
                            <TrustScoreBadge score={fieldTrust.trustScore} />
                            <VerificationStatusBadge status={fieldTrust.verificationStatus} />
                        </div>
                    </div>
                    {fieldTrust.isFrozen && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Frozen
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Vote Statistics */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-green-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{fieldTrust.approvalVotes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-red-600">
                            <ThumbsDown className="h-4 w-4" />
                            <span className="font-medium">{fieldTrust.rejectionVotes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-orange-600">
                            <Flag className="h-4 w-4" />
                            <span className="font-medium">{fieldTrust.flagVotes}</span>
                        </div>
                    </div>

                    {/* Weight Summary */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Positive: {fieldTrust.positiveWeightSum.toFixed(1)}</span>
                        <span>Negative: {fieldTrust.negativeWeightSum.toFixed(1)}</span>
                    </div>

                    {/* Contested Badge */}
                    {fieldTrust.isContested && (
                        <Badge variant="outline" className="w-full justify-center text-orange-600 border-orange-200">
                            Contested ({fieldTrust.oscillationCount} oscillations)
                        </Badge>
                    )}

                    {/* View Details Button */}
                    {onViewDetails && (
                        <button
                            onClick={onViewDetails}
                            className="w-full text-sm text-primary hover:underline"
                        >
                            View Details →
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
