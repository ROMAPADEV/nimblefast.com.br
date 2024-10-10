'use client'

import { Locale, nextIntl } from 'src/infrastructure/providers'
import { defaultDictionary, Dictionary } from './index'

export function getDictionaryUseClient(locale: Locale): Dictionary {
  return (
    defaultDictionary[locale] ??
    defaultDictionary[nextIntl.defaultLocale as Locale]
  )
}
