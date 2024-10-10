import 'dayjs/locale/pt-br'
import 'dayjs/locale/en-gb'
import 'dayjs/locale/es'
import { defaultLocale, Locale } from 'src/infrastructure/providers/intl'

export function getLanguage(locale: Locale = defaultLocale): string {
  switch (locale) {
    case 'pt-BR':
      return 'pt-br'

    case 'en-US':
      return 'en-us'

    case 'es-ES':
      return 'es'
  }
}
