'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { useBarcodeScanner } from '@/lib/hooks/use-barcode-scanner'

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
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  const { fetchProductByBarcode } = useProductsStore()

  // Barcode detection handler
  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    // Stop scanning to prevent multiple detections
    stopScanning()

    // Show loading state
    setIsSearching(true)
    setSearchResult(null)

    try {
      const product = await fetchProductByBarcode(barcode)

      setSearchResult({
        found: true,
        product,
        message: `Product found: ${product.nameAr}`
      })

      toast.success(`Barcode detected: ${barcode}`)

      // Auto-trigger scan callback after a brief delay
      setTimeout(() => {
        onScan(barcode)
        onClose()
      }, 1500)
    } catch {
      setSearchResult({
        found: false,
        message: 'Product not found in database'
      })

      toast.error('Product not found')

      // Restart scanning to try again
      if (videoRef) {
        setTimeout(() => startScanning(videoRef), 2000)
      }
    } finally {
      setIsSearching(false)
    }
  }, [fetchProductByBarcode, onScan, onClose, videoRef])

  // Initialize barcode scanner hook
  const {
    isScanning,
    error: scanError,
    devices,
    selectedDeviceId,
    startScanning,
    stopScanning,
    switchCamera,
  } = useBarcodeScanner(handleBarcodeDetected)

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
    setScanMode('camera')
  }

  // Camera lifecycle: Start scanning when switching to camera mode
  useEffect(() => {
    if (scanMode === 'camera' && videoRef && !isScanning) {
      startScanning(videoRef)
    }

    return () => {
      if (scanMode !== 'camera') {
        stopScanning()
      }
    }
  }, [scanMode, videoRef, isScanning, startScanning, stopScanning])

  // Cleanup on dialog close
  useEffect(() => {
    if (!open) {
      stopScanning()
      setSearchResult(null)
      setManualBarcode('')
      setScanMode('manual')
    }
  }, [open, stopScanning])

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
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
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

          {/* Camera Mode */}
          {scanMode === 'camera' && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Video Preview */}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={setVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                      aria-label="Camera preview for barcode scanning"
                    />

                    {/* Scanning Overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-green-500 rounded-lg w-3/4 h-1/2 animate-pulse" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {isScanning ? (
                        <Badge className="bg-green-500">
                          <ScanLine className="h-3 w-3 mr-1 animate-pulse" />
                          Scanning...
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Camera className="h-3 w-3 mr-1" />
                          Camera Ready
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Error Display */}
                  {scanError && (
                    <div className="p-3 rounded-lg border bg-red-50 border-red-200">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-700">{scanError}</span>
                      </div>
                    </div>
                  )}

                  {/* Camera Selection (if multiple cameras) */}
                  {devices.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Camera:</label>
                      <select
                        className="flex-1 text-sm border rounded px-2 py-1"
                        value={selectedDeviceId || ''}
                        onChange={(e) => switchCamera(e.target.value)}
                        disabled={isScanning}
                      >
                        {devices.map((device, index) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        stopScanning()
                        setScanMode('manual')
                      }}
                      className="flex-1"
                    >
                      Switch to Manual
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}