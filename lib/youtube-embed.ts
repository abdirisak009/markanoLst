/**
 * YouTube privacy-enhanced embed URL builder for LMS.
 * Uses youtube-nocookie.com and parameters to minimize branding and related videos.
 */

const YOUTUBE_NODOCOOKIE_ORIGIN = "https://www.youtube-nocookie.com"

export const YOUTUBE_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const

/**
 * Extract video ID from various YouTube URL formats.
 */
export function getYoutubeVideoId(url: string | null): string | null {
  if (!url) return null
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtu\.be\/)([^&\n?#]+)/
  )
  return m ? m[1] : null
}

/**
 * Check if URL is a YouTube URL.
 */
export function isYoutubeUrl(url: string | null): boolean {
  return !!(
    url &&
    (url.includes("youtube.com") || url.includes("youtube-nocookie.com") || url.includes("youtu.be"))
  )
}

export interface YoutubeEmbedParams {
  rel?: number
  modestbranding?: number
  controls?: number
  fs?: number
  disablekb?: number
  iv_load_policy?: number
  playsinline?: number
  enablejsapi?: number
  origin?: string
}

const DEFAULT_PARAMS: Required<Omit<YoutubeEmbedParams, "origin">> & { origin?: string } = {
  rel: 0,
  modestbranding: 1,
  controls: 1,
  fs: 1,
  disablekb: 1,
  iv_load_policy: 3,
  playsinline: 1,
  enablejsapi: 1,
}

/**
 * Build privacy-enhanced YouTube embed URL (youtube-nocookie.com) with LMS-friendly params.
 * - rel=0: no related videos at end
 * - modestbranding=1: reduce YouTube branding
 * - iv_load_policy=3: disable annotations
 * - enablejsapi=1: required for postMessage state events
 */
export function buildPrivacyEnhancedEmbedUrl(
  videoId: string,
  overrides: YoutubeEmbedParams = {}
): string {
  const params = { ...DEFAULT_PARAMS, ...overrides }
  if (typeof window !== "undefined" && !params.origin) {
    params.origin = window.location.origin
  }
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return `${YOUTUBE_NODOCOOKIE_ORIGIN}/embed/${videoId}${query ? `?${query}` : ""}`
}

export { YOUTUBE_NODOCOOKIE_ORIGIN }
