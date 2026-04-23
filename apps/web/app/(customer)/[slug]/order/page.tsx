import { MOCK_SHOPS } from '@/lib/mock-data';
import OrderClient from './OrderClient';

export async function generateStaticParams() {
  return MOCK_SHOPS.map((shop) => ({ slug: shop.slug }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <OrderClient slug={slug} />;
}
