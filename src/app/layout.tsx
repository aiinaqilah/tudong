import type { Metadata } from 'next';
import './globals.css';

import { Montserrat } from 'next/font/google';
import { Cormorant } from 'next/font/google';

import Header from '@/components/layout/Header';
import Script from 'next/script';
import { Suspense } from 'react';
// import { SanityLive } from '@/sanity/lib/live';
// import HeaderCategorySelector from '@/components/layout/HeaderCategorySelector';
// import Cart from '@/components/cart/Cart';
// import AnalyticsTracker from '@/components/layout/AnalyticsTracker';

const montserrat = Montserrat({ subsets: ['latin'] });
const cormorant = Cormorant({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Your Store Name',
    description: 'Welcome to your ecommerce store',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased bg-white min-h-[125vh]`}>
        <Header/>
        
        {children}
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