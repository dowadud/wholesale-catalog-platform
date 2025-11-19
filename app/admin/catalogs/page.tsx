'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Catalog } from '@/lib/types'

export default function ManageCatalogsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [catalogs, setCatalogs] = useState<Catalog[]>([])

  useEffect(() => {
    checkAuth()
    fetchCatalogs()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin')
    }
    setLoading(false)
  }

  async function fetchCatalogs() {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCatalogs(data || [])
    } catch (error) {
      console.error('Error fetching catalogs:', error)
    }
  }

  async function handleDelete(catalog: Catalog) {
    if (!confirm(`Are you sure you want to delete "${catalog.title}"?`)) {
      return
    }

    try {
      // Extract file path from URL
      const url = new URL(catalog.file_url)
      const filePath = url.pathname.split('/').slice(-2).join('/')

      // Delete from storage
      await supabase.storage.from('catalogs').remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('catalogs')
        .delete()
        .eq('id', catalog.id)

      if (error) throw error

      alert('Catalog deleted successfully')
      fetchCatalogs()
    } catch (error: any) {
      console.error('Error deleting catalog:', error)
      alert('Failed to delete catalog: ' + error.message)
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
            <h1 className="text-2xl font-bold text-gray-900">Manage Catalogs</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/upload"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Upload New
              </Link>
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {catalogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No catalogs yet.</p>
            <Link
              href="/admin/upload"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Upload Your First Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {catalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="bg-gray-50 p-6 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {catalog.title}
                  </h3>
                  {catalog.category && (
                    <p className="text-sm text-gray-600 mb-2">{catalog.category}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(catalog.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={catalog.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-900 text-gray-900 rounded hover:bg-gray-50 transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(catalog)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

