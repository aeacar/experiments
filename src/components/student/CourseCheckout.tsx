'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function CourseCheckout({ courseId }: { courseId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const handleCheckout = async () => {
    if (!session?.user) {
      router.push('/auth/login?from=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, discountCode }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discount Code (optional)
        </label>
        <input
          type="text"
          placeholder="Enter code"
          className="input-field"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
        />
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full btn-primary text-lg py-3"
      >
        {loading ? 'Processing...' : 'Enroll Now'}
      </button>
      {!session && (
        <p className="text-sm text-gray-600 text-center">
          You&apos;ll be asked to sign in to complete your purchase
        </p>
      )}
    </div>
  );
}
