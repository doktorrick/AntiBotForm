// app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
  }
  const formData = await req.formData()
  const csrfTokenFromFormData = formData.get('csrfToken')
  const csrfTokenFromCookies = req.cookies.get('csrfToken')?.value
  
  if (csrfTokenFromFormData !== csrfTokenFromCookies) {
    return NextResponse.json({ message: 'CSRF token mismatch', isSuccess: false }, { status: 403 })
  }
  return NextResponse.json({ message: 'Form submitted successfully', isSuccess: true }, { status: 200 })
}

export const config = {
  // Allow only POST method
  matcher: '/api/submit-form',
}
