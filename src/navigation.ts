import { createSharedPathnamesNavigation } from 'next-intl/navigation'
import { langs as locales } from 'src/infrastructure/providers'

export const localePrefix = 'always' // Default

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix })
