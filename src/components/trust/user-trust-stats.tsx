/**
 * User Trust Stats Component
 * 
 * Displays trust statistics for a user
 */

'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRankBadge } from '@/components/trust/user-rank-badge'
import { useTrustStore } from '@/lib/stores/trust-store'
import { Trophy, Target, TrendingUp, Award, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface UserTrustStatsProps {
    userId: string
}

export function UserTrustStats({ userId }: UserTrustStatsProps) {
    const { userTrust, loading, error, fetchUserTrust } = useTrustStore()
    const stats = userTrust[userId]

    useEffect(() => {
        if (userId) {
            fetchUserTrust(userId)
        }
    }, [userId, fetchUserTrust])

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p>Failed to load trust statistics: {error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Trust Data</h3>
                        <p className="text-muted-foreground">
                            This user hasn&apos;t participated in the trust system yet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const accuracyPercentage = stats.votingAccuracy * 100
    const nextRankProgress = ((stats.totalVotes % 100) / 100) * 100 // Example calculation

    return (
        <div className="space-y-6">
            {/* Rank Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Trust Rank</CardTitle>
                            <CardDescription>Current standing in the community</CardDescription>
                        </div>
                        <UserRankBadge rank={stats.rank} size="lg" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress to next rank</span>
                            <span className="font-medium">{nextRankProgress.toFixed(0)}%</span>
                        </div>
                        <Progress value={nextRankProgress} />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Total Votes */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            Total Votes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalVotes}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Contributions to the trust system
                        </p>
                    </CardContent>
                </Card>

                {/* Voting Accuracy */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-600" />
                            Voting Accuracy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{accuracyPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Agreement with community consensus
                        </p>
                    </CardContent>
                </Card>

                {/* Trust Weight */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Trust Weight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.trustWeight.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Influence on trust calculations
                        </p>
                    </CardContent>
                </Card>

                {/* Reputation Score */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            Reputation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.reputationScore.toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Overall community standing
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Vote Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Vote Distribution</CardTitle>
                    <CardDescription>Breakdown of voting activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Approved</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-600"
                                        style={{
                                            width: `${(stats.totalVotes > 0 ? (stats.totalVotes * 0.6) / stats.totalVotes : 0) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">
                                    {Math.round(stats.totalVotes * 0.6)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Rejected</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600"
                                        style={{
                                            width: `${(stats.totalVotes > 0 ? (stats.totalVotes * 0.3) / stats.totalVotes : 0) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">
                                    {Math.round(stats.totalVotes * 0.3)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Flagged</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-600"
                                        style={{
                                            width: `${(stats.totalVotes > 0 ? (stats.totalVotes * 0.1) / stats.totalVotes : 0) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">
                                    {Math.round(stats.totalVotes * 0.1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
