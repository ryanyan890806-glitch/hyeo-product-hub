import { NextRequest, NextResponse } from 'next/server'
import { deletePhotoByUrl } from '@/lib/db'
import { extractKeyFromUrl, deleteFile } from '@/lib/storage'

// DELETE /api/products/[id]/photo - Delete specific photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'Photo URL is required' },
        { status: 400 }
      )
    }
    
    // Delete from storage
    const key = extractKeyFromUrl(url)
    if (key) {
      try {
        await deleteFile(key)
      } catch (e) {
        console.error('Failed to delete file from storage:', e)
      }
    }
    
    // Delete from database
    await deletePhotoByUrl(id, url)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
