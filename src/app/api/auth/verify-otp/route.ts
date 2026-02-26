import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function parseJWTExpiry(token: string): number | null {
  try {
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4
    if (padding) base64 += '='.repeat(4 - padding)
    const payload = JSON.parse(atob(base64))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/auth/verify-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY || '',
          'User-Agent': 'Allergy-Checker-Admin/1.0.0',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await backendResponse.json()

    // If login failed, return as-is (no tokens to handle)
    if (!data.success || !data.data?.tokens) {
      return NextResponse.json(data, { status: backendResponse.status })
    }

    const tokens = data.data.tokens
    const accessToken = tokens.access_token || tokens.accessToken
    const refreshToken = tokens.refresh_token || tokens.refreshToken
    const expiresIn = tokens.expires_in || tokens.expiresIn || 3600

    if (!accessToken) {
      return NextResponse.json(data, { status: backendResponse.status })
    }

    const accessExpiry = new Date(parseJWTExpiry(accessToken) ?? Date.now() + expiresIn * 1000)
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Strip refresh_token from body — client has no use for it (stored only as httpOnly cookie)
    // Access token is returned so the client can hold it in memory for Authorization headers
    const responseBody = {
      ...data,
      data: {
        ...data.data,
        tokens: { access_token: accessToken, expires_in: expiresIn },
      },
    }

    const response = NextResponse.json(responseBody, { status: backendResponse.status })

    // Set tokens as httpOnly cookies — JavaScript cannot read these
    response.cookies.set('admin_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      expires: accessExpiry,
    })

    if (refreshToken) {
      response.cookies.set('admin_refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        expires: refreshExpiry,
      })
    }

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: 'PROXY_ERROR', message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
