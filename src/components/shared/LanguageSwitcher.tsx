import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SupportedLanguage } from '@/i18n'

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

const LANGUAGE_SHORT: Record<SupportedLanguage, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES',
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'pt') as SupportedLanguage

  return (
    <Select value={current} onValueChange={(v) => i18n.changeLanguage(v)}>
      <SelectTrigger
        className="h-9 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none hover:bg-accent/50 focus-visible:ring-0"
        aria-label="Idioma"
      >
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue>{LANGUAGE_SHORT[current]}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((lng) => (
          <SelectItem key={lng} value={lng}>
            {LANGUAGE_LABELS[lng]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
