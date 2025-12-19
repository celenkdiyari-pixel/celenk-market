import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { CartProvider } from "@/contexts/CartContext";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { getSiteSettings } from "@/lib/get-settings-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Çelenk Diyarı - Doğanın En Güzel Hali",
  description: "Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenkler. Açılış, düğün, cenaze ve özel günler için profesyonel çelenk siparişi.",
  keywords: ["çelenk", "çiçek", "açılış çelengi", "cenaze çelengi", "düğün çelengi", "istanbul çiçekçi", "online çelenk"],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Çelenk Diyarı - Doğanın En Güzel Hali",
    description: "Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenkler.",
    type: "website",
    locale: "tr_TR",
    siteName: 'Çelenk Diyarı',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Çelenk Diyarı",
    description: "Doğanın en güzel hali kapınızda.",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a', // green-600
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="tr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
        style={{
          fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        <CartProvider>
          <MaintenanceGuard settings={settings}>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </MaintenanceGuard>
        </CartProvider>
      </body>
    </html>
  );
}
