import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface DBProduct {
  id: string
  name: string
  description: string
  thumbnail_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DBDocument {
  id: string
  product_id: string
  doc_type: string
  name: string
  url: string
  sort_order: number
  created_at: string
}

// Product operations
export async function getProducts(): Promise<DBProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getProductWithDocuments(productId: string) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()
  
  if (productError) throw productError

  const { data: documents, error: docError } = await supabase
    .from('product_documents')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  
  if (docError) throw docError

  return { product, documents: documents || [] }
}

export async function createProduct(product: { name: string; description: string }): Promise<DBProduct> {
  // Get max sort order
  const { data: maxOrder } = await supabase
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()
  
  const sortOrder = (maxOrder?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('products')
    .insert([{ 
      name: product.name, 
      description: product.description,
      sort_order: sortOrder
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<DBProduct>) {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function reorderProducts(updates: { id: string; sortOrder: number }[]) {
  for (const update of updates) {
    await supabase
      .from('products')
      .update({ sort_order: update.sortOrder })
      .eq('id', update.id)
  }
}

// Document operations
export async function addDocument(doc: {
  productId: string
  docType: string
  name: string
  url: string
}) {
  // Delete existing document of same type for this product (singleton pattern)
  if (doc.docType !== 'PHOTO') {
    await supabase
      .from('product_documents')
      .delete()
      .eq('product_id', doc.productId)
      .eq('doc_type', doc.docType)
  }

  const { data: maxOrder } = await supabase
    .from('product_documents')
    .select('sort_order')
    .eq('product_id', doc.productId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('product_documents')
    .insert([{
      product_id: doc.productId,
      doc_type: doc.docType,
      name: doc.name,
      url: doc.url,
      sort_order: (maxOrder?.sort_order ?? -1) + 1
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('product_documents')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deletePhotoByUrl(productId: string, url: string) {
  const { error } = await supabase
    .from('product_documents')
    .delete()
    .eq('product_id', productId)
    .eq('url', url)
    .eq('doc_type', 'PHOTO')
  
  if (error) throw error
}

// Admin operations
export async function verifyAdmin(username: string, passwordHash: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('password_hash', passwordHash)
    .single()
  
  if (error || !data) return null
  return data
}
