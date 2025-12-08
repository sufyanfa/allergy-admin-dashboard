'use client'

import { User } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Ban, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface UsersTableProps {
  users: User[]
  loading?: boolean
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => void
}

import { useTranslations } from '@/lib/hooks/use-translations'
import { useLocale } from '@/lib/hooks/use-translations'

export function UsersTable({ users, loading, onEdit, onDelete, onUpdateStatus }: UsersTableProps) {
  const t = useTranslations('users')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'premium':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return user.username?.substring(0, 2).toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('user')}</TableHead>
            <TableHead>{t('contact')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('joined')}</TableHead>
            <TableHead className="text-right">{tCommon('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {t('noUsersFound')}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName || user.username} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.fullName || user.username || t('unnamedUser')}
                      </div>
                      {user.username && user.fullName && (
                        <div className="text-sm text-muted-foreground">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {user.phone && (
                      <div className="text-sm">{user.phone}</div>
                    )}
                    {user.email && (
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('editUser')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {user.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(user.id, 'suspended')}
                          className="text-orange-600"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {t('suspendUser')}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(user.id, 'active')}
                          className="text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('activateUser')}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deleteUser')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}