'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScanLine, Camera, Keyboard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useProductsStore } from '@/lib/stores/products-store'
import { toast } from 'sonner'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual')
  const [manualBarcode, setManualBarcode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<{
    found: boolean
    product?: {
      nameAr: string
      brandAr: string
      category: string
    }
    message: string
  } | null>(null)

  const { fetchProductByBarcode } = useProductsStore()

  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Please enter a barcode')
      return
    }

    setIsSearching(true)
    setSearchResult(null)

    try {
      const product = await fetchProductByBarcode(manualBarcode.trim())
      setSearchResult({
        found: true,
        product,
        message: `Product found: ${product.nameAr}`
      })

      // Auto-trigger scan callback after a brief delay to show result
      setTimeout(() => {
        onScan(manualBarcode.trim())
        onClose()
      }, 1500)
    } catch {
      setSearchResult({
        found: false,
        message: 'Product not found in database'
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit()
    }
  }

  const handleCameraMode = () => {
    // For now, show a message about camera functionality
    toast.info('Camera scanning will be available in a future update. Please use manual entry for now.')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ScanLine className="h-5 w-5 mr-2" />
            Barcode Scanner
          </DialogTitle>
          <DialogDescription>
            Scan or enter a barcode to search for products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex space-x-2">
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              onClick={handleCameraMode}
              className="flex-1"
              disabled
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
              <Badge variant="secondary" className="ml-2 text-xs">
                Soon
              </Badge>
            </Button>
          </div>

          {/* Manual Entry Mode */}
          {scanMode === 'manual' && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Enter Barcode
                    </label>
                    <div className="mt-1">
                      <Input
                        placeholder="Scan or type barcode here..."
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        disabled={isSearching}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports UPC, EAN, Code 128, and other standard formats
                    </p>
                  </div>

                  {/* Search Result */}
                  {searchResult && (
                    <div className={`p-3 rounded-lg border ${
                      searchResult.found
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center">
                        {searchResult.found ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                        )}
                        <span className={`text-sm ${
                          searchResult.found ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {searchResult.message}
                        </span>
                      </div>
                      {searchResult.product && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Brand: {searchResult.product.brandAr} |
                          Category: {searchResult.product.category}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleManualSubmit}
                      disabled={!manualBarcode.trim() || isSearching}
                      className="flex-1"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <ScanLine className="h-4 w-4 mr-2" />
                          Search Product
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera Mode (Future Implementation) */}
          {scanMode === 'camera' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Camera Scanning</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Camera-based barcode scanning will be available in a future update.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For now, please use manual entry or switch to manual mode.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Scanning Tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Make sure the barcode is clearly visible and well-lit</li>
              <li>• Try different angles if the scan does not work initially</li>
              <li>• For damaged barcodes, try manual entry</li>
              <li>• Most product barcodes are 12-13 digits long</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}