import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function getEducator(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      stripeAccountId: true,
      paypalAccountId: true,
      customDomain: true,
    },
  });
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'EDUCATOR') {
    redirect('/auth/login');
  }

  const educator = await getEducator(session.user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="input-field"
                defaultValue={educator?.name || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                defaultValue={educator?.email || ''}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Payment Integration */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Payment Integration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Account
              </label>
              {educator?.stripeAccountId ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓ Connected</span>
                  <span className="text-sm text-gray-500">
                    ({educator.stripeAccountId})
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Connect your Stripe account to receive payments
                  </p>
                  <button className="btn-primary">Connect Stripe</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PayPal Account
              </label>
              {educator?.paypalAccountId ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓ Connected</span>
                  <span className="text-sm text-gray-500">
                    ({educator.paypalAccountId})
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Connect your PayPal account to receive payments
                  </p>
                  <button className="btn-primary">Connect PayPal</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Domain */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Custom Domain</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              type="text"
              className="input-field mb-2"
              placeholder="courses.yourdomain.com"
              defaultValue={educator?.customDomain || ''}
              disabled
            />
            <p className="text-sm text-gray-500">
              Connect your custom domain to build your brand
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
