'use client'

import { useState } from 'react'
import { AllergyForm } from '@/components/forms/allergy-form'
import { useAllergiesStore } from '@/lib/stores/allergies-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Allergy } from '@/types'
import { toast } from 'sonner'

export function AllergyFormTest() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null)

  const {
    allergies,
    overview,
    isLoading,
    error,
    createAllergy,
    updateAllergy,
    fetchAllergiesOverview,
    setCurrentAllergy
  } = useAllergiesStore()

  const handleCreateAllergy = () => {
    setSelectedAllergy(null)
    setCurrentAllergy(null)
    setIsFormOpen(true)
  }

  const handleEditAllergy = (allergy: Allergy) => {
    setSelectedAllergy(allergy)
    setCurrentAllergy(allergy)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: Partial<Allergy>) => {
    try {
      if (selectedAllergy) {
        await updateAllergy(selectedAllergy.id, data)
        toast.success('Allergy updated successfully!')
      } else {
        // Ensure required fields for creation
        if (!data.nameAr) {
          toast.error('Arabic name is required')
          return
        }
        const allergyData = {
          nameAr: data.nameAr,
          nameEn: data.nameEn || '',
          descriptionAr: data.descriptionAr || '',
          descriptionEn: data.descriptionEn || '',
          severity: data.severity || 'mild' as const,
          isActive: data.isActive ?? true
        }
        await createAllergy(allergyData)
        toast.success('Allergy created successfully!')
      }
      setIsFormOpen(false)
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to save allergy')
    }
  }

  const handleRefresh = async () => {
    try {
      await fetchAllergiesOverview()
      toast.success('Data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Allergy Form Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleCreateAllergy}>
              Create New Allergy
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              Refresh Data
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              Error: {error}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Overview</h3>
            {overview && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Total: {overview.totalAllergies}</div>
                <div>Active: {overview.activeAllergies}</div>
                <div>Mild: {overview.severityDistribution.mild}</div>
                <div>Moderate: {overview.severityDistribution.moderate}</div>
                <div>Severe: {overview.severityDistribution.severe}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Allergies List</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold">{allergy.nameAr} ({allergy.nameEn})</div>
                    <div className="text-sm text-gray-600">
                      Severity: {allergy.severity} | Active: {allergy.isActive ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAllergy(allergy)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AllergyForm
        allergy={selectedAllergy}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={isLoading}
      />
    </div>
  )
}