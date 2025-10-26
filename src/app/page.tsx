import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sell Your Online Courses
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The simplest, most affordable platform for solo educators.
            Zero transaction fees. Just a fair subscription.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register?role=educator" className="btn-primary text-lg px-8 py-3">
              Start Teaching
            </Link>
            <Link href="/auth/register?role=student" className="btn-secondary text-lg px-8 py-3">
              Start Learning
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Easy Course Creation</h3>
            <p className="text-gray-600">
              Drag-and-drop interface to organize your content. Upload videos, PDFs, and more.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Direct Payments</h3>
            <p className="text-gray-600">
              Connect your Stripe or PayPal. Money goes directly to you. No transaction fees.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Simple Analytics</h3>
            <p className="text-gray-600">
              Track revenue, student progress, and course completion at a glance.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Already have an account?</p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
