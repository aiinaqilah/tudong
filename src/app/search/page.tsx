// import SalesCampaignBanner from '@/components/layout/SalesCampaignBanner';
import ProductGrid from '@/components/product/ProductGrid';
import { searchProducts, getActiveCampaigns } from '@/sanity/lib/client';
import { getUserFavorites } from '@/actions/favorite-actions';
import { computeCampaignMap } from '@/lib/utils';
import React from 'react';

type SearchPageProps = {
    searchParams: Promise<{ query: string }>;
};
const SearchPage = async ({ searchParams }: SearchPageProps) => {
    const { query } = await searchParams;

    const [products, campaigns, favorites] = await Promise.all([
        searchProducts(query),
        getActiveCampaigns(),
        getUserFavorites(),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.productId));
    const campaignMap = computeCampaignMap(products, campaigns);

    return (
        <div>
            {/* <SalesCampaignBanner /> */}

            <div className='bg-red-50 p-4'>
                <div className='container mx-auto'>
                    <h1 className='text-2xl md:text-3xl font-bold text-center text-red-600 mb-2'>
                        Search Results for &quot;{query}&quot;
                    </h1>
                    <p className='text-center text-gray-600 text-xs mt-2'>
                        Discover amazing deals matching your search
                    </p>
                </div>
            </div>

            <section className='container mx-auto py-8'>
                <div className='text-center mb-8'>
                    <p className='text-sm text-gray-500'> {products.length} Products Found </p>
                </div>

                <ProductGrid products={products} favoriteIds={favoriteIds} campaignMap={campaignMap} />
            </section>
        </div>
    );
};

export default SearchPage;
