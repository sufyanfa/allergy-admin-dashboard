'use client'

import { useState } from 'react'
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
import {
  Package,
  ShieldCheck,
  Shield,
  AlertTriangle,
  MapPin,
  Calendar,
  ExternalLink,
  Heart,
  Loader2
} from 'lucide-react'
import { Product, AllergyCheck } from '@/types'
import { useProductsStore } from '@/lib/stores/products-store'
import { toast } from 'sonner'

interface ProductDetailsProps {
  product: Product
  open: boolean
  onClose: () => void
}

export function ProductDetails({ product, open, onClose }: ProductDetailsProps) {
  const [allergyCheck, setAllergyCheck] = useState<AllergyCheck | null>(null)
  const [isCheckingAllergies, setIsCheckingAllergies] = useState(false)

  const { checkProductAllergies } = useProductsStore()

  const handleAllergyCheck = async () => {
    setIsCheckingAllergies(true)
    try {
      const result = await checkProductAllergies(product.id)
      setAllergyCheck(result)
    } catch {
      toast.error('Failed to check allergies')
    } finally {
      setIsCheckingAllergies(false)
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {product.nameAr}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                {product.imageUrl ? (
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
                      {product.dataSource.toUpperCase()}
                    </Badge>
                    {product.verified ? (
                      <Badge variant="default">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Pending
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
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Barcode</label>
                    <p className="font-mono mt-1">{product.barcode}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Confidence Score</label>
                    <p className={`mt-1 font-medium ${getConfidenceColor(product.confidenceScore)}`}>
                      {product.confidenceScore}%
                    </p>
                  </div>
                  {product.countryOfOrigin && (
                    <div>
                      <label className="font-medium text-muted-foreground">Country of Origin</label>
                      <p className="mt-1 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {product.countryOfOrigin}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="font-medium text-muted-foreground">Data Source</label>
                    <p className="mt-1">{product.dataSource}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Created</label>
                    <p className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(product.createdAt), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Last Updated</label>
                    <p className="mt-1">
                      {format(new Date(product.updatedAt), 'PPP')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergy Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Allergy Information
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
                          Checking Allergies...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Check for Allergies
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Check this product against common allergens
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Allergy Status</span>
                      <Badge
                        variant={allergyCheck.hasAllergies ? 'destructive' : 'default'}
                      >
                        {allergyCheck.hasAllergies ? 'Contains Allergens' : 'No Known Allergens'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Risk Level</span>
                      <Badge className={getRiskLevelColor(allergyCheck.riskLevel)}>
                        {allergyCheck.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    {allergyCheck.allergies.length > 0 && (
                      <div>
                        <label className="font-medium text-muted-foreground text-sm">
                          Detected Allergens
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
                                  Found in: {allergy.ingredients.join(', ')}
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
                          Recommendations
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
                <CardTitle className="text-lg">Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.ingredients.map((ingredient, index) => (
                    <div
                      key={ingredient.id}
                      className={`p-3 rounded-lg border ${
                        ingredient.isAllergen
                          ? 'bg-red-50 border-red-200'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {index + 1}. {ingredient.nameAr}
                        </span>
                        {ingredient.isAllergen && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Allergen
                          </Badge>
                        )}
                      </div>
                      {ingredient.nameEn && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {ingredient.nameEn}
                        </p>
                      )}
                      {ingredient.allergenType && (
                        <p className="text-xs text-red-600 mt-1">
                          Type: {ingredient.allergenType}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {product.imageUrl && (
              <Button variant="outline" asChild>
                <a href={product.imageUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Image
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}