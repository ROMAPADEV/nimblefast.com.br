import 'server-only'
import { Locale, nextIntl } from 'src/infrastructure/providers'
import { defaultDictionary } from './index'

export function getDictionaryServerOnly(locale: Locale) {
  return (
    defaultDictionary[locale] ??
    defaultDictionary[nextIntl.defaultLocale as Locale]
  )
}
