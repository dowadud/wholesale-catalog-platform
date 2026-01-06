'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface OrderItem {
  reference_number: string
  quantity: string
  notes: string
}

export default function OrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    business_name: '',
  })
  const [items, setItems] = useState<OrderItem[]>([
    { reference_number: '', quantity: '', notes: '' }
  ])

  const addItem = () => {
    setItems([...items, { reference_number: '', quantity: '', notes: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Filter out empty items
      const validItems = items.filter(
        item => item.reference_number.trim() && item.quantity.trim()
      ).map(item => ({
        reference_number: item.reference_number,
        quantity: parseInt(item.quantity),
        notes: item.notes || ''
      }))

      if (validItems.length === 0) {
        alert('Please add at least one item with reference number and quantity')
        setLoading(false)
        return
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: validItems,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      router.push('/thank-you')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Failed to submit order. Please try again.')
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
              href="/catalogs"
              className="px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Catalogs
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Place an Order</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="business_name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Item {index + 1}</h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Reference Number *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={item.reference_number}
                        onChange={(e) => updateItem(index, 'reference_number', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={item.notes}
                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-4 px-6 py-2 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

