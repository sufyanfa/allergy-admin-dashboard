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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
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
    const [selectedReport, setSelectedReport] = useState<GroupReport | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
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
            setReports(
                reports.map(r =>
                    r.id === reportId
                        ? { ...r, status: 'dismissed', dismissedAt: new Date().toISOString() }
                        : r
                ).sort((a, b) => {
                    const aOrder = (a.status || 'pending') === 'pending' ? 0 : 1
                    const bOrder = (b.status || 'pending') === 'pending' ? 0 : 1
                    return aOrder - bOrder
                })
            )
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

    const handleViewDetails = (report: GroupReport) => {
        setSelectedReport(report)
        setIsDetailOpen(true)
    }

    if (isLoading) {
        return <div className="p-8 text-center">{tCommon('loading')}</div>
    }

    return (
        <>
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
                                <TableHead>{tReports('status')}</TableHead>
                                <TableHead>{tReports('reason')}</TableHead>
                                <TableHead>{tReports('reporter')}</TableHead>
                                <TableHead>{tReports('contentSnippet')}</TableHead>
                                <TableHead>{tReports('date')}</TableHead>
                                <TableHead className="text-end">{tReports('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {tReports('noReports')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report.id} className={(report.status || 'pending') === 'dismissed' ? 'opacity-50' : ''}>
                                        <TableCell>
                                            <Badge variant={report.postId ? 'default' : 'secondary'}>
                                                {report.postId ? tReports('post') : tReports('comment')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={(report.status || 'pending') === 'pending' ? 'default' : 'secondary'} className={(report.status || 'pending') === 'pending' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}>
                                                {tReports(`statuses.${report.status || 'pending'}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span>{tReports(`reasons.${report.reason}`)}</span>
                                        </TableCell>
                                        <TableCell>{report.reporterName}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">
                                            {report.postId ? report.postTitle : report.commentContent}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(report.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(report)}
                                                    title={tReports('viewDetails')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDismiss(report.id)}
                                                    title={tReports('dismissReport')}
                                                    disabled={(report.status || 'pending') === 'dismissed'}
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

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{tReports('reportDetails')}</DialogTitle>
                        <DialogDescription>{tReports('reportDetailsDescription')}</DialogDescription>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('type')}</p>
                                    <Badge variant={selectedReport.postId ? 'default' : 'secondary'} className="mt-1">
                                        {selectedReport.postId ? tReports('post') : tReports('comment')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('status')}</p>
                                    <Badge
                                        variant={(selectedReport.status || 'pending') === 'pending' ? 'default' : 'secondary'}
                                        className={`mt-1 ${(selectedReport.status || 'pending') === 'pending' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                                    >
                                        {tReports(`statuses.${selectedReport.status || 'pending'}`)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('reason')}</p>
                                    <p className="mt-1 font-medium">{tReports(`reasons.${selectedReport.reason}`)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('date')}</p>
                                    <p className="mt-1 font-medium">{format(new Date(selectedReport.createdAt), 'MMM d, yyyy HH:mm')}</p>
                                </div>
                            </div>

                            {selectedReport.dismissedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('dismissedAt')}</p>
                                    <p className="mt-1 font-medium">{format(new Date(selectedReport.dismissedAt), 'MMM d, yyyy HH:mm')}</p>
                                </div>
                            )}

                            {selectedReport.details && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('reason')}</p>
                                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{selectedReport.details}</p>
                                </div>
                            )}

                            <hr />

                            <div>
                                <p className="text-sm font-semibold mb-2">{tReports('reporterDetails')}</p>
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('reporter')}</p>
                                    <p className="mt-1 font-medium">{selectedReport.reporterName}</p>
                                </div>
                            </div>

                            <hr />

                            {selectedReport.postId && (
                                <div className="space-y-3">
                                    {selectedReport.postTitle && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{tReports('postTitle')}</p>
                                            <p className="mt-1 font-medium">{selectedReport.postTitle}</p>
                                        </div>
                                    )}
                                    {selectedReport.postContent && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{tReports('postContent')}</p>
                                            <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{selectedReport.postContent}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedReport.commentId && selectedReport.commentContent && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{tReports('commentContent')}</p>
                                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{selectedReport.commentContent}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
