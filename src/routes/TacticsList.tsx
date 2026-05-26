import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, LayoutGrid, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'

export default function TacticsList() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { tacticBoards, createTacticBoard, loading } = useData()
  const navigate = useNavigate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!profile || profile.role !== 'teacher') return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const result = await createTacticBoard({ title })
    setSaving(false)
    if (result.error || !result.id) {
      setError(result.error)
      return
    }
    setTitle('')
    setDialogOpen(false)
    navigate(`/teacher/tactics/${result.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('tactics.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('tactics.subtitle')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          {t('tactics.newBoard')}
        </Button>
      </div>

      {loading && tacticBoards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : tacticBoards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <LayoutGrid className="size-6 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{t('tactics.emptyTitle')}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('tactics.emptyDescription')}
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="mt-1">
              <Plus className="size-4" />
              {t('tactics.newBoard')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tacticBoards.map((board) => (
            <Link key={board.id} to={`/teacher/tactics/${board.id}`} className="block">
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardContent className="flex h-full flex-col gap-1 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium">{board.title || t('tactics.untitled')}</div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  {board.notes && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {board.notes}
                    </p>
                  )}
                  <div className="mt-auto pt-2 text-xs text-muted-foreground">
                    {board.scene.players.length} · {board.scene.arrows.length} →
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o)
          if (!o) {
            setTitle('')
            setError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tactics.newBoard')}</DialogTitle>
            <DialogDescription>{t('tactics.subtitle')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="board-title">{t('tactics.boardTitle')}</Label>
              <Input
                id="board-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('tactics.boardTitlePlaceholder')}
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saving || !title.trim()}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {saving ? t('tactics.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

