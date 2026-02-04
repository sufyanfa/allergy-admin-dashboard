'use client'

import { useEffect, useState } from 'react'
import { reportsApi, GroupReport } from '@/lib/api/reports'
import { groupsApi } from '@/lib/api/groups'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/hooks/use-translations'
import { toast } from 'sonner'
import { Eye, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export function ReportsList() {
    const [reports, setReports] = useState<GroupReport[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const t = useTranslations('groups')
    const tCommon = useTranslations('common')

    const fetchReports = async () => {
        try {
            setIsLoading(true)
            const response = await reportsApi.getReports()
            if (response.success && response.data) {
                setReports(response.data.reports)
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error)
            toast.error('Failed to load reports')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleDismiss = async (reportId: string) => {
        try {
            await reportsApi.dismissReport(reportId)
            toast.success('Report dismissed')
            setReports(reports.filter(r => r.id !== reportId))
        } catch (error) {
            toast.error('Failed to dismiss report')
        }
    }

    const handleDeleteContent = async (reportId: string, postId: string | null, commentId: string | null) => {
        if (!window.confirm('Are you sure you want to delete this content? This will also remove the report.')) {
            return
        }

        try {
            if (postId) {
                await groupsApi.deletePost(postId)
            } else if (commentId) {
                // Assuming deleteComment exists or use the same logic
                // If comment deletion is not in groupsApi, we might need to add it
                // For now let's assume posts for simplicity as per user request focus
                toast.error('Deleting comments via API not yet implemented in GroupsApi')
                return
            }
            toast.success('Content deleted')
            setReports(reports.filter(r => r.id !== reportId))
        } catch (error) {
            toast.error('Failed to delete content')
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center">{tCommon('loading')}</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Community Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Content Snippet</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No active reports
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <Badge variant={report.postId ? 'default' : 'secondary'}>
                                            {report.postId ? 'Post' : 'Comment'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="capitalize">{report.reason}</span>
                                    </TableCell>
                                    <TableCell>{report.reporterName}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {report.postId ? report.postTitle : report.commentContent}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(report.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDismiss(report.id)}
                                                title="Dismiss Report"
                                            >
                                                <CheckCircle className="h-4 w-4 text-success" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteContent(report.id, report.postId, report.commentId)}
                                                title="Delete Content"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
