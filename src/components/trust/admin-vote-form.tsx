'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { trustApi } from '@/lib/api/trust'
import type { FieldType, VoteType } from '@/types/trust'
import { toast } from 'sonner'
import { useTranslations } from '@/lib/hooks/use-translations'
import { ProductSearchCombobox } from './product-search-combobox'

interface AdminVoteFormProps {
    productId?: string
    onSuccess?: () => void
}

interface FormData {
    productId: string
    fieldType: FieldType
    decision: VoteType
    reason: string
    legalReviewRequired: boolean
}

const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'allergens', label: 'Allergens' },
    { value: 'ingredients_ar', label: 'Ingredients (Arabic)' },
    { value: 'ingredients_en', label: 'Ingredients (English)' },
    { value: 'nutrition_facts', label: 'Nutrition Facts' },
    { value: 'product_name', label: 'Product Name' },
    { value: 'brand_info', label: 'Brand Info' },
    { value: 'overall', label: 'Overall' },
]

const decisions: { value: VoteType; label: string; color: string }[] = [
    { value: 'approve', label: 'Approve', color: 'text-green-600' },
    { value: 'reject', label: 'Reject', color: 'text-red-600' },
    { value: 'flag', label: 'Flag for Review', color: 'text-orange-600' },
]

export function AdminVoteForm({ productId, onSuccess }: AdminVoteFormProps) {
    const t = useTranslations('trust.adminVotePage.form')
    const [loading, setLoading] = useState(false)
    const [legalReview, setLegalReview] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        defaultValues: {
            productId: productId || '',
            legalReviewRequired: false,
        },
    })

    const onSubmit = async (data: FormData) => {
        if (!data.reason.trim()) {
            toast.error(t('reason') + ' ' + t('error'))
            return
        }

        setLoading(true)
        try {
            const response = await trustApi.castAdminVote({
                productId: data.productId,
                fieldType: data.fieldType,
                decision: data.decision,
                reason: data.reason,
                legalReviewRequired: data.legalReviewRequired,
            })

            toast.success(t('success'), {
                description: `Score: ${response.data.newTrustScore}`,
            })

            reset()
            onSuccess?.()
        } catch (error: any) {
            toast.error(t('error'), {
                description: error.response?.data?.error?.message || 'Please try again',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="productId">{t('productId')} *</Label>
                        {productId ? (
                            <Input
                                id="productId"
                                {...register('productId', { required: true })}
                                placeholder={t('enterProductId')}
                                disabled={true}
                            />
                        ) : (
                            <ProductSearchCombobox
                                value={watch('productId')}
                                onChange={(value) => setValue('productId', value)}
                            />
                        )}
                        {errors.productId && (
                            <p className="text-sm text-red-600">{t('productId') + ' required'}</p>
                        )}
                    </div>

                    {/* Field Type */}
                    <div className="space-y-2">
                        <Label htmlFor="fieldType">{t('fieldType')} *</Label>
                        <Select
                            onValueChange={(value) => setValue('fieldType', value as FieldType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectFieldType')} />
                            </SelectTrigger>
                            <SelectContent>
                                {fieldTypes.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fieldType && (
                            <p className="text-sm text-red-600">{t('fieldType') + ' required'}</p>
                        )}
                    </div>

                    {/* Decision */}
                    <div className="space-y-2">
                        <Label htmlFor="decision">{t('decision')} *</Label>
                        <Select
                            onValueChange={(value) => setValue('decision', value as VoteType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectDecision')} />
                            </SelectTrigger>
                            <SelectContent>
                                {decisions.map((decision) => (
                                    <SelectItem key={decision.value} value={decision.value}>
                                        <span className={decision.color}>{decision.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.decision && (
                            <p className="text-sm text-red-600">{t('decision') + ' required'}</p>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">{t('reason')}</Label>
                        <Textarea
                            id="reason"
                            {...register('reason', { required: true })}
                            placeholder={t('enterReason')}
                            rows={4}
                        />
                        {errors.reason && (
                            <p className="text-sm text-red-600">{t('reason') + ' required'}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {t('reasonNote')}
                        </p>
                    </div>

                    {/* Legal Review */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="legalReview"
                            checked={legalReview}
                            onCheckedChange={(checked) => {
                                setLegalReview(checked as boolean)
                                setValue('legalReviewRequired', checked as boolean)
                            }}
                        />
                        <Label
                            htmlFor="legalReview"
                            className="text-sm font-normal cursor-pointer"
                        >
                            {t('legalReview')}
                        </Label>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">{t('warningTitle')}</p>
                            <p className="text-xs mt-1">
                                {t('warningDesc')}
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            t('submitting')
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {t('submit')}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
