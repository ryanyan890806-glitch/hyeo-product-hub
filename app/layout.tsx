import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HYEO Product Hub',
  description: 'Product documentation and resources',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="hyeo-watermark" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
