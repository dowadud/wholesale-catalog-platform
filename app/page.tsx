import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Wholesale Catalog</h1>
            <Link 
              href="/admin" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Our Wholesale Catalog
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Browse our complete product catalog and place orders directly online. 
            Simple, fast, and efficient wholesale ordering.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogs"
              className="px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
            >
              View Catalogs
            </Link>
            <Link
              href="/order"
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
            >
              Place an Order
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 Wholesale Catalog Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

