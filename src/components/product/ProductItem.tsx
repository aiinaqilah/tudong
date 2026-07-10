import { Product } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import { formatPrice, isNewProduct } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import FavoriteButton from '@/components/product/FavoriteButton';
import QuickAddButton from '@/components/product/QuickAddButton';

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
  const isNew = isNewProduct(product._createdAt);

  return (
    <div className='group bg-card border border-border rounded-md overflow-hidden relative transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_rgba(43,36,34,0.18)]'>
        {/* Badges: sale % and/or NEW stacked */}
        <div className='absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5'>
            {isOnSale && (
                <span className='bg-foreground text-background text-[10px] font-medium uppercase tracking-[0.12em] px-2.5 py-1 rounded-full'>
                    -{discountPct}%
                </span>
            )}
            {isNew && (
                <span className='bg-background/90 text-foreground border border-border text-[10px] font-medium uppercase tracking-[0.15em] px-2.5 py-1 rounded-full backdrop-blur-sm'>
                    New
                </span>
            )}
        </div>

        {/* Favourite + quick add-to-cart */}
        <div className='absolute top-3 left-3 z-10 flex items-center gap-1.5'>
            <FavoriteButton productId={product._id} isFavorited={isFavorited} size="sm" />
            <QuickAddButton product={product} effectivePrice={effectivePrice} />
        </div>

        <div className='relative h-52 w-full overflow-hidden bg-secondary/40'>
            {product.image && product.image[0]?.asset && (
                <Image
                    src={urlFor(product.image[0]).width(256).url()}
                    alt={product.title || 'Product Image'}
                    fill
                    className='object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.04]'
                    loading='lazy'
                />
            )}
        </div>

        <div className='p-4'>
            <h3 className='text-sm text-foreground line-clamp-2 h-10 mb-2 leading-snug'>{product.title}</h3>
            <div className='flex flex-col gap-3'>
                <div className='flex items-baseline gap-2'>
                    <span className='text-base font-medium text-foreground'>{formatPrice(displayPrice)}</span>
                    {isOnSale && (
                        <span className='text-sm text-muted-foreground line-through'>{formatPrice(originalPrice)}</span>
                    )}
                </div>
                <Link
                    href={`/product/${product._id}`}
                    className='w-full text-center border border-foreground/80 text-foreground py-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 hover:bg-foreground hover:text-background'
                >
                    View Details
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ProductItem
