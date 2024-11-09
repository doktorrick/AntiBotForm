import { generateCsrfToken, setCsrfCookie } from '@/app/utils/csrf'
import { NextResponse } from 'next/server'

export async function GET() {
  const csrfToken =  generateCsrfToken()
  const response = NextResponse.json({ csrfToken })
  setCsrfCookie(response, csrfToken)
  return response
}