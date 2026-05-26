import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  Eraser,
  MousePointer2,
  Pencil,
  Plus,
  Target,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  TacticArrow,
  TacticPlayer,
  TacticScene,
  TacticStroke,
} from '@/types'

type Tool =
  | 'select'
  | 'addPlayerA'
  | 'addPlayerB'
  | 'arrowMovement'
  | 'arrowBall'
  | 'pen'
  | 'erase'

interface TacticCanvasProps {
  scene: TacticScene
  onChange: (scene: TacticScene) => void
}

const PLAYER_A_COLOR = '#10b981'
const PLAYER_B_COLOR = '#f43f5e'
const ARROW_MOVEMENT_COLOR = '#ffffff'
const ARROW_BALL_COLOR = '#fbbf24'
const PEN_COLOR = '#fde047'
const PEN_WIDTH = 0.9
const POINT_SAMPLE_THRESHOLD = 0.4

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export default function TacticCanvas({ scene, onChange }: TacticCanvasProps) {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement>(null)
  const [tool, setTool] = useState<Tool>('select')
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[] | null>(
    null
  )
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: clamp(p.x, 0, 200), y: clamp(p.y, 0, 100) }
  }

  const handleCourtPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current) return
    const { x, y } = clientToSvg(e.clientX, e.clientY)

    if (tool === 'addPlayerA' || tool === 'addPlayerB') {
      const team = tool === 'addPlayerA' ? 'A' : 'B'
      onChange({
        ...scene,
        players: [...scene.players, { id: newId(), x, y, team }],
      })
      return
    }

    if (tool === 'arrowMovement' || tool === 'arrowBall') {
      const kind = tool === 'arrowMovement' ? 'movement' : 'ball'
      if (!arrowStart) {
        setArrowStart({ x, y })
      } else {
        onChange({
          ...scene,
          arrows: [...scene.arrows, { id: newId(), from: arrowStart, to: { x, y }, kind }],
        })
        setArrowStart(null)
        setCursor(null)
      }
      return
    }

    if (tool === 'pen') {
      setCurrentStroke([{ x, y }])
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const { x, y } = clientToSvg(e.clientX, e.clientY)
    if (dragRef.current) {
      const drag = dragRef.current
      onChange({
        ...scene,
        players: scene.players.map((p) =>
          p.id === drag.id
            ? { ...p, x: clamp(x - drag.dx, 0, 200), y: clamp(y - drag.dy, 0, 100) }
            : p
        ),
      })
      return
    }
    if (currentStroke) {
      const last = currentStroke[currentStroke.length - 1]!
      if (Math.hypot(x - last.x, y - last.y) >= POINT_SAMPLE_THRESHOLD) {
        setCurrentStroke([...currentStroke, { x, y }])
      }
      return
    }
    if (arrowStart) {
      setCursor({ x, y })
    }
  }

  const handlePointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = null
    if (currentStroke) {
      if (currentStroke.length > 1) {
        onChange({
          ...scene,
          strokes: [
            ...scene.strokes,
            {
              id: newId(),
              points: currentStroke,
              color: PEN_COLOR,
              width: PEN_WIDTH,
            },
          ],
        })
      }
      setCurrentStroke(null)
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    }
  }

  const handlePlayerPointerDown = (
    e: ReactPointerEvent<SVGGElement>,
    player: TacticPlayer
  ) => {
    if (tool === 'erase') {
      e.stopPropagation()
      onChange({
        ...scene,
        players: scene.players.filter((p) => p.id !== player.id),
      })
      return
    }
    if (tool === 'pen') {
      return
    }
    e.stopPropagation()
    const { x, y } = clientToSvg(e.clientX, e.clientY)
    dragRef.current = { id: player.id, dx: x - player.x, dy: y - player.y }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const handleArrowPointerDown = (
    e: ReactPointerEvent<SVGLineElement>,
    arrow: TacticArrow
  ) => {
    if (tool === 'erase') {
      e.stopPropagation()
      onChange({
        ...scene,
        arrows: scene.arrows.filter((a) => a.id !== arrow.id),
      })
    }
  }

  const handleStrokePointerDown = (
    e: ReactPointerEvent<SVGPolylineElement>,
    stroke: TacticStroke
  ) => {
    if (tool === 'erase') {
      e.stopPropagation()
      onChange({
        ...scene,
        strokes: scene.strokes.filter((s) => s.id !== stroke.id),
      })
    }
  }

  const clearAll = () => {
    onChange({ players: [], arrows: [], strokes: [] })
    setArrowStart(null)
    setCursor(null)
    setCurrentStroke(null)
  }

  const hasContent =
    scene.players.length > 0 || scene.arrows.length > 0 || scene.strokes.length > 0

  const cursorClass =
    tool === 'pen'
      ? 'cursor-crosshair'
      : tool === 'erase'
        ? 'cursor-crosshair'
        : tool === 'arrowMovement' || tool === 'arrowBall'
          ? 'cursor-crosshair'
          : tool === 'addPlayerA' || tool === 'addPlayerB'
            ? 'cursor-copy'
            : 'cursor-default'

  const pointsToStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToolButton
          active={tool === 'select'}
          onClick={() => setTool('select')}
          icon={MousePointer2}
          label={t('tactics.tools.select')}
        />
        <ToolButton
          active={tool === 'addPlayerA'}
          onClick={() => setTool('addPlayerA')}
          icon={Plus}
          label={t('tactics.tools.addPlayerA')}
          dotColor={PLAYER_A_COLOR}
        />
        <ToolButton
          active={tool === 'addPlayerB'}
          onClick={() => setTool('addPlayerB')}
          icon={Plus}
          label={t('tactics.tools.addPlayerB')}
          dotColor={PLAYER_B_COLOR}
        />
        <ToolButton
          active={tool === 'arrowMovement'}
          onClick={() => {
            setTool('arrowMovement')
            setArrowStart(null)
          }}
          icon={ArrowUpRight}
          label={t('tactics.tools.arrowMovement')}
        />
        <ToolButton
          active={tool === 'arrowBall'}
          onClick={() => {
            setTool('arrowBall')
            setArrowStart(null)
          }}
          icon={Target}
          label={t('tactics.tools.arrowBall')}
        />
        <ToolButton
          active={tool === 'pen'}
          onClick={() => {
            setTool('pen')
            setArrowStart(null)
          }}
          icon={Pencil}
          label={t('tactics.tools.pen')}
          dotColor={PEN_COLOR}
        />
        <ToolButton
          active={tool === 'erase'}
          onClick={() => setTool('erase')}
          icon={Eraser}
          label={t('tactics.tools.erase')}
        />
        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasContent}
            onClick={clearAll}
          >
            <Trash2 className="size-4" />
            {t('tactics.clearScene')}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg ring-1 ring-border">
        <svg
          ref={svgRef}
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
          onPointerDown={handleCourtPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={cn('block w-full touch-none select-none', cursorClass)}
          style={{ aspectRatio: '2 / 1' }}
        >
          <defs>
            <marker
              id="tactic-arrow-movement"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW_MOVEMENT_COLOR} />
            </marker>
            <marker
              id="tactic-arrow-ball"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW_BALL_COLOR} />
            </marker>
          </defs>

          <rect width="200" height="100" fill="#1f6b51" />

          <g pointerEvents="none">
            <rect
              x={1}
              y={1}
              width={198}
              height={98}
              fill="none"
              stroke="white"
              strokeWidth={0.6}
            />
            <line x1={30} y1={1} x2={30} y2={99} stroke="white" strokeWidth={0.5} />
            <line x1={170} y1={1} x2={170} y2={99} stroke="white" strokeWidth={0.5} />
            <line x1={30} y1={50} x2={170} y2={50} stroke="white" strokeWidth={0.5} />
            <line
              x1={100}
              y1={0}
              x2={100}
              y2={100}
              stroke="white"
              strokeWidth={1.2}
              strokeDasharray="2 1.2"
            />
          </g>

          {scene.strokes.map((s) => (
            <polyline
              key={s.id}
              points={pointsToStr(s.points)}
              stroke={s.color ?? PEN_COLOR}
              strokeWidth={s.width ?? PEN_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ pointerEvents: tool === 'erase' ? 'visibleStroke' : 'none' }}
              className={tool === 'erase' ? 'cursor-pointer' : ''}
              onPointerDown={(e) => handleStrokePointerDown(e, s)}
            />
          ))}

          {scene.arrows.map((a) => (
            <line
              key={a.id}
              x1={a.from.x}
              y1={a.from.y}
              x2={a.to.x}
              y2={a.to.y}
              stroke={a.kind === 'movement' ? ARROW_MOVEMENT_COLOR : ARROW_BALL_COLOR}
              strokeWidth={a.kind === 'movement' ? 1 : 1.1}
              strokeLinecap="round"
              strokeDasharray={a.kind === 'ball' ? '2.2 1.6' : undefined}
              markerEnd={
                a.kind === 'movement'
                  ? 'url(#tactic-arrow-movement)'
                  : 'url(#tactic-arrow-ball)'
              }
              style={{ pointerEvents: tool === 'erase' ? 'visibleStroke' : 'none' }}
              className={tool === 'erase' ? 'cursor-pointer' : ''}
              onPointerDown={(e) => handleArrowPointerDown(e, a)}
            />
          ))}

          {scene.players.map((p) => (
            <g
              key={p.id}
              onPointerDown={(e) => handlePlayerPointerDown(e, p)}
              style={{
                cursor:
                  tool === 'erase'
                    ? 'pointer'
                    : tool === 'pen'
                      ? 'crosshair'
                      : 'grab',
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={p.team === 'A' ? PLAYER_A_COLOR : PLAYER_B_COLOR}
                stroke="white"
                strokeWidth={0.7}
              />
              {p.label && (
                <text
                  x={p.x}
                  y={p.y + 1.4}
                  fontSize={3.2}
                  fill="white"
                  textAnchor="middle"
                  fontWeight={600}
                  pointerEvents="none"
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}

          {arrowStart && cursor && (
            <line
              x1={arrowStart.x}
              y1={arrowStart.y}
              x2={cursor.x}
              y2={cursor.y}
              stroke={
                tool === 'arrowMovement' ? ARROW_MOVEMENT_COLOR : ARROW_BALL_COLOR
              }
              strokeWidth={0.8}
              strokeDasharray="2 1.5"
              opacity={0.6}
              pointerEvents="none"
            />
          )}

          {currentStroke && currentStroke.length > 1 && (
            <polyline
              points={pointsToStr(currentStroke)}
              stroke={PEN_COLOR}
              strokeWidth={PEN_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              pointerEvents="none"
            />
          )}
        </svg>
      </div>
    </div>
  )
}

interface ToolButtonProps {
  active: boolean
  onClick: () => void
  icon: typeof MousePointer2
  label: string
  dotColor?: string
}

function ToolButton({ active, onClick, icon: Icon, label, dotColor }: ToolButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
    >
      <Icon className="size-4" />
      {dotColor && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
