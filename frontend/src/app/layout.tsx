import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SellerProvider } from '@/context/SellerContext';

const outfit = Outfit({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Olist Catalyst - Operations Forecast Dashboard",
  description: "An advanced analytics dashboard for Olist platform operators.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SellerProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </SellerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
