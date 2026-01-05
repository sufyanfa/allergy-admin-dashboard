'use client'

import { useEffect, useState } from 'react'
import { useGroupsStore } from '@/lib/stores/groups-store'
import { GroupsTable } from '@/components/tables/groups-table'
import { GroupDetailModal } from './group-detail-modal'
import { CreateGroupModal } from './create-group-modal'
import { useTranslations } from '@/lib/hooks/use-translations'
import { AlertCircle, Plus } from 'lucide-react'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert'
import { Group } from '@/types/groups'
import { Button } from '@/components/ui/button'

export function GroupsOverview() {
    const t = useTranslations('groups')
    const {
        groups,
        isLoading,
        error,
        fetchGroups,
    } = useGroupsStore()
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const handleViewDetails = (groupId: string) => {
        const group = groups.find(g => g.id === groupId)
        if (group) {
            setSelectedGroup(group)
            setIsDetailOpen(true)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground">
                        {t('overviewDescription')}
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createNew')}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <GroupsTable
                groups={groups}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
            />

            <GroupDetailModal
                group={selectedGroup}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />

            <CreateGroupModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchGroups}
            />
        </div>
    )
}
