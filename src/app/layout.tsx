import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { CartProvider } from "@/contexts/CartContext";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { getSiteSettings } from "@/lib/get-settings-server";
import JsonLd from "@/components/json-ld";

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
  title: {
    template: '%s | Çelenk Diyarı - 81 İle Aynı Gün Teslimat',
    default: 'Çelenk Diyarı - Türkiye Çelenk Siparişi | İstanbul, Ankara, İzmir Hızlı Gönderim',
  },
  description: "Türkiye'nin en güvenilir online çelenk sipariş sitesi. İstanbul, Ankara, İzmir ve 81 ile aynı gün teslimat. Cenaze, düğün, açılış ve nikah için profesyonel çelenk, ferforje ve çiçek gönderimi. %100 Müşteri Memnuniyeti.",
  keywords: [
    "çelenk siparişi", 
    "çelenk gönder", 
    "online çelenk", 
    "istanbul çelenk siparişi", 
    "ankara çelenk siparişi", 
    "izmir çelenk siparişi",
    "cenaze çelengi", 
    "açılış çelengi", 
    "düğün çelengi", 
    "nikah çelengi",
    "ferforje çelenk",
    "çelenk fiyatları",
    "acil çelenk",
    "çiçek sepeti çelenk",
    "ucuz çelenk"
  ],
  icons: {
    icon: '/images/logo-removebg-preview.png',
    apple: '/images/logo-removebg-preview.png',
    shortcut: '/images/logo-removebg-preview.png'
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://celenkdiyari.com',
  },
  openGraph: {
    title: "Çelenk Diyarı - Türkiye'nin Online Çelenkçisi | 81 İlde Hizmet",
    description: "İstanbul, Ankara, İzmir ve tüm Türkiye'ye aynı gün çelenk teslimatı. Cenaze, açılış ve düğünler için en taze çiçeklerle hazırlanan özel tasarım çelenkler.",
    url: 'https://celenkdiyari.com',
    type: "website",
    locale: "tr_TR",
    siteName: 'Çelenk Diyarı',
    images: [
      {
        url: 'https://celenkdiyari.com/images/categories/açılıştören.jpg',
        width: 1200,
        height: 630,
        alt: 'Çelenk Diyarı - Açılış ve Tören Çelenkleri',
      },
      {
        url: 'https://celenkdiyari.com/images/categories/cenaze.jpg',
        width: 1200,
        height: 630,
        alt: 'Çelenk Diyarı - Cenaze Çelenkleri',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Çelenk Diyarı - 81 İle Çelenk Gönder",
    description: "En taze çiçeklerle hazırlanan cenaze, düğün ve açılış çelenkleri. Türkiye geneli aynı gün teslimat garantisi.",
    images: ['https://celenkdiyari.com/images/categories/açılıştören.jpg'],
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
    google: 'verification_token', // User should replace this
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
        <JsonLd />
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
