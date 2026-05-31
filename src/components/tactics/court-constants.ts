export const PLAYER_A_COLOR = '#10b981'
export const PLAYER_B_COLOR = '#f43f5e'
export const ARROW_MOVEMENT_COLOR = '#ffffff'
export const ARROW_BALL_COLOR = '#fbbf24'
export const PEN_COLOR = '#fde047'
export const PEN_WIDTH = 0.9
export const POINT_SAMPLE_THRESHOLD = 0.4

export type Tool = 'select' | 'arrowMovement' | 'arrowBall' | 'pen' | 'erase'

type OrientationApi = {
  lock?: (orientation: 'landscape' | 'portrait' | 'any') => Promise<void>
  unlock?: () => void
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export async function tryLockLandscape() {
  try {
    const orientation = screen.orientation as unknown as OrientationApi | undefined
    if (orientation?.lock) {
      await orientation.lock('landscape')
    }
  } catch {
    // best-effort: ignored on platforms that don't support it (e.g. iOS Safari)
  }
}

export function tryUnlockOrientation() {
  try {
    const orientation = screen.orientation as unknown as OrientationApi | undefined
    orientation?.unlock?.()
  } catch {
    // ignored
  }
}
