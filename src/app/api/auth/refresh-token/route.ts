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
    // Read refresh token from httpOnly cookie — never from request body
    const refreshToken = request.cookies.get('admin_refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token' },
        { status: 401 }
      )
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/auth/refresh-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY || '',
          'User-Agent': 'Allergy-Checker-Admin/1.0.0',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    )

    const data = await backendResponse.json()

    if (!backendResponse.ok || !data.success) {
      // Refresh failed — clear stale cookies
      const errorResponse = NextResponse.json(
        { success: false, message: data.message || 'Token refresh failed' },
        { status: backendResponse.status || 401 }
      )
      errorResponse.cookies.set('admin_token', '', {
        httpOnly: true, secure: true, sameSite: 'strict', path: '/', expires: new Date(0),
      })
      errorResponse.cookies.set('admin_refresh_token', '', {
        httpOnly: true, secure: true, sameSite: 'strict', path: '/', expires: new Date(0),
      })
      return errorResponse
    }

    // Backend returns { success, tokens: {...} } at the top level (no data wrapper)
    // Support both shapes for safety: top-level tokens OR nested under data
    const tokens = data.tokens || data.data?.tokens || data.data
    const accessToken = tokens?.access_token || tokens?.accessToken
    const newRefreshToken = tokens?.refresh_token || tokens?.refreshToken
    const expiresIn = tokens?.expires_in || tokens?.expiresIn || 3600

    if (!accessToken) {
      console.error('[refresh-token] Unexpected backend response shape:', JSON.stringify(data))
      return NextResponse.json(
        { success: false, message: 'No access token in response' },
        { status: 500 }
      )
    }

    const accessExpiry = new Date(parseJWTExpiry(accessToken) ?? Date.now() + expiresIn * 1000)
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Return access token to client for in-memory storage only
    // Refresh token stays server-side in httpOnly cookie only
    const response = NextResponse.json({
      success: true,
      data: { access_token: accessToken, expires_in: expiresIn },
    })

    response.cookies.set('admin_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      expires: accessExpiry,
    })

    if (newRefreshToken) {
      response.cookies.set('admin_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        expires: refreshExpiry,
      })
    }

    return response
  } catch (err) {
    console.error('[refresh-token] Unhandled error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}
