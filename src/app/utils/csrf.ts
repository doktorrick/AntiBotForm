// utils/csrf.ts
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export function generateCsrfToken() {
  return randomBytes(32).toString('hex')
}

export function setCsrfCookie(response: NextResponse, csrfToken: string) {
  response.cookies.set('csrfToken', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })
}
