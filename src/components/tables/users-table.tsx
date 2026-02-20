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

export function UsersTable({ users, loading, onEdit, onDelete, onUpdateStatus }: UsersTableProps) {
  const t = useTranslations('users')
  const tCommon = useTranslations('common')


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'inactive':
        return 'bg-gray-50 text-gray-600 border border-gray-200'
      case 'suspended':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border border-purple-200'
      case 'premium':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'user':
        return 'bg-gray-50 text-gray-600 border border-gray-200'
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200'
    }
  }

  const getUserInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
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
     <div className="rounded-md">
       <Table>
         <TableHeader>
           <TableRow>
             <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('user')}</TableHead>
             <TableHead className="hidden md:table-cell text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('contact')}</TableHead>
             <TableHead className="hidden md:table-cell text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('role')}</TableHead>
             <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('status')}</TableHead>
             <TableHead className="hidden lg:table-cell text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{t('joined')}</TableHead>
             <TableHead className="text-right text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider py-3">{tCommon('actions')}</TableHead>
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
             users.map((user, index) => (
                 <TableRow key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === users.length - 1 ? '' : 'border-b'}`}>
                 <TableCell className="py-3">
                   <div className="flex items-center space-x-3">
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={user.avatarUrl} alt={user.fullName || user.username} />
                       <AvatarFallback className="text-xs">
                         {getUserInitials(user)}
                       </AvatarFallback>
                     </Avatar>
                     <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                         {user.fullName || user.username || user.email || t('unnamedUser')}
                       </div>
                       {user.username && user.fullName && (
                        <div className="text-sm text-muted-foreground truncate">
                           @{user.username}
                         </div>
                       )}
                     </div>
                   </div>
                 </TableCell>
                 <TableCell className="py-3 hidden md:table-cell">
                   <div className="space-y-1">
                     {user.phone && (
                       <div className="text-sm">{user.phone}</div>
                     )}
                     {user.email && (
                       <div className="text-sm text-muted-foreground">{user.email}</div>
                     )}
                   </div>
                 </TableCell>
                 <TableCell className="py-3 hidden md:table-cell">
                   <Badge className={getRoleColor(user.role)}>
                     {user.role}
                   </Badge>
                 </TableCell>
                 <TableCell className="py-3">
                   <Badge className={getStatusColor(user.status)}>
                     {user.status}
                   </Badge>
                 </TableCell>
                 <TableCell className="py-3 text-sm text-muted-foreground hidden lg:table-cell">
                   {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                 </TableCell>
                 <TableCell className="py-3 text-right">
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