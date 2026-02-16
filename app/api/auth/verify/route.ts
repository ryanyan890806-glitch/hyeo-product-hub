import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
export const dynamic = 'force-dynamic'
// GET /api/auth/verify
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({ valid: true, payload })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
