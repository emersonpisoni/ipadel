import type { ReactNode } from 'react'

interface FullscreenFrameProps {
  isFullscreen: boolean
  shouldRotate: boolean
  toolbar: ReactNode
  svg: ReactNode
}

export default function FullscreenFrame({
  isFullscreen,
  shouldRotate,
  toolbar,
  svg,
}: FullscreenFrameProps) {
  if (shouldRotate) {
    return (
      <div
        style={{
          width: '100vh',
          height: '100vw',
          transform: 'rotate(90deg)',
          position: 'relative',
        }}
      >
        <div className="absolute inset-0">{svg}</div>
        <div className="absolute inset-x-2 top-2 z-10 rounded-md bg-background/70 px-2 py-1 backdrop-blur-sm">
          {toolbar}
        </div>
      </div>
    )
  }
  if (isFullscreen) {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-0">{svg}</div>
        <div className="absolute inset-x-2 top-2 z-10 rounded-md bg-background/70 px-2 py-1 backdrop-blur-sm">
          {toolbar}
        </div>
      </div>
    )
  }
  return (
    <>
      {toolbar}
      <div className="overflow-hidden rounded-lg ring-1 ring-border">{svg}</div>
    </>
  )
}
