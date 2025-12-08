'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Settings, Menu, BarChart3, Users, Package, AlertTriangle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { NAVIGATION_ITEMS } from '@/constants'
import { useState } from 'react'
import { LanguageSwitcher } from './language-switcher'
import { useTranslations, useLocale } from '@/lib/hooks/use-translations'


const iconMap = {
  BarChart3,
  Users,
  Package,
  AlertTriangle,
}

export function Header() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('common')
  const tNav = useTranslations('nav')

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}/auth/login`)
  }

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || 'AD'

  return (
    <header className="relative h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            <span className="hidden sm:inline">{t('adminDashboard')}</span>
            <span className="sm:hidden">{t('admin')}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatarUrl} alt={user?.fullName || 'Admin'} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || user?.username || 'Admin User'}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
                {user?.phone && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.phone}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${locale}/profile`)}>
              <User className="h-4 w-4" />
              <span>{t('profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/settings`)}>
              <Settings className="h-4 w-4" />
              <span>{t('settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu */}
          <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg md:hidden z-50">
            <nav className="px-4 py-2 space-y-1">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap]
                const localizedHref = `/${locale}${item.href}`
                const isActive = pathname === localizedHref

                return (
                  <Link key={item.href} href={localizedHref}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tNav(item.translationKey)}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}