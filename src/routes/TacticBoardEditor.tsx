import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import TacticCanvas from '@/components/TacticCanvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { EMPTY_TACTIC_SCENE, type TacticScene } from '@/types'

export default function TacticBoardEditor() {
  const { t } = useTranslation()
  const { boardId } = useParams<{ boardId: string }>()
  const { profile } = useAuth()
  const { tacticBoards, updateTacticBoard, removeTacticBoard } = useData()
  const navigate = useNavigate()

  const board = tacticBoards.find((b) => b.id === boardId)

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [scene, setScene] = useState<TacticScene>(EMPTY_TACTIC_SCENE)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!board) return
    setTitle(board.title)
    setNotes(board.notes ?? '')
    setScene(board.scene)
    setDirty(false)
  }, [board?.id, board?.title, board?.notes, board?.scene])

  if (!profile || profile.role !== 'teacher') return null

  if (!board) {
    return (
      <div className="space-y-3">
        <Link to="/teacher/tactics" className="text-sm text-primary underline">
          ← {t('common.back')}
        </Link>
        <p className="text-sm text-muted-foreground">{t('tactics.emptyTitle')}</p>
      </div>
    )
  }

  const markDirty = () => {
    setDirty(true)
    setSavedAt(null)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateTacticBoard(board.id, {
      title: title.trim() || t('tactics.untitled'),
      notes: notes.trim() ? notes : null,
      scene,
    })
    setSaving(false)
    if (result.error) {
      console.error('updateTacticBoard failed', result.error)
      return
    }
    setDirty(false)
    setSavedAt(Date.now())
  }

  const handleDelete = async () => {
    if (!window.confirm(t('tactics.deleteConfirm'))) return
    const result = await removeTacticBoard(board.id)
    if (result.error) {
      console.error('removeTacticBoard failed', result.error)
      return
    }
    navigate('/teacher/tactics')
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Link
          to="/teacher/tactics"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t('common.back')}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              markDirty()
            }}
            placeholder={t('tactics.boardTitlePlaceholder')}
            className="h-11 max-w-md border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center gap-2">
            {savedAt && !dirty && (
              <span className="text-xs text-muted-foreground">{t('tactics.saved')}</span>
            )}
            <Button onClick={handleSave} disabled={saving || !dirty}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? t('tactics.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <TacticCanvas
            scene={scene}
            onChange={(next) => {
              setScene(next)
              markDirty()
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="space-y-2">
            <Label htmlFor="board-notes">{t('tactics.boardNotes')}</Label>
            <Textarea
              id="board-notes"
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                markDirty()
              }}
              placeholder={t('tactics.boardNotesPlaceholder')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
          {t('common.delete')}
        </Button>
      </div>
    </div>
  )
}
