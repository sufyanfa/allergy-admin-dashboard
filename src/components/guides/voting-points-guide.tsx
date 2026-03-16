'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Trophy, Shield, AlertTriangle, Users, Zap, Scale, Eye, Ban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/hooks/use-translations'

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <Card>
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent className="border-t pt-4">{children}</CardContent>}
    </Card>
  )
}

export function VotingPointsGuide() {
  const t = useTranslations('guides')

  return (
    <div className="space-y-4">
      <Section title={t('pointsSystem')} icon={Trophy} defaultOpen>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('pointsAwarded')}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-start py-2 pr-4 font-medium">{t('action')}</th>
                    <th className="text-start py-2 pr-4 font-medium">{t('pointsCol')}</th>
                    <th className="text-start py-2 font-medium">{t('whenItHappens')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-green-50 text-green-700 px-1.5 rounded">CONTRIBUTION_CREATED</code></td>
                    <td className="py-2 pr-4 font-mono text-green-600">+10</td>
                    <td className="py-2 text-muted-foreground">{t('contributionCreated')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-green-50 text-green-700 px-1.5 rounded">CONTRIBUTION_APPROVED</code></td>
                    <td className="py-2 pr-4 font-mono text-green-600">+5</td>
                    <td className="py-2 text-muted-foreground">{t('contributionApproved')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-green-50 text-green-700 px-1.5 rounded">EXPERIENCE_CREATED</code></td>
                    <td className="py-2 pr-4 font-mono text-green-600">+5</td>
                    <td className="py-2 text-muted-foreground">{t('experienceCreated')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-green-50 text-green-700 px-1.5 rounded">EXPERIENCE_VOTE</code></td>
                    <td className="py-2 pr-4 font-mono text-green-600">+2</td>
                    <td className="py-2 text-muted-foreground">{t('experienceVote')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-blue-50 text-blue-700 px-1.5 rounded">ADMIN_ADJUSTMENT</code></td>
                    <td className="py-2 pr-4 font-mono text-blue-600">{t('variable')}</td>
                    <td className="py-2 text-muted-foreground">{t('adminAdjustment')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-purple-50 text-purple-700 px-1.5 rounded">BONUS_REWARD</code></td>
                    <td className="py-2 pr-4 font-mono text-purple-600">{t('variable')}</td>
                    <td className="py-2 text-muted-foreground">{t('bonusReward')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('pointsDeducted')}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b"><th className="text-start py-2 pr-4 font-medium">{t('action')}</th><th className="text-start py-2 pr-4 font-medium">{t('pointsCol')}</th><th className="text-start py-2 font-medium">{t('whenItHappens')}</th></tr></thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-red-50 text-red-700 px-1.5 rounded">CONTRIBUTION_REJECTED</code></td>
                    <td className="py-2 pr-4 font-mono text-red-600">-10</td>
                    <td className="py-2 text-muted-foreground">{t('contributionRejected')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-xs bg-red-50 text-red-700 px-1.5 rounded">EXPERIENCE_DELETED</code></td>
                    <td className="py-2 pr-4 font-mono text-red-600">-5</td>
                    <td className="py-2 text-muted-foreground">{t('experienceDeleted')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('pointsFloor')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('levelsBadges')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>{t('levelFormula')}</strong> <code className="bg-muted px-1 rounded">level = 1 + floor(totalPoints / 500)</code></li>
              <li>{t('levelExample')}</li>
              <li>{t('badgeUnlock')}</li>
              <li>{t('badgeOnce')}</li>
              <li>{t('badgeCategories')}</li>
            </ul>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">{t('exampleFlow')}</h4>
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>{t('flow1')} <span className="text-green-600 font-medium">+10</span></li>
              <li>{t('flow2')} <span className="text-green-600 font-medium">+5</span></li>
              <li>{t('flow3')} <span className="text-green-600 font-medium">+5</span></li>
              <li>{t('flow4')} <span className="text-green-600 font-medium">+6 (3 × 2)</span></li>
              <li>{t('flow5')} <span className="text-purple-600 font-medium">+5</span></li>
              <li><strong>{t('flowTotal')}</strong></li>
            </ol>
          </div>
        </div>
      </Section>

      <Section title={t('productFieldVoting')} icon={Shield}>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">{t('votingIntro')}</p>
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('voteTypes')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="font-medium text-sm">{t('approve')}</span></div><p className="text-xs text-muted-foreground">{t('approveDesc')}</p></div>
              <div className="border rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="font-medium text-sm">{t('reject')}</span></div><p className="text-xs text-muted-foreground">{t('rejectDesc')}</p></div>
              <div className="border rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="font-medium text-sm">{t('flag')}</span></div><p className="text-xs text-muted-foreground">{t('flagDesc')}</p></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('votableFields')}</h4>
            <div className="flex flex-wrap gap-2">
              {['ingredients_ar', 'ingredients_en', 'allergens', 'nutrition_facts', 'product_name', 'brand_info', 'overall'].map(f => (
                <code key={f} className="text-xs bg-muted px-2 py-0.5 rounded">{f}</code>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('voteWeightCalc')}</h4>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-1">
              <p>vote_weight = base_rank_weight × accuracy_modifier</p>
              <p className="text-xs mt-2">accuracy_modifier = (user.accuracyRate / 100) × 1.5</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('voteLimits')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('dailyCap')}</li><li>{t('monthlyCap')}</li><li>{t('timingAbuse')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('timeDecay')}</h4>
            <p className="text-sm text-muted-foreground">{t('timeDecayDesc')} <code className="bg-muted px-1 rounded">effective_weight = original_weight × (0.95 ^ months_passed)</code></p>
            <p className="text-xs text-muted-foreground mt-1">{t('timeDecayFloor')}</p>
          </div>
        </div>
      </Section>

      <Section title={t('userTrustRanks')} icon={Users}>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="border-b"><th className="text-start py-2 pr-4 font-medium">{t('rank')}</th><th className="text-start py-2 pr-4 font-medium">{t('weight')}</th><th className="text-start py-2 pr-4 font-medium">{t('requirement')}</th><th className="text-start py-2 font-medium">{t('description')}</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="py-2 pr-4"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{t('explorer')}</span></td><td className="py-2 pr-4 font-mono">1.0×</td><td className="py-2 pr-4">{t('explorerReq')}</td><td className="py-2 text-muted-foreground">{t('explorerDesc')}</td></tr>
                <tr><td className="py-2 pr-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{t('verifier')}</span></td><td className="py-2 pr-4 font-mono">3.0×</td><td className="py-2 pr-4">{t('verifierReq')}</td><td className="py-2 text-muted-foreground">{t('verifierDesc')}</td></tr>
                <tr><td className="py-2 pr-4"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">{t('guardian')}</span></td><td className="py-2 pr-4 font-mono">7.0×</td><td className="py-2 pr-4">{t('guardianReq')}</td><td className="py-2 text-muted-foreground">{t('guardianDesc')}</td></tr>
                <tr><td className="py-2 pr-4"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">{t('expert')}</span></td><td className="py-2 pr-4 font-mono">10.0×</td><td className="py-2 pr-4">{t('expertReq')}</td><td className="py-2 text-muted-foreground">{t('expertDesc')}</td></tr>
                <tr><td className="py-2 pr-4"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">{t('admin')}</span></td><td className="py-2 pr-4 font-mono">10.0×</td><td className="py-2 pr-4">{t('adminReq')}</td><td className="py-2 text-muted-foreground">{t('adminDesc')}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('accuracyRate')}</h4>
            <p className="text-sm text-muted-foreground">{t('accuracyDesc')}</p>
          </div>
        </div>
      </Section>

      <Section title={t('productVerification')} icon={Scale}>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('trustScoreCalc')}</h4>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm"><p>trust_score = sum(approve_weights) - sum(reject_weights)</p></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('verificationStatuses')}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b"><th className="text-start py-2 pr-4 font-medium">{t('status')}</th><th className="text-start py-2 font-medium">{t('triggerCondition')}</th></tr></thead>
                <tbody className="divide-y">
                  <tr><td className="py-2 pr-4"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{t('unverified')}</span></td><td className="py-2 text-muted-foreground">{t('unverifiedCond')}</td></tr>
                  <tr><td className="py-2 pr-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{t('communityVerified')}</span></td><td className="py-2 text-muted-foreground">{t('communityVerifiedCond')}</td></tr>
                  <tr><td className="py-2 pr-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{t('expertVerified')}</span></td><td className="py-2 text-muted-foreground">{t('expertVerifiedCond')}</td></tr>
                  <tr><td className="py-2 pr-4"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{t('flagged')}</span></td><td className="py-2 text-muted-foreground">{t('flaggedCond')}</td></tr>
                  <tr><td className="py-2 pr-4"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">{t('contested')}</span></td><td className="py-2 text-muted-foreground">{t('contestedCond')}</td></tr>
                  <tr><td className="py-2 pr-4"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">{t('underReview')}</span></td><td className="py-2 text-muted-foreground">{t('underReviewCond')}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />{t('allergenStricter')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('allergenMin3')}</li><li>{t('allergenVerifier')}</li><li>{t('allergenScore25')}</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">{t('allergenStricterNote')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('communityApprovalFlow')}</h4>
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>{t('approvalStep1')}</li><li>{t('approvalStep2')}</li><li>{t('approvalStep3')}</li><li>{t('approvalStep4')}</li><li>{t('approvalStep5')}</li><li>{t('approvalStep6')}</li>
            </ol>
          </div>
        </div>
      </Section>

      <Section title={t('adminOverrides')} icon={Shield}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('adminVote')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('adminVoteWeight')}</li><li>{t('adminVoteDocs')}</li><li>{t('adminVoteAudit')}</li><li>{t('adminVoteLegal')}</li><li>{t('adminVotePublic')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('fieldFreezing')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('freezeDesc1')}</li><li>{t('freezeDesc2')}</li><li>{t('freezeDesc3')}</li><li>{t('freezeDesc4')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('pointsAdjustment')}</h4>
            <p className="text-sm text-muted-foreground">{t('pointsAdjustDesc')}</p>
          </div>
        </div>
      </Section>

      <Section title={t('abuseDetectionTitle')} icon={Ban}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('abuseIntro')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="border-b"><th className="text-start py-2 pr-4 font-medium">{t('pattern')}</th><th className="text-start py-2 pr-4 font-medium">{t('detectionRule')}</th><th className="text-start py-2 pr-4 font-medium">{t('severityCol')}</th><th className="text-start py-2 font-medium">{t('actionCol')}</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="py-2 pr-4 font-medium">{t('rapidFire')}</td><td className="py-2 pr-4 text-muted-foreground">{t('rapidFireRule')}</td><td className="py-2 pr-4"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">60</span></td><td className="py-2 text-muted-foreground">{t('monitor')}</td></tr>
                <tr><td className="py-2 pr-4 font-medium">{t('brandBias')}</td><td className="py-2 pr-4 text-muted-foreground">{t('brandBiasRule')}</td><td className="py-2 pr-4"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">80</span></td><td className="py-2 text-muted-foreground">{t('manualReview')}</td></tr>
                <tr><td className="py-2 pr-4 font-medium">{t('newAccount')}</td><td className="py-2 pr-4 text-muted-foreground">{t('newAccountRule')}</td><td className="py-2 pr-4"><span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">70</span></td><td className="py-2 text-muted-foreground">{t('manualReview')}</td></tr>
                <tr><td className="py-2 pr-4 font-medium">{t('impossibleTiming')}</td><td className="py-2 pr-4 text-muted-foreground">{t('impossibleTimingRule')}</td><td className="py-2 pr-4"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">90</span></td><td className="py-2 text-muted-foreground">{t('manualReview')}</td></tr>
                <tr><td className="py-2 pr-4 font-medium">{t('coordinatedVoting')}</td><td className="py-2 pr-4 text-muted-foreground">{t('coordinatedVotingRule')}</td><td className="py-2 pr-4"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">95</span></td><td className="py-2 text-muted-foreground">{t('manualReview')}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('autoActionThresholds')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded-lg p-3 bg-red-50"><p className="font-medium text-sm text-red-700">{t('severity150')}</p><p className="text-xs text-red-600 mt-1">{t('severity150Action')}</p></div>
              <div className="border rounded-lg p-3 bg-amber-50"><p className="font-medium text-sm text-amber-700">{t('severity100')}</p><p className="text-xs text-amber-600 mt-1">{t('severity100Action')}</p></div>
              <div className="border rounded-lg p-3 bg-yellow-50"><p className="font-medium text-sm text-yellow-700">{t('severity50')}</p><p className="text-xs text-yellow-600 mt-1">{t('severity50Action')}</p></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('flaggedWeightReduction')}</p>
          </div>
        </div>
      </Section>

      <Section title={t('experienceVoting')} icon={Zap}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('experienceVotingIntro')}</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t('expVote1')}</li><li>{t('expVote2')}</li><li>{t('expVote3')}</li><li>{t('expVote4')}</li><li>{t('expVote5')}</li>
          </ul>
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">{t('keyDifference')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p className="font-medium">{t('productFieldVotingLabel')}</p><ul className="text-muted-foreground space-y-0.5 list-disc list-inside text-xs mt-1"><li>{t('prodVote1')}</li><li>{t('prodVote2')}</li><li>{t('prodVote3')}</li><li>{t('prodVote4')}</li></ul></div>
              <div><p className="font-medium">{t('experienceVotingLabel')}</p><ul className="text-muted-foreground space-y-0.5 list-disc list-inside text-xs mt-1"><li>{t('expVoteComp1')}</li><li>{t('expVoteComp2')}</li><li>{t('expVoteComp3')}</li><li>{t('expVoteComp4')}</li></ul></div>
            </div>
          </div>
        </div>
      </Section>

      <Section title={t('auditTrail')} icon={Eye}>
        <div className="space-y-4">
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>{t('audit1')}</li><li>{t('audit2')}</li><li>{t('audit3')}</li><li>{t('audit4')}</li><li>{t('audit5')}</li>
          </ul>
          <div>
            <h4 className="text-sm font-semibold mb-2">{t('trustEventTypes')}</h4>
            <div className="flex flex-wrap gap-1">
              {['vote_cast', 'vote_updated', 'vote_removed', 'decay_applied', 'admin_override', 'admin_freeze', 'threshold_crossed', 'conflict_detected', 'conflict_resolved'].map(e => (
                <code key={e} className="text-xs bg-muted px-1.5 py-0.5 rounded">{e}</code>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
