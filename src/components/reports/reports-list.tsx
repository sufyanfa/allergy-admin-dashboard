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
    const tCommon = useTranslations('common')
    const tReports = useTranslations('reports')

    const fetchReports = async () => {
        try {
            setIsLoading(true)
            const response = await reportsApi.getReports()
            if (response.success && response.data) {
                setReports(response.data.reports)
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error)
            toast.error(tReports('failedToLoad'))
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
            toast.success(tReports('reportDismissed'))
            setReports(reports.filter(r => r.id !== reportId))
        } catch (error) {
            toast.error(tReports('failedToDismiss'))
        }
    }

    const handleDeleteContent = async (reportId: string, postId: string | null, commentId: string | null) => {
        if (!window.confirm(tReports('confirmDelete'))) {
            return
        }

        try {
            if (postId) {
                await groupsApi.deletePost(postId)
            } else if (commentId) {
                await groupsApi.deleteComment(commentId)
            }
            toast.success(tReports('contentDeleted'))
            setReports(reports.filter(r => r.id !== reportId))
        } catch (error) {
            toast.error(tReports('failedToDelete'))
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
                    {tReports('communityReports')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{tReports('type')}</TableHead>
                            <TableHead>{tReports('reason')}</TableHead>
                            <TableHead>{tReports('reporter')}</TableHead>
                            <TableHead>{tReports('contentSnippet')}</TableHead>
                            <TableHead>{tReports('date')}</TableHead>
                            <TableHead className="text-right">{tReports('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {tReports('noReports')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <Badge variant={report.postId ? 'default' : 'secondary'}>
                                            {report.postId ? tReports('post') : tReports('comment')}
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
                                                title={tReports('dismissReport')}
                                            >
                                                <CheckCircle className="h-4 w-4 text-success" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteContent(report.id, report.postId, report.commentId)}
                                                title={tReports('deleteContent')}
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
