'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
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

    if (isLoading && groups.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>{tCommon('loading')}...</p>
            </div>
        )
    }

    if (groups.length === 0) {
        return (
            <div className="text-center h-64 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold">{t('noGroups')}</h3>
                <p className="text-muted-foreground">There are no groups to display.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('nameAr')}</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3 hidden md:table-cell">{t('nameEn')}</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3 hidden lg:table-cell">{t('description')}</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('postCount')}</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('participants')}</TableHead>
                        <TableHead className="text-right text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((group) => (
                        <TableRow key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b transition-colors">
                            <TableCell className="font-medium">{group.nameAr}</TableCell>
                            <TableCell className="hidden md:table-cell">{group.nameEn}</TableCell>
                            <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-muted-foreground text-sm">
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
                                <Button variant="outline" size="sm" onClick={() => onViewDetails?.(group.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t('viewDetails')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
