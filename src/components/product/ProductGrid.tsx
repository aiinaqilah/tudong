import ProductItem from '@/components/product/ProductItem';
import { Product } from '@/sanity.types';
import React from 'react'

type ProductGridProps = {
    products: Product[];
    favoriteIds?: Set<string>;
    campaignMap?: Map<string, number>;
}

const ProductGrid = ({ products, favoriteIds, campaignMap }: ProductGridProps) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {products.map((product) => (
            <ProductItem
                key={product._id}
                product={product}
                isFavorited={favoriteIds?.has(product._id) ?? false}
                effectivePrice={campaignMap?.get(product._id)}
            />
        ))}
    </div>
  )
}

export default ProductGrid
