import { Suspense } from 'react';
import OrderTrackerClient from './OrderTrackerClient';

export default function OrderTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/60">Loading tracker...</div>}>
      <OrderTrackerClient />
    </Suspense>
  );
}
