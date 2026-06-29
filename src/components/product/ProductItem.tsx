import { Product } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import FavoriteButton from '@/components/product/FavoriteButton';

type ProductItemProps = {
    product: Product;
    isFavorited?: boolean;
    effectivePrice?: number;
}

const ProductItem = ({ product, isFavorited = false, effectivePrice }: ProductItemProps) => {
  const originalPrice = product.price ?? 0;
  const isOnSale = effectivePrice !== undefined && effectivePrice < originalPrice;
  const displayPrice = isOnSale ? effectivePrice : originalPrice;
  const discountPct = isOnSale
    ? Math.round((1 - effectivePrice / originalPrice) * 100)
    : 0;

  return (
    <div className='bg-white rounded-lg overflow-hidden relative'>
        {/* Badge: sale % or HOT! */}
        <div className='absolute top-2 right-2 z-10'>
            {isOnSale ? (
                <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                    -{discountPct}%
                </span>
            ) : (
                <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce'>
                    HOT!
                </span>
            )}
        </div>

        {/* Favourite button */}
        <div className='absolute top-2 left-2 z-10'>
            <FavoriteButton productId={product._id} isFavorited={isFavorited} size="sm" />
        </div>

        <div className='relative h-48 w-full'>
            {product.image && product.image[0]?.asset && (
                <Image
                    src={urlFor(product.image[0]).width(256).url()}
                    alt={product.title || 'Product Image'}
                    fill
                    className='object-contain p-2'
                    loading='lazy'
                />
            )}
        </div>

        <div className='p-4'>
            <h3 className='text-sm font-medium line-clamp-2 h-10 mb-2'>{product.title}</h3>
            <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                    <span className='text-lg font-bold text-red-500'>{formatPrice(displayPrice)}</span>
                    {isOnSale && (
                        <span className='text-sm text-gray-400 line-through'>{formatPrice(originalPrice)}</span>
                    )}
                </div>
                <Link
                    href={`/product/${product._id}`}
                    className='w-full text-center bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all'
                >
                    GRAB IT NOW!
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ProductItem
