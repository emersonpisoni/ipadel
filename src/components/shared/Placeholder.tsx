import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

interface PlaceholderProps {
  titleKey: string
  descriptionKey: string
  icon: LucideIcon
}

export default function Placeholder({ titleKey, descriptionKey, icon: Icon }: PlaceholderProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h2>
        <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Icon className="size-6 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{t('placeholder.comingSoon')}</div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t('placeholder.underConstruction')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
