import type { Metadata } from 'next';
import './globals.css';

import { Montserrat, Inter, EB_Garamond } from 'next/font/google';
import { Cormorant } from 'next/font/google';

import Header from '@/components/layout/Header';
import Script from 'next/script';
import { Suspense } from 'react';
import { cn } from "@/lib/utils";
import { getCurrentSession } from '@/actions/auth';
import { getAllCategories } from '@/sanity/lib/client';
import HeaderCategorySelector from '@/components/layout/HeaderCategorySelector';

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const ebGaramond = EB_Garamond({subsets:['latin'],variable:'--font-serif'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


import Cart from '@/components/cart/Cart';

const montserrat = Montserrat({ subsets: ['latin'] });
const cormorant = Cormorant({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Your Store Name',
    description: 'Welcome to your ecommerce store',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const { user } = await getCurrentSession();

  const categories = await getAllCategories();

  return (
    <html lang="en" className={cn( inter.variable, "font-serif", ebGaramond.variable, montserratHeading.variable)}>
      <body className={`${montserrat.className} antialiased bg-white min-h-[125vh]`}>
        <Header 
              
            categorySelector={<HeaderCategorySelector />}
        />
        
        {children}

        <Cart />
      </body>
    </html>
  )
}

// export default function RootLayout({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     return (
//         <html lang="en">
//             <head>
//                 <Script
//                     src="https://cloud.umami.is/script.js"
//                     data-website-id="YOUR_UMAMI_WEBSITE_ID"
//                     strategy="beforeInteractive"
//                 />
//             </head>
//             <body className={`${montserrat.className} antialiased bg-white min-h-screen`}>
//                 {/* Header is a client component that handles its own session management */}
//                 <Header />

//                 {/* Suspense boundaries for async components */}
//                 <Suspense fallback={<div>Loading...</div>}>
//                     {children}
//                 </Suspense>

//                 {/* Uncomment when ready */}
//                 {/* <Cart /> */}
//                 {/* <SanityLive /> */}
//             </body>
//         </html>
//     );
// }