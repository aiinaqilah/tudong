import type { Metadata } from 'next';
import './globals.css';

import { Cormorant, Inter } from 'next/font/google';

import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { getAllCategories } from '@/sanity/lib/client';
import HeaderCategorySelector from '@/components/layout/HeaderCategorySelector';
import Cart from '@/components/cart/Cart';

// Elegant serif for the wordmark & headings, clean sans for body/UI.
const serif = Cormorant({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TUDONG.COM — Modest Fashion',
  description: 'Elegant hijabs and modest wear, curated in one place.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getAllCategories();

  return (
    <html lang="en" className={cn(sans.variable, serif.variable)}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Header
          categorySelector={<HeaderCategorySelector />}
          categories={categories}
        />

        {children}

        <Cart />
      </body>
    </html>
  );
}
