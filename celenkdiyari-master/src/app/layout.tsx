import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Dancing_Script, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar";
import { CartProvider } from "@/contexts/CartContext";
import StructuredData from "@/components/structured-data";
import { ErrorBoundary } from "@/components/error-boundary";
import HolidayClosureWrapper from "@/components/holiday-closure-wrapper";

// Lazy load non-critical components
const Footer = dynamic(() => import("@/components/footer"), {
  ssr: true,
  loading: () => <div className="min-h-[200px]" />,
});

const WhatsAppButton = dynamic(() => import("@/components/whatsapp-button"), {
  ssr: true,
  loading: () => null, // No loading state for WhatsApp button
});

// Optimize fonts - use only necessary weights and subsets, reduce font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Reduce initial font loading
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false, // Faster loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["monospace"],
  adjustFontFallback: false,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true, // Critical for headings
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["cursive"],
  adjustFontFallback: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true, // Critical font
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Çelenk Diyarı - Doğanın En Güzel Hali",
    template: "%s | Çelenk Diyarı"
  },
  description: "Çelenk fiyatları ve çelenk gönder hizmeti. Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenkler. Uygun çelenk fiyatları ile profesyonel tasarım ve kaliteli hizmet garantisi. Çelenk gönder, açılış, cenaze, söz nişan çelenkleri.",
  keywords: [
    "çelenk",
    "çelenk fiyatları",
    "çelenk gönder",
    "çelenk siparişi", 
    "cenaze çelenkleri",
    "açılış çelenkleri",
    "ferforje çelenk",
    "ofis bitkileri",
    "söz nişan çelenkleri",
    "fuar stand çelenkleri",
    "çelenk tasarım",
    "çelenk online",
    "çelenk satış",
    "çelenk fiyat",
    "çelenk sipariş",
    "çelenk teslimat",
    "çelenk hizmeti",
    "çelenk gönderimi",
    "ucuz çelenk fiyatları",
    "çelenk fiyat listesi"
  ],
  authors: [{ name: "Çelenk Diyarı", url: "https://www.celenkdiyari.com" }],
  creator: "Çelenk Diyarı",
  publisher: "Çelenk Diyarı",
  applicationName: "Çelenk Diyarı",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.celenkdiyari.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
      'tr': '/',
    },
  },
  openGraph: {
    title: "Çelenk Diyarı - En Uygun Çelenk Fiyatları ile Çelenk Gönder Hizmeti",
    description: "Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenklerimizi en uygun fiyatlarla sunuyoruz. Profesyonel çelenk gönder hizmetimiz ile açılış, cenaze, söz-nişan ve tüm özel anlarınızda yanınızdayız. İstanbul ve tüm Türkiye'ye hızlı teslimat garantisi.",
    url: 'https://www.celenkdiyari.com',
    siteName: 'Çelenk Diyarı',
    images: [
      {
        url: 'https://www.celenkdiyari.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Çelenk Diyarı Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Çelenk Diyarı - En Uygun Çelenk Fiyatları',
    description: 'Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenklerimizi en uygun fiyatlarla sunuyoruz.',
    images: ['https://www.celenkdiyari.com/images/logo.png'],
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
  verification: {
    google: 'googlee27a340e5fc48032',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Meta Charset - Explicitly set for SEO */}
        <meta charSet="utf-8" />
        
        {/* DNS Prefetch for external resources - Critical for performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://api.emailjs.com" />
        
        {/* Preconnect for critical third-party resources */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        
        {/* Manifest - Preload */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon - Optimized with preload */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo-removebg-preview.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo-removebg-preview.png" />
        
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-TileImage" content="/images/logo-removebg-preview.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#16a34a" />
        
        {/* Google Analytics - Load asynchronously after page load */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GZL5ZYDZJ3"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GZL5ZYDZJ3', {
                page_path: window.location.pathname,
                send_page_view: false
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${dancingScript.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <StructuredData />
        <ErrorBoundary>
          <CartProvider>
            <HolidayClosureWrapper />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </ErrorBoundary>
        
        {/* Global Error Handler for Browser Extensions */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalLog = console.log;
                
                const isExtensionMessage = (message) => {
                  return typeof message === 'string' && (
                    message.includes('One Click Image Downloader') || 
                    message.includes('content_script') ||
                    message.includes('7880f8283a6f3daf.js') ||
                    message.includes('b1e8249f0d46c9fe.js') ||
                    message.includes('DebugTmp') ||
                    message.includes('Debug') ||
                    message.includes('画像監視') ||
                    message.includes('DownloadButtonsManager') ||
                    message.includes('TimerEvent') ||
                    message.includes('monitor_start') ||
                    message.includes('timer_tick') ||
                    message.includes('画像検出') ||
                    message.includes('ボタンの相対位置') ||
                    message.includes('画像サイズ') ||
                    message.includes('初期設定データ読み込み完了') ||
                    message.includes('画像監視を開始') ||
                    message.includes('実行 (eventType:') ||
                    message.includes('サイトプロパティ') ||
                    message.includes('SettingData.get received') ||
                    message.includes('subscribeFromContentScript') ||
                    message.includes('handleEnebleRead')
                  );
                };
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (isExtensionMessage(message)) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (isExtensionMessage(message)) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                console.log = function(...args) {
                  const message = args.join(' ');
                  if (isExtensionMessage(message)) {
                    return;
                  }
                  originalLog.apply(console, args);
                };
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
