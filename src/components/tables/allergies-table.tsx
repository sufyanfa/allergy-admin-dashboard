'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Allergy } from '@/types'
import { useTranslations } from '@/lib/hooks/use-translations'
import { Edit } from 'lucide-react'

interface AllergiesTableProps {
  allergies: Allergy[]
  onEditAllergy: (allergy: Allergy) => void
}

export function AllergiesTable({ allergies, onEditAllergy }: AllergiesTableProps) {
  const t = useTranslations('allergies')
  const tCommon = useTranslations('common')

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'severe':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200'
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t('allergy')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('severity')}</TableHead>
            <TableHead className="hidden sm:table-cell">{tCommon('status')}</TableHead>
            <TableHead className="text-center">{tCommon('users')}</TableHead>
            <TableHead className="text-right">{tCommon('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allergies.map((allergy) => (
            <TableRow key={allergy.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell className="py-3">
                <div className="font-medium">{allergy.nameAr}</div>
                <div className="text-sm text-muted-foreground">{allergy.nameEn}</div>
              </TableCell>
              <TableCell className="py-3 text-sm text-muted-foreground truncate">
                {allergy.descriptionAr || allergy.descriptionEn}
              </TableCell>
              <TableCell className="py-3 hidden md:table-cell">
                <Badge className={getSeverityBadgeClass(allergy.severity)}>
                  {allergy.severity}
                </Badge>
              </TableCell>
              <TableCell className="py-3 hidden sm:table-cell">
                <Badge variant={allergy.isActive ? 'default' : 'outline'}>
                  {allergy.isActive ? tCommon('active') : tCommon('inactive')}
                </Badge>
              </TableCell>
              <TableCell className="py-3 text-center font-medium">
                {allergy.userCount || 0}
              </TableCell>
              <TableCell className="py-3 text-right">
                <Button variant="ghost" size="icon" onClick={() => onEditAllergy(allergy)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
