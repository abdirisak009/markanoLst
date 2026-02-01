"use client"

import { useEffect, useRef, useState } from "react"
import { Play, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        config: {
          videoId: string
          width?: string
          height?: string
          playerVars?: Record<string, number | string>
          events?: { onStateChange?: (e: { data: number }) => void }
        }
      ) => { destroy: () => void }
      PlayerState?: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

function getYoutubeVideoId(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

function isYoutubeUrl(url: string | null): boolean {
  return !!url && (url.includes("youtube.com") || url.includes("youtu.be"))
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
  onVideoEnd,
  onMarkWatched,
  className = "",
  containerClassName = "",
  embedUrlForNonYoutube = null,
}: LessonVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<InstanceType<NonNullable<Window["YT"]>["Player"]> | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const videoId = getYoutubeVideoId(videoUrl)
  const isYoutube = isYoutubeUrl(videoUrl)

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

  useEffect(() => {
    if (!isYoutube || !videoId || !apiReady || !containerRef.current) return

    const el = document.createElement("div")
    el.className = "w-full h-full"
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(el)

    const YT = window.YT!
    playerRef.current = new YT.Player(el, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        disablekb: 0,
        fs: 1,
        enablejsapi: 1,
        origin: typeof window !== "undefined" ? window.location.origin : "",
      },
      events: {
        onStateChange(e: { data: number }) {
          if (e.data === (YT.PlayerState?.ENDED ?? 0)) {
            try {
              playerRef.current?.stopVideo?.()
            } catch {
              // ignore
            }
            setVideoEnded(true)
            onVideoEnd?.()
          }
        },
      },
    })

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
    return (
      <div
        className={`w-full bg-black rounded-b-none rounded-t-xl overflow-hidden shadow-lg relative select-none ${containerClassName}`}
        style={{ aspectRatio: "16/9" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={containerRef}
          className={`w-full h-full absolute inset-0 ${videoEnded ? "invisible pointer-events-none z-0" : "z-[1]"}`}
          style={{ aspectRatio: "16/9" }}
          aria-hidden={videoEnded}
        />
        {videoEnded && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-t-xl min-h-0"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
              boxShadow: "inset 0 0 0 1px rgba(37,150,190,0.15)",
            }}
          >
            <div className="text-center px-6 py-8 max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-[#2596be]/15 flex items-center justify-center mx-auto mb-5 border border-[#2596be]/30 shadow-lg shadow-[#2596be]/10">
                <CheckCircle2 className="h-10 w-10 text-[#2596be]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Lesson complete</h3>
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

  const embedUrl = embedUrlForNonYoutube ?? videoUrl
  return (
    <div
      className={`w-full bg-black rounded-b-none rounded-t-xl overflow-hidden shadow-lg relative select-none ${containerClassName}`}
      style={{ aspectRatio: "16/9" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
        title="Lesson video"
      />
    </div>
  )
}
