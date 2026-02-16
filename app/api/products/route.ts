import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, deleteProduct, reorderProducts, updateProduct } from '@/lib/db'
import { Product, DocType } from '@/types'
export const dynamic = 'force-dynamic'
// GET /api/products - List all products with documents
export async function GET() {
  try {
    const products = await getProducts()
    
    // Fetch documents for each product
    const productsWithDocs = await Promise.all(
      products.map(async (product) => {
        const { getProductWithDocuments } = await import('@/lib/db')
        const { documents } = await getProductWithDocuments(product.id)
        
        // Separate photos
        const photos = documents
          .filter(d => d.doc_type === 'PHOTO')
          .map(d => d.url)
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          thumbnailUrl: product.thumbnail_url || '',
          sortOrder: product.sort_order,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          documents: documents.map(d => ({
            id: d.id,
            docType: d.doc_type as DocType,
            name: d.name,
            url: d.url,
            sortOrder: d.sort_order
          })),
          photos
        } as Product
      })
    )
    
    return NextResponse.json(productsWithDocs)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body
    
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }
    
    const product = await createProduct({ name, description })
    
    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description || '',
      thumbnailUrl: product.thumbnail_url || '',
      sortOrder: product.sort_order,
      documents: [],
      photos: []
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
