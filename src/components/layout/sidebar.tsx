'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/constants'
import {
  BarChart3,
  Users,
  Package,
  List,
  AlertTriangle,
  GitPullRequest,
  TrendingUp,
  MessageSquare,
  Flag,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale, useTranslations } from '@/lib/hooks/use-translations'

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Users,
  Package,
  List,
  AlertTriangle,
  GitPullRequest,
  TrendingUp,
  MessageSquare,
  Flag,
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')

  return (
    <div className={cn('hidden md:flex h-full w-64 flex-col bg-white border-r', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 md:px-6">
        <h1 className="text-lg md:text-xl font-bold text-primary">
          {tCommon('allergyAdmin')}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = iconMap[item.icon]
          const localizedHref = `/${locale}${item.href}`
          const isActive = pathname === localizedHref

          return (
            <Link key={item.href} href={localizedHref}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.translationKey)}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <p className="text-xs text-muted-foreground text-center">
          {tCommon('adminDashboard')} {tCommon('version')}
        </p>
      </div>
    </div>
  )
}