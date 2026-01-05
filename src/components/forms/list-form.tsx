'use client'

import { useState, useEffect } from 'react'
import { useListsStore } from '@/lib/stores/lists-store'
import { CreateListInput } from '@/types/lists'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from '@/lib/hooks/use-translations'

interface ListFormProps {
    open: boolean
    onClose: () => void
    listId?: string
}

export function ListForm({ open, onClose, listId }: ListFormProps) {
    const t = useTranslations('lists')
    const tCommon = useTranslations('common')
    const { createList, updateList, fetchListById, lists, isLoading } = useListsStore()

    const DEFAULT_COLORS = [
        { name: t('colorBlue'), value: '#3B82F6' },
        { name: t('colorGreen'), value: '#10B981' },
        { name: t('colorYellow'), value: '#F59E0B' },
        { name: t('colorRed'), value: '#EF4444' },
        { name: t('colorPurple'), value: '#8B5CF6' },
        { name: t('colorPink'), value: '#EC4899' },
        { name: t('colorIndigo'), value: '#6366F1' },
        { name: t('colorTeal'), value: '#14B8A6' },
    ]

    const DEFAULT_ICONS = ['📋', '⭐', '❤️', '🛒', '📱', '🏠', '🍕', '💊']

    const [formData, setFormData] = useState<CreateListInput>({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        color: '#3B82F6',
        icon: '📋',
        privacy: 'private',
        sortBy: 'date_added',
    })

    const [isPublic, setIsPublic] = useState(false)

    useEffect(() => {
        if (listId) {
            const list = lists.find((l) => l.id === listId)
            if (list) {
                setFormData({
                    nameAr: list.nameAr,
                    nameEn: list.nameEn,
                    descriptionAr: list.descriptionAr,
                    descriptionEn: list.descriptionEn,
                    color: list.color,
                    icon: list.icon,
                    privacy: list.privacy,
                    sortBy: list.sortBy,
                })
                setIsPublic(list.privacy === 'public')
            }
        }
    }, [listId, lists])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const submitData = {
                ...formData,
                privacy: isPublic ? ('public' as const) : ('private' as const),
            }

            if (listId) {
                await updateList(listId, submitData)
            } else {
                await createList(submitData)
            }

            onClose()
        } catch (error) {
            console.error('Failed to save list:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{listId ? t('editList') : t('createNewList')}</DialogTitle>
                    <DialogDescription>
                        {listId ? t('updateListDetails') : t('createNewListDesc')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nameAr">
                                {t('nameAr')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nameAr"
                                value={formData.nameAr}
                                onChange={(e) =>
                                    setFormData({ ...formData, nameAr: e.target.value })
                                }
                                required
                                placeholder={t('listName')}
                                dir="rtl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nameEn">
                                {t('nameEn')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nameEn"
                                value={formData.nameEn}
                                onChange={(e) =>
                                    setFormData({ ...formData, nameEn: e.target.value })
                                }
                                required
                                placeholder={t('listName')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="descriptionAr">{t('descriptionAr')}</Label>
                            <Textarea
                                id="descriptionAr"
                                value={formData.descriptionAr}
                                onChange={(e) =>
                                    setFormData({ ...formData, descriptionAr: e.target.value })
                                }
                                placeholder={t('listDescription')}
                                dir="rtl"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descriptionEn">{t('descriptionEn')}</Label>
                            <Textarea
                                id="descriptionEn"
                                value={formData.descriptionEn}
                                onChange={(e) =>
                                    setFormData({ ...formData, descriptionEn: e.target.value })
                                }
                                placeholder={t('listDescription')}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="color">{t('color')}</Label>
                            <Select
                                value={formData.color}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, color: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: formData.color }}
                                            />
                                            <span>
                                                {DEFAULT_COLORS.find((c) => c.value === formData.color)
                                                    ?.name || t('custom')}
                                            </span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_COLORS.map((color) => (
                                        <SelectItem key={color.value} value={color.value}>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: color.value }}
                                                />
                                                <span>{color.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">{t('icon')}</Label>
                            <Select
                                value={formData.icon}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, icon: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">{formData.icon}</span>
                                            <span>{t('icon')}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_ICONS.map((icon) => (
                                        <SelectItem key={icon} value={icon}>
                                            <span className="text-xl">{icon}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sortBy">{t('defaultSorting')}</Label>
                        <Select
                            value={formData.sortBy}
                            onValueChange={(value: any) =>
                                setFormData({ ...formData, sortBy: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date_added">{t('dateAdded')}</SelectItem>
                                <SelectItem value="name_ar">{t('nameArabic')}</SelectItem>
                                <SelectItem value="name_en">{t('nameEnglish')}</SelectItem>
                                <SelectItem value="safety_level">{t('safetyLevel')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="privacy">{t('publicList')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('publicListDesc')}
                            </p>
                        </div>
                        <Switch
                            id="privacy"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {tCommon('cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    {listId ? t('updating') : t('creating')}
                                </>
                            ) : (
                                <>{listId ? t('updateList') : t('createListBtn')}</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
