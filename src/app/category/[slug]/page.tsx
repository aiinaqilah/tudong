import ProductGrid from '@/components/product/ProductGrid';
import { getCategoryBySlug, getProductsByCategorySlug } from '@/sanity/lib/client';
import { getUserFavorites } from '@/actions/favorite-actions';
import React from 'react';

import { notFound } from 'next/navigation';

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
};
const CategoryPage = async ({ params }: CategoryPageProps) => {
    const { slug } = await params;

    const [category, products, favorites] = await Promise.all([
        getCategoryBySlug(slug),
        getProductsByCategorySlug(slug),
        getUserFavorites(),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.productId));

    if (!category) {
        notFound();
    }

    return (
        <div>
            {/* Category header */}
            <div className='bg-secondary py-12 text-center'>
                <p className='text-muted-foreground text-xs font-medium uppercase tracking-[0.2em] mb-3'>
                    Collection
                </p>
                <h1 className='font-serif text-4xl md:text-5xl tracking-tight text-foreground'>
                    {category?.title || 'Category'}
                </h1>
                {category?.description && (
                    <p className='text-muted-foreground text-sm mt-3 max-w-xl mx-auto px-6'>
                        {category.description}
                    </p>
                )}
                <p className='text-muted-foreground text-sm mt-2'>
                    {products.length} {products.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            <section className='container mx-auto py-10 px-6 sm:px-8'>
                <ProductGrid products={products} favoriteIds={favoriteIds} />
            </section>
        </div>
    );
};

export default CategoryPage;
