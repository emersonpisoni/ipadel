import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import IdeasButton, { type Idea } from '@/components/IdeasButton'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'

const IDEAS: Idea[] = [
  {
    title: 'Cadastrar / editar / remover alunos',
    description:
      'Hoje os alunos vêm do mock. Permitir que o professor gerencie sua própria base.',
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
    description:
      'Campo de busca por nome e ordenação por última aula, média ou alfabético.',
  },
  {
    title: 'Importar lista via CSV',
    description: 'Pra professor com muitos alunos não precisar cadastrar um a um.',
  },
  {
    title: 'Status do aluno',
    description: 'Ativo, pausado, inativo. Esconder alunos pausados da visão padrão.',
  },
]

export default function StudentsList() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const { studentsByTeacher, lessonsByStudent } = useData()

  if (!session || session.role !== 'teacher') return null

  const myStudents = studentsByTeacher(session.userId)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('students.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('students.subtitle')}</p>
        </div>
        <IdeasButton ideas={IDEAS} />
      </div>

      <div className="space-y-2">
        {myStudents.map((student) => {
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
    </div>
  )
}
