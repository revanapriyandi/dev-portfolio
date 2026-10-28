import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/a11y";
import "@/styles/globals.scss";
import { ReactNode } from "react";
import { personalData } from "@/utils/data/personal-data";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const title = `${personalData.name} — ${personalData.designation}`;
const shareImage = { url: "/og.png", width: 1200, height: 630, alt: title };

export const metadata: Metadata = {
  metadataBase: new URL(personalData.siteUrl),
  applicationName: personalData.name,
  title: {
    default: title,
    template: `%s · ${personalData.name}`,
  },
  description: personalData.description,
  keywords: personalData.keywords,
  authors: [{ name: personalData.name, url: personalData.siteUrl }],
  creator: personalData.name,
  publisher: personalData.name,
  category: "technology",
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  openGraph: {
    type: "profile",
    url: "/",
    siteName: personalData.name,
    title,
    description: personalData.description,
    locale: "en_US",
    alternateLocale: ["id_ID"],
    firstName: "Revan",
    lastName: "Apriyandi",
    username: personalData.username,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: personalData.description,
    images: [shareImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Revan",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// schema.org Person so search engines can build a knowledge panel for the name
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: personalData.name,
  alternateName: "Revan Apriyandi",
  url: personalData.siteUrl,
  image: `${personalData.siteUrl}/profile-hud.webp`,
  jobTitle: personalData.designation,
  description: personalData.description,
  email: `mailto:${personalData.contact.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Universitas Borobudur" },
  knowsAbout: ["Laravel", "React", "Next.js", "TypeScript", "PHP", "Android", "PostgreSQL", "MySQL", "Redis"],
  sameAs: [
    personalData.socialLinks.github,
    personalData.socialLinks.linkedIn,
    personalData.socialLinks.fastwork,
    personalData.socialLinks.stackOverflow,
    personalData.socialLinks.instagram,
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const gtmId = process.env.NEXT_PUBLIC_GTM || "";
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* before first paint: apply a saved light-theme choice (dark is the default) and flag the first-visit splash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement;if(localStorage.getItem("theme")==="light")d.dataset.theme="light";if(!sessionStorage.getItem("splash")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.splash="1"}catch(e){}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>

      <body className={`${display.variable} ${mono.variable} font-sans`}>
        <ToastContainer theme="dark" />
        {children}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Analytics />
        <Script
          id="gtag-inline"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BTG8VW8BFT');
          `,
          }}
        />
      </body>
    </html>
  );
}
