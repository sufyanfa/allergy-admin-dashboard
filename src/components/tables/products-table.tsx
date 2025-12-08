'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Edit,
  Trash2,
  Eye,
  Package,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Product } from '@/types'
import { useProductsStore } from '@/lib/stores/products-store'
import { ProductForm } from '@/components/forms/product-form'
import { ProductDetails } from '@/components/forms/product-details'
import { toast } from 'sonner'

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
}

import { useTranslations } from '@/lib/hooks/use-translations'

export function ProductsTable({ products, isLoading, onLoadMore, hasMore }: ProductsTableProps) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const { categories, deleteProduct, fetchProduct } = useProductsStore()

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id)
      toast.success(t('deleteSuccess'))
      setShowDeleteDialog(false)
      setProductToDelete(null)
    } catch {
      toast.error(t('deleteError'))
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditForm(true)
  }

  const handleView = async (product: Product) => {
    // Set the basic product first so we have something to show
    setSelectedProduct(product)
    setShowDetails(true)
    setIsLoadingDetails(true)

    try {
      // Fetch full product details including ingredients
      const fullProduct = await fetchProduct(product.id)
      console.log('✅ Fetched full product:', fullProduct)

      // Only update if we got valid data
      if (fullProduct && fullProduct.id) {
        setSelectedProduct(fullProduct)
      } else {
        console.warn('⚠️ Full product data is invalid, keeping basic info')
      }
    } catch (error) {
      console.error('❌ Failed to fetch product details:', error)
      toast.error(t('fetchError'))
      // Keep showing the basic product info even if full fetch fails
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const getDataSourceBadge = (dataSource: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      api: 'default',
      manual: 'secondary',
      community: 'outline'
    }
    return (
      <Badge variant={variants[dataSource] || 'outline'} className="text-xs">
        {dataSource.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading && (!products || products.length === 0)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{tCommon('loading')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isLoading && (!products || products.length === 0)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noProductsFound')}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t('noProductsMatch')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoading && products.length > 0 && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 z-10 flex items-center justify-center rounded-md">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tCommon('loading')}</span>
                </div>
              </div>
            )}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('brand')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('barcode')}</TableHead>
                    <TableHead>{t('dataSource')}</TableHead>
                    <TableHead className="text-right">{tCommon('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.nameAr}
                              className="h-12 w-12 rounded-md object-cover border border-gray-200"
                              onError={(e) => {
                                // If image fails to load, show placeholder
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const placeholder = target.nextElementSibling as HTMLElement
                                if (placeholder) placeholder.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-gray-200 ${product.imageUrl ? 'hidden' : ''}`}>
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{product.nameAr}</div>
                            {product.nameEn && (
                              <div className="text-sm text-muted-foreground">{product.nameEn}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.brandAr}</div>
                          {product.brandEn && (
                            <div className="text-sm text-muted-foreground">{product.brandEn}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                        {product.subcategory && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.subcategory}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {product.barcode || (
                            <span className="text-muted-foreground not-italic">N/A</span>
                          )}
                        </code>
                      </TableCell>
                      <TableCell>{getDataSourceBadge(product.dataSource)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(product)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title={t('viewDetails')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title={t('editProduct')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(product)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={t('deleteProduct')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Load More Button */}
          {hasMore ? (
            <div className="flex justify-center mt-4">
              <Button
                onClick={onLoadMore}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  tCommon('loadMore')
                )}
              </Button>
            </div>
          ) : (
            products.length > 0 && (
              <div className="flex justify-center mt-4 py-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{tCommon('allLoaded')} ({products.length} {tCommon('total')})</span>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {showDetails && (
        <ProductDetails
          product={selectedProduct}
          open={showDetails}
          onClose={() => {
            setShowDetails(false)
            setSelectedProduct(null)
          }}
          isLoading={isLoadingDetails}
        />
      )}

      {/* Edit Product Modal */}
      {selectedProduct && showEditForm && (
        <ProductForm
          open={showEditForm}
          onClose={() => {
            setShowEditForm(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon('messages.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('areYouSureDelete', { name: productToDelete?.nameAr || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('deleteProduct')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}