'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import PreviewModal from '@/components/PreviewModal'
import AdminButton from '@/components/AdminButton'
import { Product, DocType } from '@/types'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState<{url: string, type: DocType, name: string} | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (doc: {url: string, type: DocType, name: string}, photos?: string[]) => {
    setPreviewDoc(doc)
    if (photos && photos.length > 0) {
      setGalleryPhotos(photos)
    }
  }

  const closePreview = () => {
    setPreviewDoc(null)
    setGalleryPhotos([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
          HYEO Product Hub
        </h1>
        <p className="text-white/60 text-center text-sm md:text-base">
          Product Documentation & Resources
        </p>
      </header>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPreview={handlePreview}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-white/40 py-20">
          No products available
        </div>
      )}

      {/* Admin Button */}
      <AdminButton />

      {/* Preview Modal */}
      {previewDoc && (
        <PreviewModal
          url={previewDoc.url}
          type={previewDoc.type}
          name={previewDoc.name}
          galleryPhotos={galleryPhotos}
          onClose={closePreview}
        />
      )}
    </main>
  )
}
