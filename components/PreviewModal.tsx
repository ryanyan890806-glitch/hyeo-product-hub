'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react'
import { DocType } from '@/types'

interface PreviewModalProps {
  url: string
  type: DocType
  name: string
  galleryPhotos?: string[]
  onClose: () => void
}

export default function PreviewModal({ url, type, name, galleryPhotos = [], onClose }: PreviewModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const isGallery = type === DocType.PHOTO && galleryPhotos.length > 1
  const photos = isGallery ? galleryPhotos : [url]
  const currentUrl = photos[currentPhotoIndex]

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const isPDF = currentUrl?.toLowerCase().endsWith('.pdf') || name?.toLowerCase().endsWith('.pdf')
  const isVideo = type === DocType.PRODUCT_VIDEO || currentUrl?.match(/\.(mp4|mov|webm)$/i)
  const isImage = type === DocType.PHOTO || currentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-white font-medium truncate pr-4">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Open in new tab */}
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            {/* Download */}
            <a
              href={currentUrl}
              download
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-black/40">
          {isPDF ? (
            <div className="w-full h-[60vh]">
              <object
                data={currentUrl}
                type="application/pdf"
                className="w-full h-full rounded-lg"
              >
                <div className="text-center text-white/60 py-20">
                  <p>Unable to preview PDF</p>
                  <a 
                    href={currentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline mt-2 inline-block"
                  >
                    Open in browser
                  </a>
                </div>
              </object>
            </div>
          ) : isVideo ? (
            <video
              src={currentUrl}
              controls
              className="max-w-full max-h-[60vh] rounded-lg"
              autoPlay
            />
          ) : isImage ? (
            <img
              src={currentUrl}
              alt={name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-white/60 py-20">
              <p>Preview not available for this file type</p>
              <a 
                href={currentUrl} 
                download
                className="text-blue-400 hover:underline mt-2 inline-block"
              >
                Download file
              </a>
            </div>
          )}
        </div>

        {/* Gallery Navigation */}
        {isGallery && (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevPhoto}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm">
                {currentPhotoIndex + 1} / {photos.length}
              </span>
              <button
                onClick={nextPhoto}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${index === currentPhotoIndex 
                      ? 'border-blue-500 opacity-100' 
                      : 'border-transparent opacity-50 hover:opacity-80'
                    }
                  `}
                >
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
