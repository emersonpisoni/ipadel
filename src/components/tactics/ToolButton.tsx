import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolButtonProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  dotColor?: string
}

export default function ToolButton({ active, onClick, icon: Icon, label, dotColor }: ToolButtonProps) {
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
