'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
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
import { USER_ROLES, USER_STATUSES } from '@/constants'

interface UserFormProps {
  user?: User | null
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<User>) => void
  loading?: boolean
}

import { useTranslations } from '@/lib/hooks/use-translations'

export function UserForm({ user, open, onClose, onSubmit, loading }: UserFormProps) {
  const t = useTranslations('users')
  const tCommon = useTranslations('common')
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    location: '',
    role: 'user',
    status: 'active',
    isPublicProfile: false,
    allowContactViaEmail: true,
    emailNotifications: true,
    pushNotifications: true,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        role: user.role,
        status: user.status,
        isPublicProfile: user.isPublicProfile,
        allowContactViaEmail: user.allowContactViaEmail,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
      })
    } else {
      // Reset form for new user
      setFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        bio: '',
        website: '',
        location: '',
        role: 'user',
        status: 'active',
        isPublicProfile: false,
        allowContactViaEmail: true,
        emailNotifications: true,
        pushNotifications: true,
      })
    }
  }, [user, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof User, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? t('editUserTitle') : t('createUserTitle')}
          </DialogTitle>
          <DialogDescription>
            {user
              ? t('editUserDesc')
              : t('createUserDesc')
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
                  <Label htmlFor="fullName">{t('name')}</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder={t('enterFullName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{tCommon('login')} / Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder={t('enterUsername')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('enterEmail')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t('enterPhone')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('profileInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="bio">{t('bio')}</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder={t('enterBio')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">{t('website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder={t('enterWebsite')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('location')}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder={t('enterLocation')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tCommon('settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label>{t('role')}</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_ROLES.USER}>{t('user')}</SelectItem>
                      <SelectItem value={USER_ROLES.ADMIN}>{t('admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_STATUSES.ACTIVE}>{tCommon('active')}</SelectItem>
                      <SelectItem value={USER_STATUSES.INACTIVE}>{tCommon('inactive')}</SelectItem>
                      <SelectItem value={USER_STATUSES.SUSPENDED}>{t('suspendUser')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('privacyNotifications')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('publicProfile')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('publicProfileDesc')}
                  </p>
                </div>
                <Switch
                  checked={formData.isPublicProfile}
                  onCheckedChange={(checked) => handleChange('isPublicProfile', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('allowContact')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('allowContactDesc')}
                  </p>
                </div>
                <Switch
                  checked={formData.allowContactViaEmail}
                  onCheckedChange={(checked) => handleChange('allowContactViaEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('emailNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('emailNotificationsDesc')}
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pushNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pushNotificationsDesc')}
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : user ? t('updateUser') : t('createUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}