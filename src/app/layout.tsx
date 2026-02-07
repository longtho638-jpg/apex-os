import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { JsonLdProvider } from '@/components/seo/JsonLd';
import { ClientOnly } from '@/components/ui/client-only';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL('https://apexrebate.com'),
    title: {
        default: "ApexOS - AI-Powered Crypto Trading Automation",
        template: "%s | ApexOS"
    },
    description: "Maximize your trading profits with ApexOS. AI-driven signals, automated risk management, and real-time market analysis for crypto traders.",
    keywords: ["crypto trading", "ai trading", "trading bot", "crypto signals", "automated trading"],
    authors: [{ name: "ApexOS Team" }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://apexrebate.com',
        siteName: 'ApexOS',
        images: [
            {
                url: 'https://apexrebate.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'ApexOS AI Trading'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        site: '@apexos',
        creator: '@apexos'
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

import { TelegramProvider } from '@/components/providers/TelegramProvider';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { LazyMotionProvider } from '@/components/motion/lazy-motion-provider';
import { PageTransition } from '@/components/motion/page-transition';

// ... imports

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <JsonLdProvider />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased notranslate`} suppressHydrationWarning>
                {/* Telegram script disabled for localhost debugging */}
                <Web3Provider>
                    <ClientOnly>
                        <TelegramProvider>
                            <LazyMotionProvider>
                                <PageTransition>
                                    {children}
                                </PageTransition>
                            </LazyMotionProvider>
                        </TelegramProvider>
                    </ClientOnly>
                </Web3Provider>
            </body>
        </html>
    );
}