'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  ShieldCheck,
  Shield,
  AlertTriangle,
  MapPin,
  Calendar,
  ExternalLink,
  Heart,
  Loader2,
  Users
} from 'lucide-react'
import { Product, AllergyCheck } from '@/types'
import { useProductsStore } from '@/lib/stores/products-store'
import { useAllergiesStore } from '@/lib/stores/allergies-store'
import { toast } from 'sonner'

interface ProductDetailsProps {
  product: Product | null
  open: boolean
  onClose: () => void
  isLoading?: boolean
}

import { useTranslations, useLocale } from '@/lib/hooks/use-translations'

export function ProductDetails({ product, open, onClose, isLoading = false }: ProductDetailsProps) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [allergyCheck, setAllergyCheck] = useState<AllergyCheck | null>(null)
  const [isCheckingAllergies, setIsCheckingAllergies] = useState(false)
  const [isRequestingReview, setIsRequestingReview] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [selectedAllergyIds, setSelectedAllergyIds] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [targetField, setTargetField] = useState<string>('overall')
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  const { checkProductAllergies, requestCommunityReview } = useProductsStore()
  const { allergies, fetchAllergiesOverview } = useAllergiesStore()

  // Define ranks/badges available for targeting
  const availableRanks = ['explorer', 'verifier', 'guardian', 'expert']

  useEffect(() => {
    if (isReviewDialogOpen && allergies.length > 0 && product?.ingredients) {
      const autoSelected = new Set<string>()
      product.ingredients.forEach(ing => {
        if (ing.isAllergen && ing.allergenType) {
          const matched = allergies.find(a =>
            a.nameEn?.toLowerCase() === ing.allergenType?.toLowerCase() ||
            a.nameAr === ing.allergenType
          )
          if (matched) autoSelected.add(matched.id)
        }
      })
      if (autoSelected.size > 0 && selectedAllergyIds.length === 0) {
        setSelectedAllergyIds(Array.from(autoSelected))
        setHasAutoSelected(true)
      } else {
        setHasAutoSelected(false)
      }
    } else if (!isReviewDialogOpen) {
      setHasAutoSelected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewDialogOpen, allergies])

  const handleAllergyCheck = async () => {
    if (!product) return

    setIsCheckingAllergies(true)
    try {
      const result = await checkProductAllergies(product.id)
      setAllergyCheck(result)
    } catch {
      toast.error(t('checkAllergiesFailed'))
    } finally {
      setIsCheckingAllergies(false)
    }
  }

  const handleRequestReview = () => {
    if (!product) return
    setReviewNotes('')
    setSelectedAllergyIds([])
    setSelectedRoles([])
    setHasAutoSelected(false)

    // Make sure we have allergies loaded
    if (allergies.length === 0) {
      fetchAllergiesOverview()
    }

    setIsReviewDialogOpen(true)
  }

  const submitReviewRequest = async () => {
    if (!product) return

    setIsRequestingReview(true)
    try {
      await requestCommunityReview(product.id, reviewNotes, selectedAllergyIds, selectedRoles, targetField)
      toast.success(t('requestReviewSuccess') || 'Community review requested successfully')
      setIsReviewDialogOpen(false)
    } catch {
      toast.error(t('requestReviewFailed') || 'Failed to request community review')
    } finally {
      setIsRequestingReview(false)
    }
  }

  const getDataSourceColor = (source: string) => {
    switch (source) {
      case 'api': return 'bg-blue-100 text-blue-800'
      case 'manual': return 'bg-green-100 text-green-800'
      case 'community': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Details
              {isLoading && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin text-muted-foreground" />
              )}
            </DialogTitle>
            <DialogDescription>
              {product ? t('productDetailsDescription', { name: product.nameAr }) : t('productDetails')}
            </DialogDescription>
          </DialogHeader>

          {!product ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{tCommon('loading')}</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.nameAr}
                        className="w-24 h-24 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h2 className="text-2xl font-bold">{product.nameAr}</h2>
                        {product.nameEn && (
                          <p className="text-lg text-muted-foreground">{product.nameEn}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.brandAr}</p>
                        {product.brandEn && (
                          <p className="text-sm text-muted-foreground">{product.brandEn}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                        {product.subcategory && (
                          <Badge variant="secondary">{product.subcategory}</Badge>
                        )}
                        <Badge className={getDataSourceColor(product.dataSource)}>
                          {product.dataSource?.toUpperCase() || tCommon('unknown')}
                        </Badge>
                        {product.verified ? (
                          <Badge variant="default">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {t('verified')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            {t('pending')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('productInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-muted-foreground">{t('barcode')}</label>
                        <p className="font-mono mt-1 text-base">
                          {product.barcode || (
                            <span className="text-muted-foreground italic font-sans">{t('notAvailable')}</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">{t('confidenceScore')}</label>
                        <p className={`mt-1 font-medium ${getConfidenceColor(product.confidenceScore || 0)}`}>
                          {product.confidenceScore ?? 0}%
                        </p>
                      </div>
                      {product.countryOfOrigin && (
                        <div>
                          <label className="font-medium text-muted-foreground">{t('countryOfOrigin')}</label>
                          <p className="mt-1 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {product.countryOfOrigin}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="font-medium text-muted-foreground">{t('dataSource')}</label>
                        <p className="mt-1">{product.dataSource || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">{t('created')}</label>
                        <p className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {product.createdAt ? format(new Date(product.createdAt), 'PPP') : 'N/A'}
                        </p>
                      </div>
                      {product.updatedAt && (
                        <div>
                          <label className="font-medium text-muted-foreground">{t('lastUpdated')}</label>
                          <p className="mt-1">
                            {format(new Date(product.updatedAt), 'PPP')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Allergy Check */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      {t('allergyInformation')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!allergyCheck ? (
                      <div className="text-center py-4">
                        <Button
                          onClick={handleAllergyCheck}
                          disabled={isCheckingAllergies}
                          className="w-full"
                        >
                          {isCheckingAllergies ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('checkingAllergies')}
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {t('checkForAllergies')}
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('checkAllergiesHelper')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t('allergyStatus')}</span>
                          <Badge
                            variant={allergyCheck.hasAllergies ? 'destructive' : 'default'}
                          >
                            {allergyCheck.hasAllergies ? t('containsAllergens') : t('noKnownAllergens')}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t('riskLevel')}</span>
                          <Badge className={getRiskLevelColor(allergyCheck.riskLevel)}>
                            {allergyCheck.riskLevel.toUpperCase()}
                          </Badge>
                        </div>

                        {allergyCheck.allergies.length > 0 && (
                          <div>
                            <label className="font-medium text-muted-foreground text-sm">
                              {t('detectedAllergens')}
                            </label>
                            <div className="mt-2 space-y-2">
                              {allergyCheck.allergies.map((allergy, index) => (
                                <div
                                  key={index}
                                  className="p-2 border rounded-lg bg-red-50 border-red-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-red-800">
                                      {allergy.nameAr}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                      {allergy.severity}
                                    </Badge>
                                  </div>
                                  {allergy.ingredients.length > 0 && (
                                    <p className="text-xs text-red-600 mt-1">
                                      {t('foundIn')}: {allergy.ingredients.join(', ')}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {allergyCheck.recommendations.length > 0 && (
                          <div>
                            <label className="font-medium text-muted-foreground text-sm">
                              {t('recommendations')}
                            </label>
                            <ul className="mt-2 space-y-1">
                              {allergyCheck.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('ingredients')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.ingredients.map((ingredient, index) => {
                        const displayName = locale === 'ar' ? ingredient.nameAr : (ingredient.nameEn || ingredient.nameAr)
                        const secondaryName = locale === 'ar' ? ingredient.nameEn : ingredient.nameAr

                        return (
                          <div
                            key={ingredient.id}
                            className={`p-3 rounded-lg border ${ingredient.isAllergen
                              ? 'bg-red-50 border-red-200'
                              : 'bg-muted/50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {index + 1}. {displayName}
                              </span>
                              {ingredient.isAllergen && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {t('allergen')}
                                </Badge>
                              )}
                            </div>
                            {secondaryName && displayName !== secondaryName && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {secondaryName}
                              </p>
                            )}
                            {ingredient.allergenType && (
                              <p className="text-xs text-red-600 mt-1">
                                {t('type')}: {ingredient.allergenType}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center mt-6 border-t pt-4">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={handleRequestReview}
                  disabled={isRequestingReview}
                >
                  {isRequestingReview ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  {t('requestCommunityReview') || 'Request Community Review'}
                </Button>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    {tCommon('close')}
                  </Button>
                  {product.imageUrl && (
                    <Button variant="outline" asChild>
                      <a href={product.imageUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('viewImage')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('requestCommunityReviewTitle') || 'Request Community Review'}</DialogTitle>
            <DialogDescription>
              {t('requestReviewPrompt') || 'Enter a message and instructions for the community reviewers.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes') || 'Review Instructions'} - <span className="text-xs font-normal text-muted-foreground">{tCommon('optional') || 'Optional'}</span></Label>
              <Textarea
                id="notes"
                placeholder={t('requestReviewPlaceholder') || 'e.g. Please verify the ingredients label'}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">{tCommon('targetField') || 'Target Field'}</Label>
              <Select value={targetField} onValueChange={setTargetField}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allergens">{t('fields.allergens') || 'Allergens'}</SelectItem>
                  <SelectItem value="ingredients_ar">{t('fields.ingredients_ar') || 'Ingredients (Arabic)'}</SelectItem>
                  <SelectItem value="ingredients_en">{t('fields.ingredients_en') || 'Ingredients (English)'}</SelectItem>
                  <SelectItem value="nutrition_facts">{t('fields.nutrition_facts') || 'Nutrition Facts'}</SelectItem>
                  <SelectItem value="product_name">{t('fields.product_name') || 'Product Name'}</SelectItem>
                  <SelectItem value="brand_info">{t('fields.brand_info') || 'Brand Info'}</SelectItem>
                  <SelectItem value="overall">{t('fields.overall') || 'Overall'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col">
                <Label className="font-semibold">{t('targetAudienceAllergies') || 'Target Audience (By Allergies)'}</Label>
                <span className="text-xs font-normal text-muted-foreground">{tCommon('optional') || 'Optional'}</span>
              </div>

              {hasAutoSelected && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100 flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {locale === 'ar'
                    ? 'تم تحديد مسببات الحساسية المكتشفة في هذا المنتج تلقائياً.'
                    : 'Allergens detected in this product have been auto-selected.'}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto p-2 border rounded-md bg-muted/20">
                {allergies.map(allergy => (
                  <div key={allergy.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergy-${allergy.id}`}
                      checked={selectedAllergyIds.includes(allergy.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedAllergyIds([...selectedAllergyIds, allergy.id])
                        else setSelectedAllergyIds(selectedAllergyIds.filter(id => id !== allergy.id))
                      }}
                    />
                    <Label htmlFor={`allergy-${allergy.id}`} className="text-sm font-normal cursor-pointer break-words leading-tight">
                      {locale === 'ar' ? allergy.nameAr : allergy.nameEn}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col">
                <Label className="font-semibold">{t('targetAudienceBadges') || 'Target Audience (By Rank/Badge)'}</Label>
                <span className="text-xs font-normal text-muted-foreground">{tCommon('optional') || 'Optional'}</span>
              </div>
              <div className="flex flex-wrap gap-4 p-3 border rounded-md">
                {availableRanks.map(rank => (
                  <div key={rank} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rank-${rank}`}
                      checked={selectedRoles.includes(rank)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedRoles([...selectedRoles, rank])
                        else setSelectedRoles(selectedRoles.filter(r => r !== rank))
                      }}
                    />
                    <Label htmlFor={`rank-${rank}`} className="text-sm font-normal cursor-pointer capitalize">
                      {tCommon(`ranks.${rank}`) || rank}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 space-x-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              {tCommon('cancel') || 'Cancel'}
            </Button>
            <Button onClick={submitReviewRequest}>
              {t('submitRequest') || 'Submit Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}