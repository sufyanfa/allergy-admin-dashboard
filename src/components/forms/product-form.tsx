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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Loader2 } from 'lucide-react'
import { Product, ProductCategory, Ingredient } from '@/types'
import { useProductsStore } from '@/lib/stores/products-store'
import { toast } from 'sonner'

const productSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().optional(),
  brandAr: z.string().min(1, 'Arabic brand is required'),
  brandEn: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  countryOfOrigin: z.string().optional(),
  dataSource: z.enum(['api', 'manual', 'community']),
  verified: z.boolean(),
  confidenceScore: z.number().min(0).max(100),
})

type ProductFormData = z.infer<typeof productSchema>

interface IngredientFormData {
  nameAr: string
  nameEn: string
  isAllergen: boolean
  allergenType?: string
  orderIndex: number
}

interface ProductFormProps {
  open: boolean
  onClose: () => void
  product?: Product
  categories: ProductCategory[]
}

export function ProductForm({ open, onClose, product, categories }: ProductFormProps) {
  const [ingredients, setIngredients] = useState<IngredientFormData[]>([])
  const [newIngredient, setNewIngredient] = useState<IngredientFormData>({
    nameAr: '',
    nameEn: '',
    isAllergen: false,
    allergenType: '',
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
      verified: false,
      confidenceScore: 100,
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        barcode: product.barcode,
        nameAr: product.nameAr,
        nameEn: product.nameEn || '',
        brandAr: product.brandAr,
        brandEn: product.brandEn || '',
        category: product.category,
        subcategory: product.subcategory || '',
        imageUrl: product.imageUrl || '',
        countryOfOrigin: product.countryOfOrigin || '',
        dataSource: product.dataSource,
        verified: product.verified,
        confidenceScore: product.confidenceScore,
      })

      if (product.ingredients) {
        setIngredients(
          product.ingredients.map((ing, index) => ({
            nameAr: ing.nameAr,
            nameEn: ing.nameEn,
            isAllergen: ing.isAllergen,
            allergenType: ing.allergenType || '',
            orderIndex: ing.orderIndex || index
          }))
        )
      }
    } else {
      form.reset()
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
        isAllergen: false,
        allergenType: '',
        orderIndex: 0
      })
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      const productData = {
        ...data,
        ingredients: ingredients.map((ing, index) => ({
          id: `temp-${index}`,
          nameAr: ing.nameAr,
          nameEn: ing.nameEn,
          isAllergen: ing.isAllergen,
          allergenType: ing.allergenType,
          orderIndex: index
        }))
      }

      if (product) {
        await updateProduct(product.id, productData)
        toast.success('Product updated successfully')
      } else {
        await createProduct(productData)
        toast.success('Product created successfully')
      }

      onClose()
    } catch (error) {
      toast.error(product ? 'Failed to update product' : 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter barcode" />
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
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
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
                        <FormLabel>Product Name (Arabic) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="اسم المنتج" dir="rtl" />
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
                        <FormLabel>Product Name (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Product name" />
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
                        <FormLabel>Brand (Arabic) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="العلامة التجارية" dir="rtl" />
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
                        <FormLabel>Brand (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brand name" />
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
                        <FormLabel>Subcategory</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Product subcategory" />
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
                        <FormLabel>Country of Origin</FormLabel>
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
                      <FormLabel>Image URL</FormLabel>
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
                        <FormLabel>Data Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual Entry</SelectItem>
                            <SelectItem value="api">API Import</SelectItem>
                            <SelectItem value="community">Community Sourced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confidenceScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confidence Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>0-100%</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Verified</FormLabel>
                          <FormDescription>
                            Mark as admin verified
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Ingredient Form */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Add Ingredient</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Arabic name"
                      value={newIngredient.nameAr}
                      onChange={(e) =>
                        setNewIngredient(prev => ({ ...prev, nameAr: e.target.value }))
                      }
                      dir="rtl"
                    />
                    <Input
                      placeholder="English name"
                      value={newIngredient.nameEn}
                      onChange={(e) =>
                        setNewIngredient(prev => ({ ...prev, nameEn: e.target.value }))
                      }
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newIngredient.isAllergen}
                        onCheckedChange={(checked) =>
                          setNewIngredient(prev => ({ ...prev, isAllergen: checked }))
                        }
                      />
                      <span className="text-sm">Allergen</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddIngredient}
                      disabled={!newIngredient.nameAr.trim()}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {newIngredient.isAllergen && (
                    <Input
                      placeholder="Allergen type (e.g., nuts, dairy)"
                      value={newIngredient.allergenType}
                      onChange={(e) =>
                        setNewIngredient(prev => ({ ...prev, allergenType: e.target.value }))
                      }
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Ingredients List */}
                {ingredients.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Ingredients List</h4>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <div>
                              <div className="font-medium">{ingredient.nameAr}</div>
                              {ingredient.nameEn && (
                                <div className="text-sm text-muted-foreground">
                                  {ingredient.nameEn}
                                </div>
                              )}
                            </div>
                            {ingredient.isAllergen && (
                              <Badge variant="destructive" className="text-xs">
                                Allergen
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveIngredient(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}