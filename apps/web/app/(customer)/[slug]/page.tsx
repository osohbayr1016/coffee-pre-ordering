import { buildShopSlugParams } from '@/lib/build-shop-slugs';
import ShopMenuClient from './ShopMenuClient';

export async function generateStaticParams() {
  return buildShopSlugParams();
}

export default async function ShopMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ShopMenuClient slug={slug} />;
}
