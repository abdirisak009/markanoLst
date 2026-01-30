import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEVICE_ID_KEY = 'markano_device_id'

/** Get or create a stable device id for this browser (used for 2-device limit). */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `d_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

/** Store device_id from login response so next login uses same id. */
export function setDeviceIdFromServer(id: string | undefined): void {
  if (typeof window === 'undefined' || !id) return
  localStorage.setItem(DEVICE_ID_KEY, id)
}

/** Resolve image URL for display: /uploads/ -> /api/uploads/, http -> /api/image?url= */
export function getImageSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('/uploads/')) return `/api${url}`
  if (url.startsWith('http://') || url.startsWith('https://')) return `/api/image?url=${encodeURIComponent(url)}`
  return url
}
