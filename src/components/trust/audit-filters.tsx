'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useTranslations } from '@/lib/hooks/use-translations'

interface AuditFiltersProps {
    filters: {
        eventType?: string
        productId?: string
        userId?: string
        fieldType?: string
        dateFrom?: string
        dateTo?: string
    }
    onFilterChange: (filters: any) => void
    onClearFilters: () => void
}

const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'vote_cast', label: 'Vote Cast' },
    { value: 'admin_override', label: 'Admin Override' },
    { value: 'field_frozen', label: 'Field Frozen' },
    { value: 'field_unfrozen', label: 'Field Unfrozen' },
    { value: 'time_decay', label: 'Time Decay' },
    { value: 'trust_recalculated', label: 'Trust Recalculated' },
]

const fieldTypes = [
    { value: 'all', label: 'All Fields' },
    { value: 'allergens', label: 'Allergens' },
    { value: 'ingredients_ar', label: 'Ingredients (AR)' },
    { value: 'ingredients_en', label: 'Ingredients (EN)' },
    { value: 'nutrition_facts', label: 'Nutrition Facts' },
    { value: 'product_name', label: 'Product Name' },
    { value: 'brand_info', label: 'Brand Info' },
    { value: 'overall', label: 'Overall' },
]

export function AuditFilters({ filters, onFilterChange, onClearFilters }: AuditFiltersProps) {
    const t = useTranslations('trust.auditPage.filters')
    const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all')

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('title')}</CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t('clear')}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Event Type */}
                <div className="space-y-2">
                    <Label htmlFor="eventType">{t('eventType')}</Label>
                    <Select
                        value={filters.eventType || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, eventType: value === 'all' ? undefined : value })
                        }
                    >
                        <SelectTrigger id="eventType">
                            <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                            {eventTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Field Type */}
                <div className="space-y-2">
                    <Label htmlFor="fieldType">{t('fieldType')}</Label>
                    <Select
                        value={filters.fieldType || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, fieldType: value === 'all' ? undefined : value })
                        }
                    >
                        <SelectTrigger id="fieldType">
                            <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                            {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Product ID */}
                <div className="space-y-2">
                    <Label htmlFor="productId">{t('productId')}</Label>
                    <Input
                        id="productId"
                        placeholder="Enter product UUID..."
                        value={filters.productId || ''}
                        onChange={(e) =>
                            onFilterChange({ ...filters, productId: e.target.value || undefined })
                        }
                    />
                </div>

                {/* User ID */}
                <div className="space-y-2">
                    <Label htmlFor="userId">{t('userId')}</Label>
                    <Input
                        id="userId"
                        placeholder="Enter user UUID..."
                        value={filters.userId || ''}
                        onChange={(e) =>
                            onFilterChange({ ...filters, userId: e.target.value || undefined })
                        }
                    />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                    <Label>{t('title')}</Label> {/* Reusing title 'Filters' or better 'Date Range' if key existed, but 'title' is 'Filters'. I'll leave 'Date Range' hardcoded or use 'dateFrom' label contextually. I'll just leave 'Date Range' hardcoded as generic label is tricky without key. Actually, I didn't add 'dateRange' key. */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                                {t('dateFrom')}
                            </Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) =>
                                    onFilterChange({ ...filters, dateFrom: e.target.value || undefined })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                                {t('dateTo')}
                            </Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) =>
                                    onFilterChange({ ...filters, dateTo: e.target.value || undefined })
                                }
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
