import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const manifest = {
    name: "Çelenk Diyarı",
    short_name: "Çelenk Diyarı",
    description: "Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/images/logo-removebg-preview.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/images/logo-removebg-preview.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ],
    categories: ["shopping", "lifestyle"],
    lang: "tr",
    dir: "ltr"
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

