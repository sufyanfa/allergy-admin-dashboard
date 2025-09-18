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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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

export function UserForm({ user, open, onClose, onSubmit, loading }: UserFormProps) {
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
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>
              {user ? 'Edit User' : 'Create New User'}
            </SheetTitle>
            <SheetDescription>
              {user
                ? 'Update user information and settings.'
                : 'Create a new user account with the required information.'
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile</h3>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Enter bio"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="Enter website URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>
            </div>

            {/* System Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">System Settings</h3>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.USER}>User</SelectItem>
                    <SelectItem value={USER_ROLES.PREMIUM}>Premium</SelectItem>
                    <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_STATUSES.ACTIVE}>Active</SelectItem>
                    <SelectItem value={USER_STATUSES.INACTIVE}>Inactive</SelectItem>
                    <SelectItem value={USER_STATUSES.SUSPENDED}>Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Privacy & Notifications</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to view this profile
                  </p>
                </div>
                <Switch
                  checked={formData.isPublicProfile}
                  onCheckedChange={(checked) => handleChange('isPublicProfile', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Contact via Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to contact via email
                  </p>
                </div>
                <Switch
                  checked={formData.allowContactViaEmail}
                  onCheckedChange={(checked) => handleChange('allowContactViaEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}