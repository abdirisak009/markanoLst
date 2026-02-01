"use client"

import { Play } from "lucide-react"
import { getYoutubeVideoId, isYoutubeUrl, buildPrivacyEnhancedEmbedUrl } from "@/lib/youtube-embed"

/**
 * LMS Video Player — native feel, minimal YouTube branding.
 *
 * - YouTube: privacy-enhanced embed (youtube-nocookie.com) with rel=0, modestbranding=1,
 *   controls=1, fs=1, disablekb=1, iv_load_policy=3, playsinline=1. No suggested videos.
 * - Non-YouTube: use embedUrlForNonYoutube (Vimeo, Cloudflare Stream, self-hosted MP4).
 *
 * Video end detection / "Lesson Complete" overlay can be added later via optional
 * YT.Player or postMessage; for stability we use iframe-only so the page always loads.
 */
export interface LessonVideoPlayerProps {
  videoUrl: string | null
  onVideoEnd?: () => void
  onMarkWatched?: () => void
  className?: string
  containerClassName?: string
  /** For non-YouTube: Vimeo, Cloudflare Stream, or self-hosted MP4. Easy to swap provider. */
  embedUrlForNonYoutube?: string | null
}

export function LessonVideoPlayer({
  videoUrl,
  onMarkWatched: _onMarkWatched,
  className = "",
  containerClassName = "",
  embedUrlForNonYoutube = null,
}: LessonVideoPlayerProps) {
  const videoId = getYoutubeVideoId(videoUrl)
  const isYoutube = isYoutubeUrl(videoUrl)

  if (!videoUrl) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <Play className="h-16 w-16 text-[#2596be] mx-auto mb-3 rounded-full border-2 border-[#2596be]/30 p-4" />
          <p className="text-gray-600">No video available for this lesson</p>
        </div>
      </div>
    )
  }

  if (isYoutube && videoId) {
    let embedUrl: string
    try {
      embedUrl = buildPrivacyEnhancedEmbedUrl(videoId)
    } catch {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`
    }
    if (!embedUrl) embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`

    return (
      <div
        className={`lms-video-container w-full bg-black rounded-b-none rounded-t-xl overflow-hidden shadow-lg relative select-none ${containerClassName}`}
        style={{ aspectRatio: "16/9" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={embedUrl}
          className="lms-video-iframe w-full h-full absolute inset-0"
          style={{ aspectRatio: "16/9" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder={0}
          title="Lesson video"
        />
      </div>
    )
  }

  const embedUrl = embedUrlForNonYoutube ?? videoUrl
  return (
    <div
      className={`lms-video-container w-full bg-black rounded-b-none rounded-t-xl overflow-hidden shadow-lg relative select-none ${containerClassName}`}
      style={{ aspectRatio: "16/9" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={embedUrl ?? ""}
        className="lms-video-iframe w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder={0}
        title="Lesson video"
      />
    </div>
  )
}
