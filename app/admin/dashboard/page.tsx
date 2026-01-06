'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCatalogs: 0,
    totalOrders: 0,
  })

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin')
    }
    setLoading(false)
  }

  async function fetchStats() {
    try {
      const [catalogsResult, ordersResult] = await Promise.all([
        supabase.from('catalogs').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        totalCatalogs: catalogsResult.count || 0,
        totalOrders: ordersResult.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin')
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome Back</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Catalogs</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.totalCatalogs}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Orders</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/upload"
              className="block p-6 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h4 className="text-xl font-semibold">Upload Catalog</h4>
            </Link>

            <Link
              href="/admin/catalogs"
              className="block p-6 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h4 className="text-xl font-semibold">Manage Catalogs</h4>
            </Link>

            <Link
              href="/admin/orders"
              className="block p-6 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h4 className="text-xl font-semibold">View Orders</h4>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

