export type ScanMode = 'camera' | 'manual'

export interface BarcodeDetection {
  barcode: string
  format: string
  timestamp: number
}

export interface ScannerError {
  type: 'permission' | 'hardware' | 'resource' | 'compatibility' | 'detection'
  message: string
  originalError?: Error
}

export interface UseBarcodeScanner {
  isScanning: boolean
  error: string | null
  devices: MediaDeviceInfo[]
  selectedDeviceId: string | null
  startScanning: (videoElement: HTMLVideoElement) => Promise<void>
  stopScanning: () => void
  switchCamera: (deviceId: string) => void
}
