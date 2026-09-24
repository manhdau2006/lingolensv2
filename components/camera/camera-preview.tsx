"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { CameraOff, RefreshCw } from "lucide-react"

type CameraPreviewProps = {
  facingFront: boolean
}

export type CameraPreviewHandle = {
  captureImage: () => string | null
}

export const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(
  function CameraPreview({ facingFront }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      captureImage: () => {
        const video = videoRef.current
        if (!video || video.readyState < 2) return null

        const canvas = document.createElement("canvas")
        const width = video.videoWidth || 640
        const height = video.videoHeight || 640
        const size = Math.min(width, height)

        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext("2d")
        if (ctx) {
          const sx = (width - size) / 2
          const sy = (height - size) / 2
          ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size)
          return canvas.toDataURL("image/jpeg", 0.8)
        }
        return null
      },
    }))

    useEffect(() => {
      let isMounted = true
      setLoading(true)
      setError(null)

      async function startCamera() {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) {
            setError("Trình duyệt không hỗ trợ truy cập Camera.")
            setLoading(false)
          }
          return
        }

        const facingMode = facingFront ? "user" : "environment"

        try {
          let stream: MediaStream
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode },
            })
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            })
          }

          if (!isMounted) {
            stream.getTracks().forEach((track) => track.stop())
            return
          }

          streamRef.current = stream

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play().catch(() => {})
          }

          setLoading(false)
          setError(null)
        } catch (err: unknown) {
          if (!isMounted) return
          setLoading(false)

          if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
            setError("Bạn chưa cấp quyền sử dụng camera. Vui lòng bật quyền truy cập camera trên trình duyệt của bạn.")
          } else if (err instanceof DOMException && (err.name === "NotFoundError" || err.name === "DevicesNotFoundError")) {
            setError("Không tìm thấy thiết bị camera trên máy của bạn.")
          } else {
            setError("Không thể khởi tạo camera. Vui lòng kiểm tra lại thiết bị của bạn.")
          }
        }
      }

      startCamera()

      return () => {
        isMounted = false
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }
    }, [facingFront])

    return (
      <div className="relative aspect-square w-[90%] max-w-[21.6rem]">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl shadow-black/60 ring-1 ring-white/10">
          {/* Real Live Camera Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`size-full object-cover transition-transform duration-300 ${
              facingFront ? "-scale-x-100" : ""
            } ${error ? "hidden" : "block"}`}
          />

          {/* Loading State */}
          {loading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-neutral-400">
              <RefreshCw className="size-8 animate-spin text-amber-400" />
              <span className="mt-3 text-xs font-medium">Đang mở camera...</span>
            </div>
          )}

          {/* Permission Denied or Camera Error View */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/95 p-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400 mb-3">
                <CameraOff className="size-7" />
              </div>
              <p className="text-xs leading-relaxed text-neutral-300 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Focus Reticle */}
          {!error && !loading && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white/70" />
          )}

          {/* Corner Guides */}
          {!error && !loading && (
            <div className="pointer-events-none absolute inset-4">
              <span className="absolute left-0 top-0 size-6 rounded-tl-xl border-l-2 border-t-2 border-white/60" />
              <span className="absolute right-0 top-0 size-6 rounded-tr-xl border-r-2 border-t-2 border-white/60" />
              <span className="absolute bottom-0 left-0 size-6 rounded-bl-xl border-b-2 border-l-2 border-white/60" />
              <span className="absolute bottom-0 right-0 size-6 rounded-br-xl border-b-2 border-r-2 border-white/60" />
            </div>
          )}

          {/* Live Badge */}
          {!error && !loading && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-[11px] font-medium tracking-wide text-white/90">LIVE</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)
