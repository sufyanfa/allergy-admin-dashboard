'use client'

import { useState } from 'react'
import { ProductList } from '@/types/lists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Share2,
    Lock,
    Globe,
    Users,
    Package,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useListsStore } from '@/lib/stores/lists-store'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/hooks/use-translations'

interface ListsTableProps {
    lists: ProductList[]
    isLoading: boolean
    onEdit?: (listId: string) => void
    onViewMembers?: (listId: string) => void
    onManageSharing?: (listId: string) => void
    onViewDetails?: (listId: string) => void
}

export function ListsTable({
    lists,
    isLoading,
    onEdit,
    onViewMembers,
    onManageSharing,
    onViewDetails
}: ListsTableProps) {
    const router = useRouter()
    const tCommon = useTranslations('common')
    const t = useTranslations('lists')
    const { deleteList } = useListsStore()

    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [sortField, setSortField] = useState<'nameAr' | 'nameEn' | 'privacy' | 'productCount' | 'createdAt'>('createdAt')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Sort lists
    const sortedLists = [...lists].sort((a, b) => {
        let aVal: any = a[sortField]
        let bVal: any = b[sortField]

        // Handle different field types
        if (sortField === 'createdAt') {
            aVal = new Date(a.createdAt).getTime()
            bVal = new Date(b.createdAt).getTime()
        } else if (sortField === 'productCount') {
            aVal = a.productCount || 0
            bVal = b.productCount || 0
        } else if (sortField === 'privacy') {
            aVal = a.privacy
            bVal = b.privacy
        } else {
            // String comparison for names
            aVal = (aVal || '').toLowerCase()
            bVal = (bVal || '').toLowerCase()
        }

        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        }
    })

    const handleDelete = async (listId: string) => {
        if (!confirm(t('areYouSureDelete'))) return

        try {
            setDeletingId(listId)
            await deleteList(listId)
        } catch (error) {
            console.error('Failed to delete list:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const handleView = (listId: string) => {
        if (onViewDetails) {
            onViewDetails(listId)
        } else {
            router.push(`/lists/${listId}`)
        }
    }

    const SortIcon = ({ field }: { field: typeof sortField }) => {
        if (sortField !== field) {
            return <span className="ml-1 text-muted-foreground opacity-0 group-hover:opacity-50">↕</span>
        }
        return sortDirection === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
    }

    if (isLoading && lists.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Lists</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading lists...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!isLoading && lists.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Lists</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-semibold mb-2">{t('noListsFound')}</p>
                            <p className="text-muted-foreground">
                                {t('createFirstList')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('lists')} ({lists.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 group"
                                    onClick={() => handleSort('nameAr')}
                                >
                                    <div className="flex items-center">
                                        {t('nameAr')}
                                        <SortIcon field="nameAr" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 group"
                                    onClick={() => handleSort('nameEn')}
                                >
                                    <div className="flex items-center">
                                        {t('nameEn')}
                                        <SortIcon field="nameEn" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 group"
                                    onClick={() => handleSort('privacy')}
                                >
                                    <div className="flex items-center">
                                        {t('privacy')}
                                        <SortIcon field="privacy" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 group"
                                    onClick={() => handleSort('productCount')}
                                >
                                    <div className="flex items-center">
                                        {t('products')}
                                        <SortIcon field="productCount" />
                                    </div>
                                </TableHead>
                                <TableHead>{t('sharing')}</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 group"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center">
                                        {t('created')}
                                        <SortIcon field="createdAt" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">{t('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedLists.map((list) => (
                                <TableRow key={list.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            {list.icon && <span className="text-xl">{list.icon}</span>}
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span>{list.nameAr}</span>
                                                </div>
                                                {list.descriptionAr && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {list.descriptionAr}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            {list.nameEn}
                                            {list.descriptionEn && (
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {list.descriptionEn}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={list.privacy === 'public' ? 'default' : 'secondary'}
                                        >
                                            {list.privacy === 'public' ? (
                                                <>
                                                    <Globe className="h-3 w-3 mr-1" />
                                                    Public
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Private
                                                </>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-1">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{list.productCount}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {list.shareEnabled ? (
                                            <Badge variant="default" className="bg-green-500">
                                                <Share2 className="h-3 w-3 mr-1" />
                                                Enabled
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Disabled
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {new Date(list.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(list.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t('viewDetails')}
                                                </DropdownMenuItem>
                                                {onEdit && (
                                                    <DropdownMenuItem onClick={() => onEdit(list.id)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        {t('editList')}
                                                    </DropdownMenuItem>
                                                )}
                                                {onViewMembers && (
                                                    <DropdownMenuItem onClick={() => onViewMembers(list.id)}>
                                                        <Users className="h-4 w-4 mr-2" />
                                                        {t('viewMembers')}
                                                    </DropdownMenuItem>
                                                )}
                                                {onManageSharing && (
                                                    <DropdownMenuItem onClick={() => onManageSharing(list.id)}>
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        {t('manageSharing')}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(list.id)}
                                                    disabled={deletingId === list.id}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    {deletingId === list.id ? t('deleting') : tCommon('delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
