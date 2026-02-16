'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Plus, LogOut, ChevronUp, ChevronDown, Trash2, 
  Upload, X, Image, FileText, Box, Video, FileBox,
  GripVertical
} from 'lucide-react'
import { Product, DocType, DocTypeLabels, DocTypeOrder } from '@/types'

interface AdminDashboardProps {
  onLogout: () => void
}

const DocTypeIcons: Record<DocType, React.ReactNode> = {
  [DocType.TECHNICAL_MANUAL]: <FileText className="w-4 h-4" />,
  [DocType.USER_MANUAL]: <FileBox className="w-4 h-4" />,
  [DocType.MODEL_3D]: <Box className="w-4 h-4" />,
  [DocType.PRODUCT_VIDEO]: <Video className="w-4 h-4" />,
  [DocType.PHOTO]: <Image className="w-4 h-4" />
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [videoUrlInput, setVideoUrlInput] = useState<{productId: string, open: boolean}>({productId: '', open: false})
  const [newProduct, setNewProduct] = useState({ name: '', description: '' })
  const [videoUrl, setVideoUrl] = useState('')

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

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })

      if (res.ok) {
        setNewProduct({ name: '', description: '' })
        setShowAddModal(false)
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleMoveProduct = async (id: string, direction: 'up' | 'down') => {
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === products.length - 1) return

    const newProducts = [...products]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap
   ;[newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]]
    
    // Update sort orders
    const updates = newProducts.map((p, i) => ({ id: p.id, sortOrder: i }))
    
    try {
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })
      fetchProducts()
    } catch (error) {
      console.error('Failed to reorder:', error)
    }
  }

  const handleFileUpload = async (productId: string, docType: DocType, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)
    formData.append('productId', productId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleVideoUrlSubmit = async () => {
    if (!videoUrl.trim() || !videoUrlInput.productId) return

    try {
      const res = await fetch('/api/products/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: videoUrlInput.productId,
          docType: DocType.PRODUCT_VIDEO,
          name: 'Product Video',
          url: videoUrl
        })
      })

      if (res.ok) {
        setVideoUrl('')
        setVideoUrlInput({ productId: '', open: false })
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to add video:', error)
    }
  }

  const handleDeletePhoto = async (productId: string, photoUrl: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/photo`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photoUrl })
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const handleThumbnailUpload = async (productId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'thumbnail')
    formData.append('productId', productId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Thumbnail upload failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Manage products and documents</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Products List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {products.map((product, index) => (
          <AdminProductCard
            key={product.id}
            product={product}
            index={index}
            total={products.length}
            onMoveUp={() => handleMoveProduct(product.id, 'up')}
            onMoveDown={() => handleMoveProduct(product.id, 'down')}
            onDelete={() => setDeleteConfirm(product.id)}
            onFileUpload={handleFileUpload}
            onThumbnailUpload={handleThumbnailUpload}
            onVideoUrlClick={() => setVideoUrlInput({ productId: product.id, open: true })}
            onDeletePhoto={handleDeletePhoto}
          />
        ))}

        {products.length === 0 && (
          <div className="text-center text-white/40 py-20">
            No products yet. Click "Add Product" to get started.
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add New Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 h-24 resize-none"
                  placeholder="Enter product description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-lg glass hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.name.trim()}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-white/60 mb-6">This action cannot be undone. All associated files will be removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-lg glass hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video URL Input Modal */}
      {videoUrlInput.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setVideoUrlInput({ productId: '', open: false })} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Video URL</h3>
            <p className="text-white/60 text-sm mb-4">Enter a direct link to the video file (MP4, WebM, etc.)</p>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 mb-4"
              placeholder="https://example.com/video.mp4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setVideoUrlInput({ productId: '', open: false })}
                className="flex-1 py-3 rounded-lg glass hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVideoUrlSubmit}
                disabled={!videoUrl.trim()}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Admin Product Card Component
interface AdminProductCardProps {
  product: Product
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onFileUpload: (productId: string, docType: DocType, file: File) => void
  onThumbnailUpload: (productId: string, file: File) => void
  onVideoUrlClick: () => void
  onDeletePhoto: (productId: string, url: string) => void
}

function AdminProductCard({
  product,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  onFileUpload,
  onThumbnailUpload,
  onVideoUrlClick,
  onDeletePhoto
}: AdminProductCardProps) {
  const [draggingPhoto, setDraggingPhoto] = useState<number | null>(null)

  const docsByType = product.documents?.reduce((acc, doc) => {
    if (!acc[doc.docType]) acc[doc.docType] = []
    acc[doc.docType].push(doc)
    return acc
  }, {} as Record<DocType, typeof product.documents>) || {}

  const photos = product.photos || product.documents
    ?.filter(d => d.docType === DocType.PHOTO)
    .map(d => d.url) || []

  const handlePhotoDragStart = (idx: number) => {
    setDraggingPhoto(idx)
  }

  const handlePhotoDrop = (targetIdx: number) => {
    if (draggingPhoto === null) return
    // In a real implementation, you'd update the sort order in the database
    setDraggingPhoto(null)
  }

  return (
    <div className="glass-dark rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Thumbnail */}
        <div className="relative w-full md:w-48 flex-shrink-0">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/20 to-black/40">
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <Image className="w-8 h-8" />
              </div>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
            <span className="text-white text-sm font-medium">Change Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onThumbnailUpload(product.id, e.target.files[0])}
            />
          </label>
        </div>

        {/* Product Info & Documents */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{product.name}</h3>
              {product.description && (
                <p className="text-white/60 text-sm mt-1 line-clamp-2">{product.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onMoveUp}
                disabled={index === 0}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={index === total - 1}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Upload Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DocTypeOrder.map((docType) => {
              const docs = docsByType[docType]
              const hasDoc = docs && docs.length > 0
              const isVideo = docType === DocType.PRODUCT_VIDEO
              const isPhoto = docType === DocType.PHOTO

              return (
                <div key={docType} className="glass rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                    {DocTypeIcons[docType]}
                    <span>{DocTypeLabels[docType]}</span>
                  </div>

                  {isPhoto ? (
                    // Photo Gallery
                    <div className="space-y-2">
                      {photos.length > 0 && (
                        <div className="grid grid-cols-4 gap-1">
                          {photos.map((photo, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={() => handlePhotoDragStart(idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handlePhotoDrop(idx)}
                              className="relative aspect-square rounded overflow-hidden group"
                            >
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => onDeletePhoto(product.id, photo)}
                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-white/20 hover:border-white/40 text-white/60 hover:text-white text-sm cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        Add Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            Array.from(e.target.files || []).forEach(file => {
                              onFileUpload(product.id, DocType.PHOTO, file)
                            })
                          }}
                        />
                      </label>
                    </div>
                  ) : isVideo ? (
                    // Video - URL Input or File
                    <div className="space-y-2">
                      {hasDoc ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <Video className="w-4 h-4" />
                          <span className="truncate">{docs[0].name}</span>
                        </div>
                      ) : (
                        <div className="text-white/40 text-sm">No video</div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs cursor-pointer transition-colors">
                          <Upload className="w-3 h-3" />
                          Upload
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && onFileUpload(product.id, docType, e.target.files[0])}
                          />
                        </label>
                        <button
                          onClick={onVideoUrlClick}
                          className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                        >
                          URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Other Document Types
                    <div className="space-y-2">
                      {hasDoc ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          {DocTypeIcons[docType]}
                          <span className="truncate">{docs[0].name}</span>
                        </div>
                      ) : (
                        <div className="text-white/40 text-sm">No file</div>
                      )}
                      <label className="flex items-center justify-center gap-2 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" />
                        {hasDoc ? 'Replace' : 'Upload'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && onFileUpload(product.id, docType, e.target.files[0])}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
