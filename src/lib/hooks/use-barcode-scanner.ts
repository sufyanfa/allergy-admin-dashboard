import { useEffect, useState, useCallback, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { UseBarcodeScanner } from '@/types/barcode-scanner'

/**
 * Custom hook for managing barcode scanner state and camera access
 *
 * @param onDetected - Callback function when a barcode is detected
 * @returns Scanner state and control methods
 *
 * @example
 * ```tsx
 * const scanner = useBarcodeScanner((barcode) => {
 *   console.log('Detected:', barcode)
 * })
 *
 * useEffect(() => {
 *   if (videoRef) {
 *     scanner.startScanning(videoRef)
 *   }
 * }, [videoRef])
 * ```
 */
export function useBarcodeScanner(
  onDetected: (barcode: string) => void
): UseBarcodeScanner {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<any>(null)

  // Initialize code reader on mount
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader()

    return () => {
      stopScanning()
    }
  }, [])

  // List video devices
  const listDevices = useCallback(async () => {
    try {
      const videoDevices = await BrowserMultiFormatReader.listVideoInputDevices()
      setDevices(videoDevices || [])

      // Auto-select first device if none selected
      if (!selectedDeviceId && videoDevices && videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId)
      }
    } catch {
      setError('Failed to list camera devices')
    }
  }, [selectedDeviceId])

  // Start scanning
  const startScanning = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!codeReaderRef.current || !videoElement) return

    setError(null)
    setIsScanning(true)

    try {
      // Request camera permission and list devices
      await listDevices()

      const deviceId = selectedDeviceId || undefined

      // Start continuous scanning
      controlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoElement,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText()
            onDetected(barcodeText)
          }
          // Don't set error for decode failures, only actual errors
          if (error && error.name !== 'NotFoundException') {
            setError(error.message)
          }
        }
      )
    } catch (err: any) {
      setIsScanning(false)

      // Handle specific error types
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.')
      } else {
        setError('Failed to start camera. Please try again.')
      }
    }
  }, [selectedDeviceId, onDetected, listDevices])

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }
    setIsScanning(false)
  }, [])

  // Switch camera
  const switchCamera = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId)
  }, [])

  return {
    isScanning,
    error,
    devices,
    selectedDeviceId,
    startScanning,
    stopScanning,
    switchCamera,
  }
}
