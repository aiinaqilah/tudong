'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/src/components/product/AddToCartButton';
import FavoriteButton from '@/components/product/FavoriteButton';
import { PortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Portable Text components (customize as needed)
const portableTextComponents: PortableTextComponents = {
    block: {
        normal: ({ children }) => <p className="mb-4 text-gray-600">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-red-500 pl-4 italic my-4">{children}</blockquote>
        ),
    },
    list: {
        bullet: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
    },
    listItem: {
        bullet: ({ children }) => <li className="mb-1">{children}</li>,
        number: ({ children }) => <li className="mb-1">{children}</li>,
    },
    marks: {
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        link: ({ value, children }) => {
            const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
            return (
                <a href={value?.href} target={target} className="text-red-600 hover:underline">
                    {children}
                </a>
            );
        },
    },
};

// Gallery Component (handles image selection and navigation)
const ProductGallery = ({ images, title }: { images: any[]; title: string }) => {
    const [selectedImage, setSelectedImage] = useState<number>(0);

    const nextImage = () => {
        setSelectedImage((prev: number) => (prev + 1) % images.length);
    };

    const previousImage = () => {
        setSelectedImage((prev: number) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className='flex flex-col gap-4'>
            {/* Main Image with Arrows */}
            <div className='relative group'>
                <div className='bg-white rounded-2xl p-4 aspect-square overflow-hidden shadow-lg'>
                    <div className='relative aspect-square'>
                        <Image
                            fill
                            priority
                            className='object-cover transition-transform duration-300'
                            alt={title ?? 'Product Image'}
                            src={urlFor(images[selectedImage]).url()}
                        />
                    </div>
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            onClick={previousImage}
                            className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110'
                            aria-label="Previous image"
                        >
                            <ChevronLeft className='w-6 h-6 text-gray-800' />
                        </button>
                        <button
                            onClick={nextImage}
                            className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110'
                            aria-label="Next image"
                        >
                            <ChevronRight className='w-6 h-6 text-gray-800' />
                        </button>
                        <div className='absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-lg text-sm font-medium'>
                            {selectedImage + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className='grid grid-cols-4 gap-4'>
                    {images.map((image: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`
                                relative aspect-square rounded-lg overflow-hidden bg-white shadow-md
                                transition-all duration-200
                                ${
                                    selectedImage === index
                                        ? 'ring-2 ring-red-500 scale-95 shadow-lg'
                                        : 'ring-1 ring-gray-200 hover:ring-red-300 hover:scale-95'
                                }
                            `}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                fill
                                className='object-cover'
                                alt={`${title} - Image ${index + 1}`}
                                src={urlFor(image).url()}
                                sizes='(max-width: 768px) 25vw, 10vw'
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main Client Component
const ProductDetailsClient = ({ product, isFavorited = false, effectivePrice }: { product: any; isFavorited?: boolean; effectivePrice?: number }) => {
    const originalPrice = product.price as number;
    const isOnSale = effectivePrice !== undefined && effectivePrice < originalPrice;
    const displayPrice = isOnSale ? effectivePrice : originalPrice;
    const discountPct = isOnSale ? Math.round((1 - effectivePrice / originalPrice) * 100) : 0;

    return (
        <div className='container mx-auto py-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Image Gallery */}
                {product.image && product.image.length > 0 && (
                    <ProductGallery images={product.image} title={product.title} />
                )}

                {/* Product Information */}
                <div className='flex flex-col gap-4'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
                        {product.title}
                    </h1>

                    {/* Description (supports Portable Text or plain text) */}
                    <div className='text-gray-600 prose prose-sm max-w-none'>
                        {Array.isArray(product.description) ? (
                            <PortableText value={product.description} components={portableTextComponents} />
                        ) : (
                            <p>{product.description}</p>
                        )}s
                    </div>

                    {/* Price Section */}
                    <div className='flex flex-col gap-2 mt-4'>
                        <div className='flex items-center gap-3'>
                            <div className='flex items-baseline gap-1'>
                                <span className='text-xl font-bold text-red-600'>RM</span>
                                <span className='text-5xl font-black text-red-600 tracking-tight'>
                                    {displayPrice.toFixed(2)}
                                </span>
                            </div>
                            {isOnSale && (
                                <div className='flex flex-col'>
                                    <span className='text-lg text-gray-400 line-through decoration-red-500/50 decoration-2'>
                                        {formatPrice(originalPrice)}
                                    </span>
                                    <div className='flex items-center gap-2'>
                                        <span className='bg-red-600 text-white px-2 py-0.5 rounded text-sm font-bold'>
                                            -{discountPct}%
                                        </span>
                                        <span className='text-red-600 font-bold text-sm'>ON SALE</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isOnSale && (
                            <div className='flex items-center gap-2 bg-red-50 p-2 rounded-lg'>
                                <span className='text-red-600 font-bold'>💰</span>
                                <span className='text-red-600 font-medium text-sm'>
                                    You save {formatPrice(originalPrice - effectivePrice!)}!
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Add to Cart + Favourite */}
                    <AddToCartButton product={product} effectivePrice={effectivePrice} />
                    <FavoriteButton
                        productId={product._id}
                        isFavorited={isFavorited}
                        size="lg"
                    />

                    {/* Shipping / Guarantee Details */}
                    <div className='flex flex-col gap-3 mt-6 text-sm bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                        <div className='flex items-center gap-3 text-gray-700'>
                            <span className='bg-green-100 p-2 rounded-full'>✅</span>
                            <span className='font-medium'>In stock - Ships within 24 hours</span>
                        </div>
                        <div className='flex items-center gap-3 text-gray-700'>
                            <span className='bg-green-100 p-2 rounded-full'>🔄</span>
                            <span className='font-medium'>30-day money-back guarantee</span>
                        </div>
                        <div className='flex items-center gap-3 text-gray-700'>
                            <span className='bg-green-100 p-2 rounded-full'>🛡️</span>
                            <span className='font-medium'>Secure payment processing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsClient;