"use client"

import { useEffect, useRef, useState } from "react"
import { Play, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getYoutubeVideoId,
  isYoutubeUrl,
  buildPrivacyEnhancedEmbedUrl,
  YOUTUBE_STATE,
} from "@/lib/youtube-embed"

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        config: {
          width?: string
          height?: string
          videoId?: string
          playerVars?: Record<string, number | string>
          events?: { onStateChange?: (e: { data: number }) => void }
        }
      ) => { destroy: () => void; stopVideo?: () => void }
      PlayerState?: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface LessonVideoPlayerProps {
  videoUrl: string | null
  onVideoEnd?: () => void
  onMarkWatched?: () => void
  className?: string
  containerClassName?: string
  /** For non-YouTube: Vimeo, Cloudflare Stream, or self-hosted MP4 URL. Easy to swap provider later. */
  embedUrlForNonYoutube?: string | null
}

export function LessonVideoPlayer({
  videoUrl,
  onVideoEnd,
  onMarkWatched,
  className = "",
  containerClassName = "",
  embedUrlForNonYoutube = null,
}: LessonVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<InstanceType<NonNullable<Window["YT"]>["Player"] | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const videoId = getYoutubeVideoId(videoUrl)
  const isYoutube = isYoutubeUrl(videoUrl)

  // Load YouTube IFrame API (required to attach to existing iframe and get onStateChange)
  useEffect(() => {
    if (!isYoutube || !videoId) return
    if (window.YT?.Player) {
      setApiReady(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    script.async = true
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      setApiReady(true)
    }
    document.head.appendChild(script)
    return () => {
      window.onYouTubeIframeAPIReady = prev
    }
  }, [isYoutube, videoId])

  // Attach YT.Player to our existing nocookie iframe for reliable state (ended / paused / playing)
  useEffect(() => {
    if (!isYoutube || !videoId || !apiReady || !iframeRef.current || !window.YT?.Player) return
    try {
      const YT = window.YT
      playerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onStateChange(e: { data: number }) {
            const state = e.data
            if (state === (YT.PlayerState?.ENDED ?? YOUTUBE_STATE.ENDED)) {
              try {
                playerRef.current?.stopVideo?.()
              } catch {
                // ignore
              }
              setIsPaused(false)
              setVideoEnded(true)
              onVideoEnd?.()
            } else if (state === (YT.PlayerState?.PLAYING ?? YOUTUBE_STATE.PLAYING)) {
              setIsPaused(false)
            } else if (state === (YT.PlayerState?.PAUSED ?? YOUTUBE_STATE.PAUSED)) {
              setIsPaused(true)
            }
          },
        },
      })
    } catch (err) {
      // API may not support nocookie iframe; video still plays, user can click "Mark as complete"
      console.warn("[LessonVideoPlayer] YT.Player attach failed:", err)
    }
    return () => {
      try {
        playerRef.current?.destroy?.()
      } catch {
        // ignore
      }
      playerRef.current = null
    }
  }, [isYoutube, videoId, apiReady, onVideoEnd])

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
    const embedUrl = buildPrivacyEnhancedEmbedUrl(videoId)

    return (
      <div
        className={`lms-video-container w-full bg-black rounded-b-none rounded-t-xl overflow-hidden shadow-lg relative select-none ${containerClassName}`}
        style={{ aspectRatio: "16/9" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="lms-video-iframe w-full h-full absolute inset-0"
          style={{ aspectRatio: "16/9" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder={0}
          title="Lesson video"
        />
        {/* When paused: overlay bottom to hide "More videos" and recommendations (cross-origin iframe cannot be styled) */}
        {!videoEnded && isPaused && (
          <div
            className="lms-video-paused-overlay absolute bottom-0 left-0 right-0 z-[2] pointer-events-none rounded-b-none"
            style={{
              height: "42%",
              background:
                "linear-gradient(to top, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.6) 40%, transparent 100%)",
            }}
            aria-hidden
          />
        )}
        {/* When video ends: show LMS "Lesson complete" so YouTube end-screen/suggestions are never visible */}
        {videoEnded && (
          <div
            className="lms-video-complete-overlay absolute inset-0 z-10 flex items-center justify-center rounded-t-xl min-h-0"
            style={{
              background:
                "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
              boxShadow: "inset 0 0 0 1px rgba(37,150,190,0.15)",
            }}
          >
            <div className="text-center px-6 py-8 max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-[#2596be]/15 flex items-center justify-center mx-auto mb-5 border border-[#2596be]/30 shadow-lg shadow-[#2596be]/10">
                <CheckCircle2 className="h-10 w-10 text-[#2596be]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Lesson complete
              </h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                No other videos will appear here. Mark as complete and continue to the next lesson.
              </p>
              {onMarkWatched && (
                <Button
                  onClick={onMarkWatched}
                  className="bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl font-medium shadow-lg shadow-[#2596be]/25 transition hover:shadow-xl hover:shadow-[#2596be]/30"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as complete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Non-YouTube: Vimeo, Cloudflare Stream, self-hosted MP4, etc. (easy to swap provider)
  const embedUrl = embedUrlForNonYoutube ?? videoUrl
  return (
    <div
      className={`lms-video-container w-full bg-black rounded-b-none rounded-t-xl overflow-hidden shadow-lg relative select-none ${containerClassName}`}
      style={{ aspectRatio: "16/9" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={embedUrl}
        className="lms-video-iframe w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder={0}
        title="Lesson video"
      />
    </div>
  )
}
