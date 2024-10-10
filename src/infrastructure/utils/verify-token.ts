import { type JwtPayload, jwtDecode } from 'jwt-decode'

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: JwtPayload = jwtDecode(token)

    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      return true
    }

    return false
  } catch (error) {
    return true
  }
}
