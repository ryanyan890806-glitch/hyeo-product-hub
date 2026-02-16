'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'

export default function AdminButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/admin')}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-40"
      title="Admin Dashboard"
    >
      <Settings className="w-5 h-5" />
    </button>
  )
}
