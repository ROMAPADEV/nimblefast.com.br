import {
  enUS as dateFnsLocaleEnUS,
  es as dateFnsLocaleEs,
  ptBR as dateFnsLocalePtBR,
} from 'date-fns/locale'
import { useMemo } from 'react'
import { type Locale } from 'src/infrastructure/providers'

export function useDateFnsLocale(locale: Locale) {
  const dateFnsLocale = useMemo(() => {
    switch (locale) {
      case 'pt-BR':
        return dateFnsLocalePtBR
      case 'en-US':
        return dateFnsLocaleEnUS
      case 'es-ES':
        return dateFnsLocaleEs
    }
  }, [locale])

  return dateFnsLocale
}
