import SignupForm from './signup-form'
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding/Hero */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Join SiteAgent
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            Build intelligent chatbots that transform your customer experience
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-300 rounded-full mr-3"></div>
              <span className="text-indigo-100">24/7 automated customer support</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-300 rounded-full mr-3"></div>
              <span className="text-indigo-100">Easy integration with your website</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-300 rounded-full mr-3"></div>
              <span className="text-indigo-100">AI-powered conversations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">SiteAgent</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Get started for free
            </h2>
            <p className="text-gray-600">
              Create your account and start building chatbots in minutes
            </p>
          </div>

          <SignupForm />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/contact" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 