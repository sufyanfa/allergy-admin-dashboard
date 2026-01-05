'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    MoreHorizontal,
    ArrowUpDown,
    Eye,
    Users,
    MessageSquare,
} from 'lucide-react'
import { useTranslations } from '@/lib/hooks/use-translations'
import { Group } from '@/types/groups'

interface GroupsTableProps {
    groups: Group[]
    isLoading: boolean
    onViewDetails?: (groupId: string) => void
}

export function GroupsTable({ groups, isLoading, onViewDetails }: GroupsTableProps) {
    const t = useTranslations('groups')
    const tCommon = useTranslations('common')
    const [sortField, setSortField] = useState<'nameAr' | 'nameEn' | 'postCount' | 'participantCount'>('postCount')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const sortedGroups = [...groups].sort((a, b) => {
        let aVal: any = a[sortField]
        let bVal: any = b[sortField]

        if (sortField === 'nameAr' || sortField === 'nameEn') {
            aVal = (aVal || '').toLowerCase()
            bVal = (bVal || '').toLowerCase()
        }

        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        }
    })

    const SortIcon = ({ field }: { field: typeof sortField }) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'text-primary' : 'text-primary rotate-180'}`} />
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>{t('title')}</CardTitle></CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                    <p>{tCommon('loading')}...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')} ({groups.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('nameAr')}>
                                    <div className="flex items-center">
                                        {t('nameAr')}
                                        <SortIcon field="nameAr" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('nameEn')}>
                                    <div className="flex items-center">
                                        {t('nameEn')}
                                        <SortIcon field="nameEn" />
                                    </div>
                                </TableHead>
                                <TableHead>{t('description')}</TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('postCount')}>
                                    <div className="flex items-center">
                                        {t('postCount')}
                                        <SortIcon field="postCount" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('participantCount')}>
                                    <div className="flex items-center">
                                        {t('participants')}
                                        <SortIcon field="participantCount" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">{t('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedGroups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell className="font-medium">{group.nameAr}</TableCell>
                                    <TableCell>{group.nameEn}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                                        {group.descriptionAr || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            {group.postCount}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {group.participantCount}
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
                                                <DropdownMenuItem onClick={() => onViewDetails?.(group.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t('viewDetails')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {groups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        {t('noGroups')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
