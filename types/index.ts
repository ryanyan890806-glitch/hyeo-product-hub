export enum DocType {
  TECHNICAL_MANUAL = 'TECHNICAL_MANUAL',
  USER_MANUAL = 'USER_MANUAL',
  MODEL_3D = '3D_MODEL',
  PRODUCT_VIDEO = 'PRODUCT_VIDEO',
  PHOTO = 'PHOTO'
}

export interface Document {
  id: string
  docType: DocType
  name: string
  url: string
  sortOrder: number
}

export interface Product {
  id: string
  name: string
  description: string
  thumbnailUrl: string
  sortOrder: number
  documents: Document[]
  photos?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductInput {
  name: string
  description: string
  thumbnailUrl?: string
}

export const DocTypeLabels: Record<DocType, string> = {
  [DocType.TECHNICAL_MANUAL]: 'Technical Manual',
  [DocType.USER_MANUAL]: 'User Manual',
  [DocType.MODEL_3D]: '3D Model',
  [DocType.PRODUCT_VIDEO]: 'Product Video',
  [DocType.PHOTO]: 'Photo Gallery'
}

export const DocTypeOrder = [
  DocType.TECHNICAL_MANUAL,
  DocType.USER_MANUAL,
  DocType.MODEL_3D,
  DocType.PRODUCT_VIDEO,
  DocType.PHOTO
]
