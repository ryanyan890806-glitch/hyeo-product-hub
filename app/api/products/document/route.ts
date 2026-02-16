import { NextRequest, NextResponse } from 'next/server'
import { addDocument } from '@/lib/db'

// POST /api/products/document - Add document (for video URLs)
export async function POST(request: NextRequest) {
  try {
    const { productId, docType, name, url } = await request.json()
    
    if (!productId || !docType || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const document = await addDocument({
      productId,
      docType,
      name: name || 'Document',
      url
    })
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error adding document:', error)
    return NextResponse.json(
      { error: 'Failed to add document' },
      { status: 500 }
    )
  }
}
