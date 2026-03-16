'use client'

import { useState } from 'react'
import { BookOpen, AlertTriangle, Trophy, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/hooks/use-translations'
import { SensitivityTypesGuide } from './sensitivity-types-guide'
import { VotingPointsGuide } from './voting-points-guide'

type GuideSection = 'sensitivity' | 'voting' | null

export function GuidesOverview() {
  const [activeSection, setActiveSection] = useState<GuideSection>(null)
  const t = useTranslations('guides')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeSection === 'sensitivity' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveSection(activeSection === 'sensitivity' ? null : 'sensitivity')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {t('sensitivityTypes')}
              </div>
              {activeSection === 'sensitivity' ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{t('sensitivityDesc')}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{t('fda9')}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t('eu14')}</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{t('types15')}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{t('keywords345')}</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeSection === 'voting' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveSection(activeSection === 'voting' ? null : 'voting')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {t('votingPoints')}
              </div>
              {activeSection === 'voting' ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{t('votingDesc')}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{t('points')}</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{t('trustVoting')}</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{t('ranks')}</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{t('abuseDetection')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSection === 'sensitivity' && <SensitivityTypesGuide />}
      {activeSection === 'voting' && <VotingPointsGuide />}
    </div>
  )
}
