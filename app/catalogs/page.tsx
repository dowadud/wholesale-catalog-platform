'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Catalog } from '@/lib/types'

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)

  useEffect(() => {
    fetchCatalogs()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Wholesale Catalog
            </Link>
            <Link
              href="/order"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Place Order
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Product Catalogs</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading catalogs...</p>
          </div>
        ) : catalogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No catalogs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPdf(catalog.file_url)}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {catalog.title}
                </h3>
                {catalog.category && (
                  <p className="text-sm text-gray-600 mb-4">{catalog.category}</p>
                )}
                <p className="text-sm text-gray-500">
                  Added: {new Date(catalog.created_at).toLocaleDateString()}
                </p>
                <button className="mt-4 w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors">
                  View PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">PDF Viewer</h2>
              <button
                onClick={() => setSelectedPdf(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedPdf}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

