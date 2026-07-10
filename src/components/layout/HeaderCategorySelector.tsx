import { getAllCategories } from '@/sanity/lib/client';
import Link from 'next/link';
import React from 'react'


const HeaderCategorySelector = async () => {

    const categories = await getAllCategories();

  return (
    <div className='relative inline-block'>
        <button className='peer group flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground'>
            Categories
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:rotate-180"
            >
                <path d="m6 9 6 6 6-6"/>
            </svg>
        </button>

        <div className='absolute top-full left-0 pt-3 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-200'>
            <div className='w-60 bg-background rounded-md shadow-xl border border-border overflow-hidden'>
                <div className='py-1.5'>
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            href={`/category/${category.slug?.current}`}
                            className='block px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors duration-100'
                            prefetch
                        >
                            {category.title}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default HeaderCategorySelector
