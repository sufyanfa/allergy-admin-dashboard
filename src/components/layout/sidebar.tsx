'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/constants'
import {
  BarChart3,
  Users,
  Package,
  AlertTriangle,
  GitPullRequest,
  TrendingUp,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Users,
  Package,
  AlertTriangle,
  GitPullRequest,
  TrendingUp,
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('hidden md:flex h-full w-64 flex-col bg-white border-r', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 md:px-6">
        <h1 className="text-lg md:text-xl font-bold text-primary">
          Allergy Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <p className="text-xs text-muted-foreground text-center">
          Admin Dashboard v1.0.0
        </p>
      </div>
    </div>
  )
}