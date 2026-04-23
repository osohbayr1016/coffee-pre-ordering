import { MOCK_SHOPS } from '@/lib/mock-data';
import ShopMenuClient from './ShopMenuClient';

export async function generateStaticParams() {
  return MOCK_SHOPS.map((shop) => ({ slug: shop.slug }));
}

export default async function ShopMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ShopMenuClient slug={slug} />;
}
