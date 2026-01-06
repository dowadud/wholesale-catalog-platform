import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-16 w-16 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Thank You for Your Order!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          We've received your order and will process it shortly. 
          You'll receive a confirmation email soon.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Back to Home
          </Link>
          <Link
            href="/catalogs"
            className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View Catalogs
          </Link>
        </div>
      </div>
    </div>
  )
}

