import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Loader2, Plus, Users } from 'lucide-react'
import IdeasButton, { type Idea } from '@/components/IdeasButton'
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

const IDEAS: Idea[] = [
  {
    title: 'Editar / remover alunos',
    description: 'Hoje só dá pra adicionar — falta editar nome/email e arquivar/excluir.',
  },
  {
    title: 'Foto do aluno',
    description: 'Avatar opcional pra identificação visual rápida na lista e nos relatórios.',
  },
  {
    title: 'Tags ou grupos',
    description: 'Marcar alunos como iniciante, competitivo, kids etc. Filtrar lista por tag.',
  },
  {
    title: 'Buscar e filtrar',
    description: 'Campo de busca por nome e ordenação por última aula, média ou alfabético.',
  },
  {
    title: 'Importar lista via CSV',
    description: 'Pra professor com muitos alunos não precisar cadastrar um a um.',
  },
  {
    title: 'Convidar aluno por email',
    description: 'Aluno cadastrado recebe convite e pode acessar a própria evolução.',
  },
]

function NewStudentDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { createStudent } = useData()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setEmail('')
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const result = await createStudent({
      name,
      email: email.trim() || undefined,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('students.newStudentTitle')}</DialogTitle>
          <DialogDescription>{t('students.newStudentDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-name">{t('students.studentName')}</Label>
            <Input
              id="student-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-email">{t('students.studentEmail')}</Label>
            <Input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('students.studentEmailHint')}
            </p>
          </div>
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? t('students.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function StudentsList() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { students, lessonsByStudent, loading } = useData()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!profile || profile.role !== 'teacher') return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('students.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('students.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <IdeasButton ideas={IDEAS} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {t('students.addStudent')}
          </Button>
        </div>
      </div>

      {loading && students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{t('students.emptyTitle')}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('students.emptyDescription')}
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="mt-1">
              <Plus className="size-4" />
              {t('students.addStudent')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {students.map((student) => {
            const lessons = lessonsByStudent(student.id)
            return (
              <Link key={student.id} to={`/teacher/students/${student.id}`} className="block">
                <Card className="transition-colors hover:bg-accent/40">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('students.lessonsRegistered', { count: lessons.length })}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <NewStudentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
