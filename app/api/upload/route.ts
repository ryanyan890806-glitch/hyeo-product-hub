import { NextRequest, NextResponse } from 'next/server'
import { addDocument, updateProduct } from '@/lib/db'
import { uploadFile, generateFileKey } from '@/lib/storage'
export const dynamic = 'force-dynamic'
// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const docType = formData.get('docType') as string
    const productId = formData.get('productId') as string
    const type = formData.get('type') as string // 'thumbnail' or 'document'
    
    if (!file || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate file key
    const key = generateFileKey(
      productId,
      type === 'thumbnail' ? 'thumbnail' : docType,
      file.name
    )
    
    // Upload to R2
    const url = await uploadFile(buffer, key, file.type)
    
    // If thumbnail, update product
    if (type === 'thumbnail') {
      await updateProduct(productId, { thumbnail_url: url })
      return NextResponse.json({ url, type: 'thumbnail' })
    }
    
    // Otherwise add as document
    if (!docType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }
    
    const document = await addDocument({
      productId,
      docType,
      name: file.name,
      url
    })
    
    return NextResponse.json({ 
      document,
      url,
      type: 'document'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
