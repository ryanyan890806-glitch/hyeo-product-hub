import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// 腾讯云 COS Client Configuration
const cosClient = new S3Client({
  region: process.env.COS_REGION || 'ap-guangzhou',
  endpoint: `https://cos.${process.env.COS_REGION || 'ap-guangzhou'}.myqcloud.com`,
  credentials: {
    accessKeyId: process.env.COS_SECRET_ID!,
    secretAccessKey: process.env.COS_SECRET_KEY!,
  },
})

const bucketName = process.env.COS_BUCKET_NAME!

export async function uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await cosClient.send(command)

  // 返回腾讯云 COS 公开访问 URL
  return `https://${bucketName}.cos.${process.env.COS_REGION || 'ap-guangzhou'}.myqcloud.com/${key}`
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  await cosClient.send(command)
}

export function generateFileKey(productId: string, docType: string, filename: string): string {
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${productId}/${docType}/${timestamp}-${sanitized}`
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.substring(1)
  } catch {
    return null
  }
}
