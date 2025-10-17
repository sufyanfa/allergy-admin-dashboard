'use client'

import { useState } from 'react'
import { Contribution, ContributionType } from '@/types'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ContributionsTableProps {
  contributions: Contribution[]
  isLoading?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onToggleAll?: (checked: boolean) => void
  onView?: (contribution: Contribution) => void
  onApprove?: (contribution: Contribution) => void
  onReject?: (contribution: Contribution) => void
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

export function ContributionsTable({
  contributions,
  isLoading,
  selectedIds = [],
  onToggleSelection,
  onToggleAll,
  onView,
  onApprove,
  onReject,
  onLoadMore,
  hasMore,
  className
}: ContributionsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' }
    }

    const { variant, label } = variants[status] || variants.pending
    return <Badge variant={variant}>{label}</Badge>
  }

  const getTypeBadge = (type: ContributionType) => {
    const types: Record<ContributionType, { color: string, label: string }> = {
      new_product: { color: 'bg-blue-100 text-blue-800', label: 'New Product' },
      edit_ingredients: { color: 'bg-purple-100 text-purple-800', label: 'Edit Ingredients' },
      add_image: { color: 'bg-green-100 text-green-800', label: 'Add Image' },
      report_error: { color: 'bg-orange-100 text-orange-800', label: 'Report Error' }
    }

    const { color, label } = types[type] || types.new_product
    return <Badge className={color}>{label}</Badge>
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500'
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleAction = async (action: () => Promise<void>, id: string) => {
    setLoadingId(id)
    try {
      await action()
    } finally {
      setLoadingId(null)
    }
  }

  const allSelected = contributions.length > 0 && contributions.every(c => selectedIds.includes(c.id))
  const someSelected = contributions.some(c => selectedIds.includes(c.id)) && !allSelected

  if (contributions.length === 0 && !isLoading) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No contributions found</h3>
          <p className="text-sm text-muted-foreground">
            There are no contributions matching your criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onToggleAll && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={onToggleAll}
                  />
                </TableHead>
              )}
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Product Info</TableHead>
              <TableHead>AI Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && contributions.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={onToggleAll ? 8 : 7}>
                    <div className="flex items-center space-x-4">
                      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                      <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              contributions.map((contribution) => (
                <TableRow key={contribution.id}>
                  {onToggleSelection && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(contribution.id)}
                        onCheckedChange={() => onToggleSelection(contribution.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{getTypeBadge(contribution.contributionType)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{contribution.user?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">@{contribution.user?.username || 'unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contribution.contributionType === 'new_product' ? (
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {contribution.contributionData?.productNameAr || 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {contribution.contributionData?.brandAr || 'N/A'} • {contribution.contributionData?.barcode || 'N/A'}
                        </span>
                      </div>
                    ) : contribution.product ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{contribution.product.nameAr}</span>
                        <span className="text-xs text-muted-foreground">{contribution.product.barcode}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No product</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {contribution.contributionData?.aiConfidence ? (
                      <span className={cn('font-semibold', getConfidenceColor(contribution.contributionData.aiConfidence))}>
                        {contribution.contributionData.aiConfidence}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(contribution.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(contribution)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {contribution.status === 'pending' && (
                          <>
                            {onApprove && (
                              <DropdownMenuItem
                                onClick={() => handleAction(() => onApprove(contribution), contribution.id)}
                                disabled={loadingId === contribution.id}
                              >
                                {loadingId === contribution.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Approve
                              </DropdownMenuItem>
                            )}
                            {onReject && (
                              <DropdownMenuItem
                                onClick={() => handleAction(() => onReject(contribution), contribution.id)}
                                disabled={loadingId === contribution.id}
                              >
                                {loadingId === contribution.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Reject
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
