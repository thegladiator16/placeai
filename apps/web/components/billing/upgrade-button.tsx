'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { SubscriptionTier } from '@placeai/types';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number | string;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  theme?: { color?: string };
};

type Props = {
  tier: Exclude<SubscriptionTier, 'free'>;
  interval: 'monthly' | 'annual';
  label?: string;
  className?: string;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UpgradeButton({ tier, interval, label = 'Upgrade Now', className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway');

      const orderRes = await fetch('/api/v1/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      });

      const orderJson = await orderRes.json() as {
        success: boolean;
        data?: { orderId: string; amount: number; currency: string; keyId: string; prefill: { name: string; email: string } };
        error?: { message: string };
      };

      if (!orderJson.success || !orderJson.data) {
        throw new Error(orderJson.error?.message ?? 'Failed to create order');
      }

      const { orderId, amount, currency, keyId, prefill } = orderJson.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'PlaceAI',
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan — ${interval}`,
        order_id: orderId,
        prefill,
        theme: { color: '#6C47FF' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/v1/billing/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, tier, interval }),
          });

          const verifyJson = await verifyRes.json() as { success: boolean; data?: { redirectUrl: string }; error?: { message: string } };
          if (verifyJson.success && verifyJson.data?.redirectUrl) {
            window.location.href = verifyJson.data.redirectUrl;
          } else {
            setError(verifyJson.error?.message ?? 'Payment verification failed');
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => void handleUpgrade()}
        disabled={loading}
        className={className ?? 'w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50'}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {label}
      </button>
      {error && <p className="text-xs text-red-500 mt-1.5 text-center">{error}</p>}
    </div>
  );
}
