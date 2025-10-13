'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Package,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export function ProductsTable({ products, isLoading, onLoadMore, hasMore }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const { categories, deleteProduct } = useProductsStore()

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id)
      toast.success('Product deleted successfully')
      setShowDeleteDialog(false)
      setProductToDelete(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditForm(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setShowDetails(true)
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

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading && (!products || products.length === 0)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading products...</span>
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
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No products match your current search criteria. Try adjusting your filters or search terms.
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading products...</span>
                </div>
              </div>
            )}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
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
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {product.verified ? (
                          <Badge variant="default" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {product.ingredients?.some(i => i.isAllergen) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Allergens
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getConfidenceColor(product.confidenceScore)}>
                        {product.confidenceScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.createdAt ? (
                        <>
                          <div className="text-sm">
                            {format(new Date(product.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(product.createdAt), 'HH:mm')}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">N/A</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleView(product)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                    Loading...
                  </>
                ) : (
                  'Load More Products'
                )}
              </Button>
            </div>
          ) : (
            products.length > 0 && (
              <div className="flex justify-center mt-4 py-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>All products loaded ({products.length} total)</span>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {selectedProduct && showDetails && (
        <ProductDetails
          product={selectedProduct}
          open={showDetails}
          onClose={() => {
            setShowDetails(false)
            setSelectedProduct(null)
          }}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              &quot;{productToDelete?.nameAr}&quot; and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}