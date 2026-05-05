import { Suspense } from 'react';
import { buildShopSlugParams } from '@/lib/build-shop-slugs';
import OrderClient from './OrderClient';

export async function generateStaticParams() {
  return buildShopSlugParams();
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/60">Loading...</div>}>
      <OrderClient slug={slug} />
    </Suspense>
  );
}
