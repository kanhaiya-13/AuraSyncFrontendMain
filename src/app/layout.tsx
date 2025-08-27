import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from '../components/Footer';
import FlowController from '../components/FlowController';

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuraSync - AI-Powered Fashion Analysis & Style Recommendations",
  description: "Discover your unique fashion personality with AuraSync's AI-powered body analysis, face shape detection, skin tone analysis, and personalized style recommendations. Get expert fashion advice tailored to your body type, personality, and preferences.",
  keywords: [
    "fashion analysis",
    "body type detection",
    "face shape analysis",
    "skin tone analysis",
    "personalized fashion",
    "style recommendations",
    "AI fashion",
    "fashion personality",
    "body shape analysis",
    "fashion advice",
    "personal styling",
    "fashion technology"
  ],
  authors: [{ name: "AuraSync Team" }],
  creator: "AuraSync",
  publisher: "AuraSync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aurasync.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AuraSync - AI-Powered Fashion Analysis & Style Recommendations",
    description: "Discover your unique fashion personality with AI-powered analysis. Get personalized style recommendations based on your body type, face shape, and personality.",
    url: 'https://aurasync.com',
    siteName: 'AuraSync',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AuraSync Fashion Analysis Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AuraSync - AI-Powered Fashion Analysis",
    description: "Discover your unique fashion personality with AI-powered analysis and personalized style recommendations.",
    images: ['/hero-image.jpg'],
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="bg-black text-white flex flex-col min-h-screen">
        <FlowController>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </FlowController>
      </body>
    </html>
  );
}
