'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function UploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin')
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      alert('Please select a PDF file')
      return
    }

    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `catalogs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('catalogs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('catalogs')
        .getPublicUrl(filePath)

      // Insert catalog record
      const { error: insertError } = await supabase
        .from('catalogs')
        .insert({
          title: formData.title,
          file_url: publicUrl,
          category: formData.category || null,
        })

      if (insertError) throw insertError

      alert('Catalog uploaded successfully!')
      router.push('/admin/catalogs')
    } catch (error: any) {
      console.error('Error uploading catalog:', error)
      alert('Failed to upload catalog: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Upload Catalog</h1>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Catalog Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              id="category"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Spring 2025, Electronics, Apparel"
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              PDF File *
            </label>
            <input
              type="file"
              id="file"
              accept=".pdf"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Catalog'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

