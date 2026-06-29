import SalesCampaignBanner from '@/components/layout/SalesCampaignBanner';
import { getProductById, getActiveCampaigns } from '@/sanity/lib/client';
import { getUserFavorites } from '@/actions/favorite-actions';
import { computeCampaignMap } from '@/lib/utils';
import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductDetailsClient from './ProductDetailsClient';

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const [product, campaigns, favorites] = await Promise.all([
        getProductById(id),
        getActiveCampaigns(),
        getUserFavorites(),
    ]);

    const isFavorited = favorites.some((f) => f.productId === id);
    const campaignMap = product ? computeCampaignMap([product], campaigns) : new Map<string, number>();
    const effectivePrice = campaignMap.get(id);

    if (!product?.price) {
        return <div className="container mx-auto py-8 text-center">Product not found</div>;
    }

    return (
        <div className='bg-gray-50'>
            <SalesCampaignBanner />

            {/* Breadcrumb Navigation */}
            <div className='bg-white border-b border-gray-200'>
                <div className='container mx-auto py-3 px-4'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Link
                            href='/'
                            className='text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1'
                        >
                            <Home className='w-4 h-4' />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className='w-4 h-4 text-gray-400' />
                        <span className='text-gray-400 truncate'>
                            {product.title}
                        </span>
                    </div>
                </div>
            </div>

            {/* Guarantee Items */}
            <div className='bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 py-4'>
                <div className='container mx-auto'>
                    <div className='flex flex-wrap items-center justify-center gap-6 text-sm'>
                        <div className='flex items-center gap-2'>
                            <span className='text-yellow-600 text-xl'>🚚</span>
                            <span className='font-medium'>Express Shipping</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-yellow-600 text-xl'>✨</span>
                            <span className='font-medium'>Satisfaction Guaranteed</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-yellow-600 text-xl'>🔒</span>
                            <span className='font-medium'>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Component for interactive product details */}
            <ProductDetailsClient product={product} isFavorited={isFavorited} effectivePrice={effectivePrice} />
        </div>
    );
};

export default ProductPage;