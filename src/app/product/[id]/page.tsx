import { getProductById, getRecommendedProducts } from '@/sanity/lib/client';
import { getUserFavorites } from '@/actions/favorite-actions';
import { getEffectivePrice } from '@/lib/utils';
import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';
import ProductRecommendations from '@/components/product/ProductRecommendations';

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const [product, favorites] = await Promise.all([
        getProductById(id),
        getUserFavorites(),
    ]);

    const recommendations = product ? await getRecommendedProducts(product) : [];

    const isFavorited = favorites.some((f) => f.productId === id);
    const effectivePrice = product ? getEffectivePrice(product.price, product.discount) : undefined;

    if (!product?.price) {
        notFound();
    }

    return (
        <div className='bg-background'>
            {/* Breadcrumb Navigation */}
            <div className='bg-card border-b border-border'>
                <div className='container mx-auto py-3 px-4'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Link
                            href='/'
                            className='text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
                        >
                            <Home className='w-4 h-4' />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className='w-4 h-4 text-muted-foreground' />
                        <span className='text-muted-foreground truncate'>
                            {product.title}
                        </span>
                    </div>
                </div>
            </div>

            {/* Client Component for interactive product details */}
            <ProductDetailsClient product={product} isFavorited={isFavorited} effectivePrice={effectivePrice} />

            <ProductRecommendations products={recommendations} />
        </div>
    );
};

export default ProductPage;
