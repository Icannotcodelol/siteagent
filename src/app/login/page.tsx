import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {/* Optional: Add link to Sign Up page later */}
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create an account
            </a>
          </p> */}
        </div>
        <LoginForm />
        <div className="text-sm text-center">
          <a href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  )
} 