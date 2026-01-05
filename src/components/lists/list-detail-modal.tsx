'use client'

import { useEffect, useState } from 'react'
import { ProductList } from '@/types/lists'
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
import {
    Loader2,
    Package,
    Calendar,
    Lock,
    Globe,
    Users,
    Share2,
    X,
    Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { useTranslations } from '@/lib/hooks/use-translations'
import { useListsStore } from '@/lib/stores/lists-store'
import { cn } from '@/lib/utils'

interface ListDetailModalProps {
    listId: string | null
    open: boolean
    onClose: () => void
}

export function ListDetailModal({ listId, open, onClose }: ListDetailModalProps) {
    const t = useTranslations('lists')
    const tCommon = useTranslations('common')
    const { fetchListWithProducts, currentList, isLoading, removeProductFromList } = useListsStore()
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

    useEffect(() => {
        if (listId && open) {
            setIsLoadingData(true)
            fetchListWithProducts(listId)
                .finally(() => setIsLoadingData(false))
        }
    }, [listId, open, fetchListWithProducts])

    const handleRemoveProduct = async (productId: string) => {
        if (!listId || !confirm(tCommon('areYouSureDelete'))) return

        setDeletingProductId(productId)
        try {
            await removeProductFromList(listId, productId)
            // Refresh list
            await fetchListWithProducts(listId)
        } catch (error) {
            console.error('Failed to remove product:', error)
        } finally {
            setDeletingProductId(null)
        }
    }

    const list = currentList

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle>{t('viewDetails')}</DialogTitle>
                            <DialogDescription>
                                {t('listDetails')}
                            </DialogDescription>
                        </div>
                        {list && (
                            <Badge variant={list.privacy === 'public' ? 'default' : 'secondary'}>
                                {list.privacy === 'public' ? (
                                    <>
                                        <Globe className="h-3 w-3 mr-1" />
                                        {t('public')}
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-3 w-3 mr-1" />
                                        {t('private')}
                                    </>
                                )}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-sm text-muted-foreground">{tCommon('loading')}...</p>
                        </div>
                    </div>
                ) : !list ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">{t('noListsFound')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* List Header */}
                        <div className="flex items-start gap-4">
                            {list.icon && (
                                <div className="text-4xl">{list.icon}</div>
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1">{list.nameAr}</h2>
                                {list.nameEn && (
                                    <p className="text-lg text-muted-foreground">{list.nameEn}</p>
                                )}
                                {list.descriptionAr && (
                                    <p className="text-sm text-muted-foreground mt-2">{list.descriptionAr}</p>
                                )}
                                {list.descriptionEn && (
                                    <p className="text-sm text-muted-foreground">{list.descriptionEn}</p>
                                )}
                            </div>
                            {list.color && (
                                <div
                                    className="w-12 h-12 rounded-lg border-2"
                                    style={{ backgroundColor: list.color }}
                                />
                            )}
                        </div>

                        <Separator />

                        {/* List Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span>{t('products')}</span>
                                </div>
                                <div className="text-2xl font-bold">{list.productCount}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{t('created')}</span>
                                </div>
                                <div className="text-sm font-medium">
                                    {format(new Date(list.createdAt), 'PPP')}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Share2 className="h-4 w-4" />
                                    <span>{t('sharing')}</span>
                                </div>
                                <Badge variant={list.shareEnabled ? 'default' : 'secondary'}>
                                    {list.shareEnabled ? t('enabled') : t('disabled')}
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{t('default')}</span>
                                </div>
                                <Badge variant={list.isDefault ? 'default' : 'outline'}>
                                    {list.isDefault ? tCommon('yes') : tCommon('no')}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Products Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{t('products')} ({list.items?.length || 0})</h3>
                                <Button size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('addProduct')}
                                </Button>
                            </div>

                            {list.items && list.items.length > 0 ? (
                                <div className="space-y-2">
                                    {list.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product?.nameAr || 'Unknown Product'}</p>
                                                    {item.product?.nameEn && (
                                                        <p className="text-sm text-muted-foreground">{item.product.nameEn}</p>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {t('notes')}: {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(item.addedAt), 'PP')}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveProduct(item.product!.id)}
                                                disabled={deletingProductId === item.product!.id}
                                            >
                                                {deletingProductId === item.product!.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <X className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
                                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-sm font-medium mb-2">{t('noProducts')}</p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {t('noProductsDescription')}
                                    </p>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('addFirstProduct')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <span className="text-sm text-muted-foreground">{t('sortBy')}:</span>
                                <p className="font-medium capitalize">{list.sortBy?.replace('_', ' ')}</p>
                            </div>
                            {list.shareToken && (
                                <div>
                                    <span className="text-sm text-muted-foreground">{t('publicLink')}:</span>
                                    <p className="font-mono text-xs">{list.shareToken.slice(0, 20)}...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {tCommon('close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
