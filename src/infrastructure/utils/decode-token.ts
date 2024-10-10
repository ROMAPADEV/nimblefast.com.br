import { type JwtPayload, jwtDecode } from 'jwt-decode'

export function decodetoken<T>(token: string): JwtPayload & T {
  return jwtDecode(token)
}
