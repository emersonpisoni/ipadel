import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface Idea {
  title: string
  description: string
}

interface IdeasButtonProps {
  ideas: Idea[]
}

export default function IdeasButton({ ideas }: IdeasButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Lightbulb className="size-4" />
        {t('ideas.buttonLabel')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('ideas.title')}</DialogTitle>
            <DialogDescription>{t('ideas.description')}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {ideas.map((item) => (
              <li key={item.title} className="rounded-md border p-3">
                <div className="text-sm font-medium">{item.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
