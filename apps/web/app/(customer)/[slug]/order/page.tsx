import { Suspense } from 'react';
import { MOCK_SHOPS } from '@/lib/mock-data';
import OrderClient from './OrderClient';

export async function generateStaticParams() {
  return MOCK_SHOPS.map((shop) => ({ slug: shop.slug }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/60">Loading...</div>}>
      <OrderClient slug={slug} />
    </Suspense>
  );
}
