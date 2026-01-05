'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from '@/lib/hooks/use-translations'
import { groupsApi } from '@/lib/api/groups'
import { toast } from 'sonner'

const createGroupSchema = z.object({
    nameAr: z.string().min(1, 'Arabic name is required'),
    nameEn: z.string().min(1, 'English name is required'),
    descriptionAr: z.string().optional(),
    descriptionEn: z.string().optional(),
    coverPhotoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
    const t = useTranslations('groups')
    const tCommon = useTranslations('common')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof createGroupSchema>>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            nameAr: '',
            nameEn: '',
            descriptionAr: '',
            descriptionEn: '',
            coverPhotoUrl: '',
        }
    })

    const onSubmit = async (data: z.infer<typeof createGroupSchema>) => {
        setIsSubmitting(true)
        try {
            await groupsApi.createGroup({
                ...data,
                coverPhotoUrl: data.coverPhotoUrl || undefined
            })
            toast.success('Group created successfully')
            onSuccess()
            onClose()
            form.reset()
        } catch (error) {
            console.error(error)
            toast.error('Failed to create group')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('createNew')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nameAr">{t('nameAr')}</Label>
                            <Input id="nameAr" {...form.register('nameAr')} dir="rtl" placeholder="الاسم بالعربية" />
                            {form.formState.errors.nameAr && <p className="text-sm text-red-500">{form.formState.errors.nameAr.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nameEn">{t('nameEn')}</Label>
                            <Input id="nameEn" {...form.register('nameEn')} placeholder="English Name" />
                            {form.formState.errors.nameEn && <p className="text-sm text-red-500">{form.formState.errors.nameEn.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descriptionAr">{t('description')} (AR)</Label>
                        <Textarea id="descriptionAr" {...form.register('descriptionAr')} dir="rtl" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descriptionEn">{t('description')} (EN)</Label>
                        <Textarea id="descriptionEn" {...form.register('descriptionEn')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coverPhotoUrl">Cover Photo URL</Label>
                        <Input id="coverPhotoUrl" {...form.register('coverPhotoUrl')} placeholder="https://..." />
                        {form.formState.errors.coverPhotoUrl && <p className="text-sm text-red-500">{form.formState.errors.coverPhotoUrl.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>{tCommon('cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : tCommon('submit')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
