"use client"

import { Play, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getYoutubeVideoId, isYoutubeUrl } from "@/lib/youtube-embed"

/**
 * Build a simple YouTube embed URL (no API, no script) so the page always loads.
 * rel=0, modestbranding=1, iv_load_policy=3 to reduce suggestions and annotations.
 */
function buildSimpleYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", iv_load_policy: "3" })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export interface LessonVideoPlayerProps {
  videoUrl: string | null
  onVideoEnd?: () => void
  onMarkWatched?: () => void
  className?: string
  containerClassName?: string
  embedUrlForNonYoutube?: string | null
}

export function LessonVideoPlayer({
  videoUrl,
  onMarkWatched,
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
    const embedUrl = buildSimpleYoutubeEmbedUrl(videoId)
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
