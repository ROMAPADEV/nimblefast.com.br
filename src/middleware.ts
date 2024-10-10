import createMiddleware from 'next-intl/middleware'
import { nextIntl } from 'src/infrastructure/providers'
import { NextResponse } from 'next/server'
import type { NextRequest, NextResponse as NextResponseType } from 'next/server'
import { isTokenExpired } from 'src/infrastructure/utils'

interface RefreshToken {
  token: string
  refreshtoken: string
}

const { URL_BASE } = process.env

function redirectToLogout(request: NextRequest, locale: string) {
  return NextResponse.redirect(
    `${request.nextUrl.origin}/${locale}/auth/logout`,
  )
}

function redirectToHome(request: NextRequest, locale: string) {
  return NextResponse.redirect(`${request.nextUrl.origin}/${locale}`)
}

async function doRefreshtoken(response: NextResponseType, data: RefreshToken) {
  return fetch(`${URL_BASE}/api/refreshtoken`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then(async (result) => {
      if (!result.ok) {
        return false
      }

      const { token, refresh_token: refreshtoken } = await result.json()

      response.cookies.set('token', token)
      response.cookies.set('refreshtoken', refreshtoken)

      return true
    })
    .catch(() => {
      return false
    })
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const refreshtoken = request.cookies.get('refreshtoken')?.value
  const locale = request.cookies.get('NEXT_LOCALE')?.value

  const response = NextResponse.next()

  if (!locale) {
    return redirectToLogout(request, nextIntl.defaultLocale)
  }

  if (!token || !refreshtoken) {
    return redirectToLogout(request, locale)
  }

  if (isTokenExpired(token)) {
    const success = await doRefreshtoken(response, { token, refreshtoken })

    if (!success) {
      return redirectToLogout(request, locale)
    }
  }

  if (request.nextUrl.pathname === '/') {
    return redirectToHome(request, locale)
  }

  return response
}

export default createMiddleware(nextIntl)

// const patchAuth = langs.map((lang) => `${lang}/auth`).join('|')
// console.log(patchAuth)
export const config = {
  matcher: [
    '/((?!api|_next|en-US/auth|en-US/auth/signup|en-US/rota|pt-BR/auth|pt-BR/auth/signup|pt-BR/rota|es-ES/auth|es-ES/auth/signup|es-ES/rota|.*\\..*).*)',
  ],
  // matcher: [`/((?!api|_next|${patchAuth}|.*\\..*).*)`],
}
