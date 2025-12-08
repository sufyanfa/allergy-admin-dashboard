'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Loader2, Package } from 'lucide-react'
import { Product, ProductInput, ProductCategory } from '@/types'
import { useProductsStore } from '@/lib/stores/products-store'
import { toast } from 'sonner'
import { useTranslations } from '@/lib/hooks/use-translations'


const productSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().optional(),
  brandAr: z.string().min(1, 'Arabic brand is required'),
  brandEn: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  imageUrl: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  dataSource: z.enum(['api', 'manual', 'community']),
})

type ProductFormData = z.infer<typeof productSchema>

interface IngredientFormData {
  nameAr: string
  nameEn: string
  orderIndex: number
}

interface ProductFormProps {
  open: boolean
  onClose: () => void
  product?: Product
  categories: ProductCategory[]
}

export function ProductForm({ open, onClose, product, categories }: ProductFormProps) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')

  const [ingredients, setIngredients] = useState<IngredientFormData[]>([])
  const [newIngredient, setNewIngredient] = useState<IngredientFormData>({
    nameAr: '',
    nameEn: '',
    orderIndex: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createProduct, updateProduct } = useProductsStore()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode: '',
      nameAr: '',
      nameEn: '',
      brandAr: '',
      brandEn: '',
      category: '',
      subcategory: '',
      imageUrl: '',
      countryOfOrigin: '',
      dataSource: 'manual',
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        barcode: product.barcode || '',
        nameAr: product.nameAr || '',
        nameEn: product.nameEn || '',
        brandAr: product.brandAr || '',
        brandEn: product.brandEn || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        imageUrl: product.imageUrl || '',
        countryOfOrigin: product.countryOfOrigin || '',
        dataSource: product.dataSource || 'manual',
      })

      if (product.ingredients) {
        setIngredients(
          product.ingredients.map((ing, index) => ({
            nameAr: ing.nameAr || '',
            nameEn: ing.nameEn || '',
            orderIndex: ing.orderIndex || index
          }))
        )
      }
    } else {
      form.reset({
        barcode: '',
        nameAr: '',
        nameEn: '',
        brandAr: '',
        brandEn: '',
        category: '',
        subcategory: '',
        imageUrl: '',
        countryOfOrigin: '',
        dataSource: 'manual',
      })
      setIngredients([])
    }
  }, [product, form])

  const handleAddIngredient = () => {
    if (newIngredient.nameAr.trim()) {
      setIngredients([
        ...ingredients,
        {
          ...newIngredient,
          orderIndex: ingredients.length
        }
      ])
      setNewIngredient({
        nameAr: '',
        nameEn: '',
        orderIndex: 0
      })
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleUpdateIngredient = (index: number, field: 'nameAr' | 'nameEn', value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      const productData: ProductInput = {
        ...data,
        // Remove imageUrl if it's empty or invalid to avoid validation error
        imageUrl: data.imageUrl?.trim() && data.imageUrl.trim() !== '' ? data.imageUrl.trim() : undefined,
        ingredients: ingredients.map((ing, index) => ({
          nameAr: ing.nameAr,
          nameEn: ing.nameEn,
          orderIndex: index
        }))
      }

      if (product) {
        await updateProduct(product.id, productData)
        toast.success(tMessages('updated'))
      } else {
        await createProduct(productData)
        toast.success(tMessages('created'))
      }

      onClose()
    } catch {
      toast.error(tMessages('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t('editProduct') : t('addProduct')}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Update the product information and ingredients.'
              : 'Enter the product details and ingredients.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('basicInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('barcode')} *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('enterBarcode')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.nameEn}>
                                {category.nameEn} - {category.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('productNameAr')} *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('productNameArPlaceholder')} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('productNameEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('productNameEnPlaceholder')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('brandAr')} *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('brandArPlaceholder')} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('brandEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('brandEnPlaceholder')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subcategory')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('enterSubcategory')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="countryOfOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('countryOfOrigin')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Made in..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('imageUrl')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/image.jpg" />
                      </FormControl>
                      <FormDescription>
                        Enter a valid URL for the product image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Data Source and Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Source & Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dataSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dataSource')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">{t('manualEntry')}</SelectItem>
                            <SelectItem value="api">{t('apiImport')}</SelectItem>
                            <SelectItem value="community">{t('communitySourced')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('ingredients')}</CardTitle>
                <FormDescription>
                  Add and manage product ingredients. You can edit each ingredient after adding.
                </FormDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Ingredient Form */}
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium mb-3 text-blue-900">{t('addNewIngredient')}</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Input
                      placeholder={t('ingredientNameArPlaceholder')}
                      value={newIngredient.nameAr}
                      onChange={(e) =>
                        setNewIngredient(prev => ({ ...prev, nameAr: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddIngredient()
                        }
                      }}
                      dir="rtl"
                      className="flex-1"
                    />
                    <Input
                      placeholder={t('ingredientNameEnPlaceholder')}
                      value={newIngredient.nameEn}
                      onChange={(e) =>
                        setNewIngredient(prev => ({ ...prev, nameEn: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddIngredient()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddIngredient}
                      disabled={!newIngredient.nameAr.trim()}
                      className="md:w-auto w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('addIngredient')}
                    </Button>
                  </div>
                </div>

                {/* Ingredients List */}
                {ingredients.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('ingredientsList')} ({ingredients.length})</h4>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                        >
                          <span className="text-sm font-medium w-6">{index + 1}.</span>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              placeholder={t('ingredientNameArPlaceholder')}
                              value={ingredient.nameAr}
                              onChange={(e) => handleUpdateIngredient(index, 'nameAr', e.target.value)}
                              dir="rtl"
                              className="text-sm"
                            />
                            <Input
                              placeholder={t('ingredientNameEnPlaceholder')}
                              value={ingredient.nameEn}
                              onChange={(e) => handleUpdateIngredient(index, 'nameEn', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remove ingredient"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('noIngredientsYet')}</p>
                    <p className="text-sm">{t('useFormAbove')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {product ? tCommon('updating') : tCommon('creating')}
                  </>
                ) : (
                  product ? t('editProduct') : t('addProduct')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}