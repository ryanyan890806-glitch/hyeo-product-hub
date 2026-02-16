import { NextRequest, NextResponse } from 'next/server'
import { reorderProducts } from '@/lib/db'

// POST /api/products/reorder - Reorder products
export async function POST(request: NextRequest) {
  try {
    const { updates } = await request.json()
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid updates format' },
        { status: 400 }
      )
    }
    
    await reorderProducts(updates)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering products:', error)
    return NextResponse.json(
      { error: 'Failed to reorder products' },
      { status: 500 }
    )
  }
}
