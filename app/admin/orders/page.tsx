'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Order } from '@/lib/types'
import Papa from 'papaparse'

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const ordersPerPage = 10

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin')
    }
    setLoading(false)
  }

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  function exportToCSV() {
    const csvData = orders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer_name,
      'Email': order.email,
      'Phone': order.phone,
      'Business Name': order.business_name,
      'Items': JSON.stringify(order.items),
      'Order Date': new Date(order.created_at).toLocaleString(),
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(orders.length / ordersPerPage)

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
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <div className="flex space-x-4">
              <button
                onClick={exportToCSV}
                disabled={orders.length === 0}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export to CSV
              </button>
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
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No orders yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
            </div>

            <div className="space-y-4">
              {currentOrders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.customer_name}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {order.business_name}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Email: </span>
                            <span className="text-gray-900">{order.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone: </span>
                            <span className="text-gray-900">{order.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-200 p-6 bg-white">
                      <h4 className="font-semibold text-gray-900 mb-4">Order Items:</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm text-gray-600">Reference: </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.reference_number}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Quantity: </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Notes: </span>
                                <span className="text-sm text-gray-900">
                                  {item.notes || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

