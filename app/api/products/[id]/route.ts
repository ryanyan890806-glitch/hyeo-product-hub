import { NextRequest, NextResponse } from 'next/server'
import { deleteProduct, updateProduct, deletePhotoByUrl } from '@/lib/db'
import { extractKeyFromUrl, deleteFile } from '@/lib/storage'

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Get product documents to delete files
    const { getProductWithDocuments } = await import('@/lib/db')
    const { documents } = await getProductWithDocuments(id)
    
    // Delete files from storage
    for (const doc of documents) {
      const key = extractKeyFromUrl(doc.url)
      if (key) {
        try {
          await deleteFile(key)
        } catch (e) {
          console.error('Failed to delete file:', e)
        }
      }
    }
    
    // Delete product from database
    await deleteProduct(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    await updateProduct(id, body)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
