'use client'

import { useState } from 'react'
import { Contribution } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Loader2, ExternalLink, User, Package, Calendar, FileText, Edit2, ThumbsUp, ThumbsDown, Users } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { useTranslations } from '@/lib/hooks/use-translations'

interface EditedContributionData {
  productNameAr?: string
  productNameEn?: string
  brandAr?: string
  brandEn?: string
  barcode?: string
  category?: string
  extractedIngredientsAr?: string
  extractedIngredientsEn?: string
  aiConfidence?: number
  notes?: string
  [key: string]: string | number | undefined
}

interface ContributionDetailModalProps {
  contribution: Contribution | null
  open: boolean
  onClose: () => void
  isLoading?: boolean
  onSaveChanges?: (id: string, editedData: EditedContributionData) => Promise<void>
  onApprove?: (id: string, notes?: string, editedData?: EditedContributionData) => Promise<void>
  onReject?: (id: string, notes?: string) => Promise<void>
}

export function ContributionDetailModal({
  contribution,
  open,
  onClose,
  isLoading: isLoadingData,
  onSaveChanges,
  onApprove,
  onReject
}: ContributionDetailModalProps) {
  const t = useTranslations('contributions')
  const tCommon = useTranslations('common')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<EditedContributionData>({})

  const handleSaveChanges = async () => {
    if (!contribution || Object.keys(editedData).length === 0) return
    setIsSubmitting(true)
    try {
      await onSaveChanges?.(contribution.id, editedData)
      setEditedData({})
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!contribution) return
    setIsSubmitting(true)
    try {
      // Pass edited data if in edit mode
      const dataToSend = isEditing && Object.keys(editedData).length > 0 ? editedData : undefined
      await onApprove?.(contribution.id, notes, dataToSend)
      onClose()
    } finally {
      setIsSubmitting(false)
      setIsEditing(false)
      setEditedData({})
    }
  }

  const handleEditChange = (field: keyof EditedContributionData, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }))
  }

  const getFieldValue = (field: keyof EditedContributionData, originalValue: string) => {
    return editedData[field] !== undefined ? editedData[field] : originalValue
  }

  const handleReject = async () => {
    if (!contribution) return
    setIsSubmitting(true)
    try {
      await onReject?.(contribution.id, notes)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' }
    }

    const { variant, label } = variants[status] || variants.pending
    return <Badge variant={variant}>{label}</Badge>
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500'
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const communityVotes = contribution?.contributionData?.communityVotes || []
  const approvals = communityVotes.filter((v: any) => v.vote === 'approve').length
  const rejections = communityVotes.filter((v: any) => v.vote === 'reject').length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{t('contributionDetails')}</DialogTitle>
              <DialogDescription>
                {t('reviewManage')}
              </DialogDescription>
            </div>
            {contribution && getStatusBadge(contribution.status)}
          </div>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">{t('loadingDetails')}</p>
            </div>
          </div>
        ) : !contribution ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{t('noData')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{t('contributor')}</span>
                </div>
                <div className="font-medium">
                  {contribution.user?.name || tCommon('unknown')}
                  <span className="text-sm text-muted-foreground ml-2">
                    @{contribution.user?.username || tCommon('unknown')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{tCommon('submitted')}</span>
                </div>
                <div className="font-medium">
                  {format(new Date(contribution.createdAt), 'PPP')}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{tCommon('type')}</span>
                </div>
                <div className="font-medium capitalize">
                  {contribution.contributionType.replace(/_/g, ' ')}
                </div>
              </div>

              {contribution.contributionData?.aiConfidence && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{t('aiConfidence')}</span>
                  </div>
                  <div className={cn('font-bold text-lg', getConfidenceColor(contribution.contributionData.aiConfidence))}>
                    {contribution.contributionData.aiConfidence}%
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Product Information */}
            {contribution.contributionType === 'new_product' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('productInfo')}</h3>
                  {contribution.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      type="button"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {isEditing ? tCommon('cancel') : tCommon('edit')}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">{t('productNameAr')}:</Label>
                    {isEditing ? (
                      <Input
                        value={getFieldValue('productNameAr', contribution.contributionData?.productNameAr || '')}
                        onChange={(e) => handleEditChange('productNameAr', e.target.value)}
                        className="mt-1"
                        placeholder={t('productNameAr')}
                      />
                    ) : (
                      <p className="font-medium mt-1">{contribution.contributionData?.productNameAr || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('productNameEn')}:</Label>
                    {isEditing ? (
                      <Input
                        value={getFieldValue('productNameEn', contribution.contributionData?.productNameEn || '')}
                        onChange={(e) => handleEditChange('productNameEn', e.target.value)}
                        className="mt-1"
                        placeholder={t('productNameEn')}
                      />
                    ) : (
                      <p className="font-medium mt-1">{contribution.contributionData?.productNameEn || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('brandAr')}:</Label>
                    {isEditing ? (
                      <Input
                        value={getFieldValue('brandAr', contribution.contributionData?.brandAr || '')}
                        onChange={(e) => handleEditChange('brandAr', e.target.value)}
                        className="mt-1"
                        placeholder={t('brandAr')}
                      />
                    ) : (
                      <p className="font-medium mt-1">{contribution.contributionData?.brandAr || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('brandEn')}:</Label>
                    {isEditing ? (
                      <Input
                        value={getFieldValue('brandEn', contribution.contributionData?.brandEn || '')}
                        onChange={(e) => handleEditChange('brandEn', e.target.value)}
                        className="mt-1"
                        placeholder={t('brandEn')}
                      />
                    ) : (
                      <p className="font-medium mt-1">{contribution.contributionData?.brandEn || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('barcode')}:</Label>
                    {isEditing ? (
                      <Input
                        value={getFieldValue('barcode', contribution.contributionData?.barcode || '')}
                        onChange={(e) => handleEditChange('barcode', e.target.value)}
                        className="mt-1"
                        placeholder={t('barcode')}
                      />
                    ) : (
                      <p className="font-medium mt-1">{contribution.contributionData?.barcode || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('category')}:</Label>
                    {isEditing ? (
                      <Input
                        value={getFieldValue('category', contribution.contributionData?.category || '')}
                        onChange={(e) => handleEditChange('category', e.target.value)}
                        className="mt-1"
                        placeholder={t('category')}
                      />
                    ) : (
                      <p className="font-medium mt-1">{contribution.contributionData?.category || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Community Votes Section */}
            {(contribution.status === 'community_review' || communityVotes.length > 0) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-500">{t('communityVote') || 'Community Votes'}</h3>
                </div>
                <div className="flex gap-4 p-4 rounded-lg border bg-blue-50/50">
                  <div className="flex items-center gap-2 flex-1 justify-center bg-green-100/50 p-3 rounded-md border border-green-200">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-700">{approvals}</span>
                    <span className="text-sm text-green-700">{t('approvals') || 'Approvals'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-center bg-red-100/50 p-3 rounded-md border border-red-200">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-700">{rejections}</span>
                    <span className="text-sm text-red-700">{t('rejects') || 'Rejections'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Error Report Details */}
            {contribution.contributionType === 'report_error' && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t('errorReportDetails')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {contribution.errorType && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">{t('errorType')}:</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-base">
                          {t(`errorTypes.${contribution.errorType}` as any)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {contribution.errorDescription && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">{t('description')}:</Label>
                      <p className="text-sm p-3 rounded-lg border bg-muted/50 mt-1">
                        {contribution.errorDescription}
                      </p>
                    </div>
                  )}
                  {contribution.suggestedCorrection && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">{t('suggestedCorrection')}:</Label>
                      <p className="text-sm p-3 rounded-lg border bg-muted/50 mt-1">
                        {contribution.suggestedCorrection}
                      </p>
                    </div>
                  )}
                  {contribution.evidenceImageUrl && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">{t('evidencePhoto')}:</Label>
                      <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted mt-1">
                        <Image
                          src={contribution.evidenceImageUrl}
                          alt={t('evidencePhoto')}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  {contribution.pointsAwarded !== null && contribution.pointsAwarded > 0 && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">{t('pointsAwarded')}:</Label>
                      <div className="mt-1">
                        <Badge variant="default" className="text-base">
                          {contribution.pointsAwarded} {t('points')}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Existing Product */}
            {contribution.product && (
              <div className="space-y-2">
                <h3 className="font-semibold">{t('relatedProduct')}</h3>
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                  <Package className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="font-medium">{contribution.product.nameAr}</p>
                    <p className="text-sm text-muted-foreground">{contribution.product.barcode}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/products/${contribution.product.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {(contribution.contributionData?.extractedIngredientsAr || contribution.contributionData?.extractedIngredientsEn) && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t('extractedIngredients')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(contribution.contributionData?.extractedIngredientsAr || isEditing) && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">{t('arabic')}:</Label>
                      {isEditing ? (
                        <Textarea
                          value={getFieldValue('extractedIngredientsAr', contribution.contributionData?.extractedIngredientsAr || '')}
                          onChange={(e) => handleEditChange('extractedIngredientsAr', e.target.value)}
                          className="font-arabic min-h-[100px]"
                          placeholder={t('ingredientsAr')}
                        />
                      ) : (
                        <p className="text-sm p-3 rounded-lg border bg-muted/50 font-arabic">
                          {contribution.contributionData.extractedIngredientsAr}
                        </p>
                      )}
                    </div>
                  )}
                  {(contribution.contributionData?.extractedIngredientsEn || isEditing) && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">{t('english')}:</Label>
                      {isEditing ? (
                        <Textarea
                          value={getFieldValue('extractedIngredientsEn', contribution.contributionData?.extractedIngredientsEn || '')}
                          onChange={(e) => handleEditChange('extractedIngredientsEn', e.target.value)}
                          className="min-h-[100px]"
                          placeholder={t('ingredientsEn')}
                        />
                      ) : (
                        <p className="text-sm p-3 rounded-lg border bg-muted/50">
                          {contribution.contributionData.extractedIngredientsEn}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {(contribution.contributionData?.frontImageUrl || contribution.contributionData?.ingredientsImageUrl) && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t('productImages')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contribution.contributionData?.frontImageUrl && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">{t('frontImage')}:</span>
                      <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                        <Image
                          src={contribution.contributionData.frontImageUrl}
                          alt={t('frontImage')}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  {contribution.contributionData?.ingredientsImageUrl && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">{t('ingredientsImage')}:</span>
                      <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                        <Image
                          src={contribution.contributionData.ingredientsImageUrl}
                          alt={t('ingredientsImage')}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Info */}
            {contribution.reviewedAt && (
              <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
                <h3 className="font-semibold text-sm">{t('reviewInfo')}</h3>
                <div className="text-sm text-muted-foreground">
                  {t('reviewedOn')} {format(new Date(contribution.reviewedAt), 'PPP')}
                </div>
                {contribution.notes && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">{t('notes')}:</span>
                    <p className="text-sm mt-1">{contribution.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Admin Notes (for pending contributions) */}
            {contribution.status === 'pending' && (
              <div className="space-y-2">
                <Label htmlFor="notes">{t('adminNotes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('adminNotesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!isLoadingData && contribution?.status === 'pending' ? (
            <>
              {isEditing && Object.keys(editedData).length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                  className="mr-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>{tCommon('saveChanges')}</>
                  )}
                </Button>
              )}
              <div className="flex gap-2 flex-1">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {tCommon('reject')}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {tCommon('approve')}
                </Button>
              </div>
            </>
          ) : !isLoadingData ? (
            <Button onClick={onClose}>{tCommon('close')}</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
