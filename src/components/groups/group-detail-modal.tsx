'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Group, GroupPost } from '@/types/groups'
import { groupsApi } from '@/lib/api/groups'
import { useTranslations } from '@/lib/hooks/use-translations'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, ThumbsUp } from 'lucide-react'

interface GroupDetailModalProps {
    group: Group | null
    isOpen: boolean
    onClose: () => void
}

export function GroupDetailModal({ group, isOpen, onClose }: GroupDetailModalProps) {
    const t = useTranslations('groups')
    const [posts, setPosts] = useState<GroupPost[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && group) {
            loadPosts()
        }
    }, [isOpen, group])

    const loadPosts = async () => {
        if (!group) return
        setIsLoading(true)
        try {
            const data = await groupsApi.getGroupPosts(group.id)
            // Expecting data.posts. posts logic depends on what getGroupPosts returns.
            // In API updated: returns response.data.
            // If backend returns { posts: [] }, then data.posts.
            // Let's assume standard pagination response or list.
            // Checking backend handlers: getGroupPosts returns { posts, pagination }.
            setPosts(data.posts || [])
        } catch (error) {
            console.error('Failed to load posts', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!group) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {group.nameEn}
                        <span className="text-sm font-normal text-muted-foreground">({group.nameAr})</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{group.postCount} {t('postCount')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{group.participantCount} {t('participants')}</span>
                    </div>
                </div>

                <div className="py-2">
                    <h4 className="font-semibold mb-1">{t('description')}</h4>
                    <p className="text-sm text-muted-foreground">{group.descriptionEn}</p>
                    <p className="text-sm text-muted-foreground mt-1 text-right" dir="rtl">{group.descriptionAr}</p>
                </div>

                <div className="flex-1 min-h-0 pt-2 border-t">
                    <h4 className="font-semibold mb-2">Recent Posts</h4>
                    <div className="h-[300px] pr-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                Loading posts...
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="border rounded-lg p-3 hover:bg-muted/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={post.authorAvatar || ''} />
                                                <AvatarFallback>{(post.authorName || 'U')[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">{post.authorName}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <h5 className="font-semibold text-sm mb-1">{post.title}</h5>
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{post.content}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" /> {post.commentCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" /> {post.helpfulCount}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No posts found in this group.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
