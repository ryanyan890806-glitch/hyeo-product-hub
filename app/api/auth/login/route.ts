import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, generateToken } from '@/lib/auth'
export const dynamic = 'force-dynamic'
// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    // Check against admin password from env
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (username !== 'admin' || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = generateToken({ username, role: 'admin' })
    
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
