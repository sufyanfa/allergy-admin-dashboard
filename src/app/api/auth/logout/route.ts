import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('admin_token')?.value

  // Notify backend to invalidate the session (best-effort, never block on failure)
  if (accessToken) {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/auth/logout`,
      {
        method: 'POST',
        headers: {
          // No Content-Type header — Fastify rejects application/json with empty body
          'x-api-key': process.env.API_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Allergy-Checker-Admin/1.0.0',
        },
      }
    ).catch(() => {})
  }

  // Always clear httpOnly cookies regardless of backend response
  const response = NextResponse.json({ success: true })

  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  })

  response.cookies.set('admin_refresh_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  })

  return response
}
