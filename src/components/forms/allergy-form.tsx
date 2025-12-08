'use client'

import { useState, useEffect } from 'react'
import { Allergy } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from '@/lib/hooks/use-translations'

interface AllergyFormProps {
  allergy?: Allergy | null
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<Allergy>) => void
  loading?: boolean
}

export function AllergyForm({ allergy, open, onClose, onSubmit, loading }: AllergyFormProps) {
  const t = useTranslations('allergies')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState<Partial<Allergy>>({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    severity: 'mild',
    isActive: true,
  })

  useEffect(() => {
    if (allergy) {
      setFormData({
        nameAr: allergy.nameAr || '',
        nameEn: allergy.nameEn || '',
        descriptionAr: allergy.descriptionAr || '',
        descriptionEn: allergy.descriptionEn || '',
        severity: allergy.severity || 'mild',
        isActive: allergy.isActive ?? true,
      })
    } else {
      // Reset form for new allergy
      setFormData({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        severity: 'mild',
        isActive: true,
      })
    }
  }, [allergy, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof Allergy, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {allergy ? t('editAllergy') : t('addAllergy')}
          </DialogTitle>
          <DialogDescription>
            {allergy
              ? 'Update allergy information and settings.'
              : 'Create a new allergy type with the required information.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">Arabic Name *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => handleChange('nameAr', e.target.value)}
                    placeholder="الاسم باللغة العربية"
                    dir="rtl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameEn">{t('englishName')}</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => handleChange('nameEn', e.target.value)}
                    placeholder="English name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">{t('arabicDescription')}</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => handleChange('descriptionAr', e.target.value)}
                    placeholder="الوصف باللغة العربية"
                    dir="rtl"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">{t('englishDescription')}</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => handleChange('descriptionEn', e.target.value)}
                    placeholder="English description"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('allergySettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('severityLevel')}</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => handleChange('severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">{t('mild')}</SelectItem>
                      <SelectItem value="moderate">{t('moderate')}</SelectItem>
                      <SelectItem value="severe">{t('severe')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>{t('activeStatus')}</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to select this allergy
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tCommon('loading') : allergy ? t('editAllergy') : t('addAllergy')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}