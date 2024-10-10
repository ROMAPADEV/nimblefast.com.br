export const defaultLocale = 'pt-BR'
export const langs = [defaultLocale, 'en-US', 'es-ES'] as const

const locales = langs as unknown as string[]

export const nextIntl = { defaultLocale, locales, localeDetection: true }

export type Locale = (typeof langs)[number]
