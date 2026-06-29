import SalesCampaignBanner from '@/components/layout/SalesCampaignBanner';
import ProductGrid from '@/components/product/ProductGrid';
import { getCategoryBySlug, getProductsByCategorySlug, getActiveCampaigns } from '@/sanity/lib/client';
import { getUserFavorites } from '@/actions/favorite-actions';
import { computeCampaignMap } from '@/lib/utils';
import React from 'react';

import { notFound } from 'next/navigation';

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
};
const CategoryPage = async ({ params }: CategoryPageProps) => {
    const { slug } = await params;

    const [category, products, campaigns, favorites] = await Promise.all([
        getCategoryBySlug(slug),
        getProductsByCategorySlug(slug),
        getActiveCampaigns(),
        getUserFavorites(),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.productId));
    const campaignMap = computeCampaignMap(products, campaigns);

    if (!category) {
        notFound();
    }

    return (
        <div>
            <SalesCampaignBanner />

            <div className='bg-red-50 p-4'>
                <div className='container mx-auto'>
                    <h1 className='text-2xl md:text-3xl font-bold text-center text-red-600 mb-2'>{category?.title || 'Category'} - UP TO 90% OFF! 🔥</h1>
                    <p className='text-center text-red-500 text-sm md:text-base animate-pulse'>⚡️ Flash Sale Ending Soon! ⏰ Limited Time Only</p>
                    <p className='text-center text-gray-600 text-xs mt-2'>{category?.description}</p>
                </div>
            </div>

            <div className='bg-yellow-50 py-3'>
                <div className='container mx-auto'>
                    <div className='flex items-center justify-center gap-4 text-sm'>
                        <div className='flex items-center gap-2'>
                            <span className='text-yellow-600'>🚚</span>
                            <span>Free Shipping</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-yellow-600'>⭐️</span>
                            <span>Top Rated</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-yellow-600'>💰</span>
                            <span>Best Prices</span>
                        </div>
                    </div>
                </div>z
            </div>

            <section className='container mx-auto py-8'>
                <div className='text-center mb-8'>
                    <p className='text-sm text-gray-500'>🎉 {products.length} Amazing Deals Available Now!</p>
                </div>

                <ProductGrid products={products} favoriteIds={favoriteIds} campaignMap={campaignMap} />
            </section>
        </div>
    );
};

export default CategoryPage;
