'use client'

import { FileText, Box, Video, Image, FileBox } from 'lucide-react'
import { Product, DocType, DocTypeLabels, DocTypeOrder } from '@/types'

interface ProductCardProps {
  product: Product
  onPreview: (doc: {url: string, type: DocType, name: string}, photos?: string[]) => void
}

const DocTypeIcons: Record<DocType, React.ReactNode> = {
  [DocType.TECHNICAL_MANUAL]: <FileText className="w-4 h-4" />,
  [DocType.USER_MANUAL]: <FileBox className="w-4 h-4" />,
  [DocType.MODEL_3D]: <Box className="w-4 h-4" />,
  [DocType.PRODUCT_VIDEO]: <Video className="w-4 h-4" />,
  [DocType.PHOTO]: <Image className="w-4 h-4" />
}

export default function ProductCard({ product, onPreview }: ProductCardProps) {
  // Group documents by type
  const docsByType = product.documents?.reduce((acc, doc) => {
    if (!acc[doc.docType]) acc[doc.docType] = []
    acc[doc.docType].push(doc)
    return acc
  }, {} as Record<DocType, typeof product.documents>) || {}

  // Get photos for gallery
  const photos = product.photos || product.documents
    ?.filter(d => d.docType === DocType.PHOTO)
    .map(d => d.url) || []

  const handleDocClick = (docType: DocType) => {
    const docs = docsByType[docType]
    if (!docs || docs.length === 0) return

    if (docType === DocType.PHOTO && photos.length > 0) {
      // Open gallery
      onPreview({
        url: photos[0],
        type: docType,
        name: `${product.name} - Photos (${photos.length})`
      }, photos)
    } else {
      // Preview single file
      const doc = docs[0]
      onPreview({
        url: doc.url,
        type: docType,
        name: doc.name
      })
    }
  }

  return (
    <div className="glass-dark rounded-xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
      {/* Product Image - 3:4 Aspect Ratio */}
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-black/40">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <Image className="w-16 h-16" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Document Buttons - Minimalist Grid */}
        <div className="grid grid-cols-2 gap-2">
          {DocTypeOrder.map((docType) => {
            const docs = docsByType[docType]
            const hasDoc = docs && docs.length > 0
            const isPhoto = docType === DocType.PHOTO
            const count = isPhoto ? photos.length : (docs?.length || 0)

            return (
              <button
                key={docType}
                onClick={() => hasDoc && handleDocClick(docType)}
                disabled={!hasDoc}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                  transition-all duration-200 border
                  ${hasDoc
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/50'
                    : 'border-white/5 bg-white/5 text-white/30 cursor-not-allowed'
                  }
                `}
              >
                {DocTypeIcons[docType]}
                <span className="flex-1 text-left truncate">
                  {DocTypeLabels[docType]}
                </span>
                {isPhoto && count > 0 && (
                  <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
