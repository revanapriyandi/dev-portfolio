import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/card.scss";
import "@/styles/globals.scss";
import { ReactNode } from "react";  // Import ReactNode for typing children
import { personalData } from "@/utils/data/personal-data";
import { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  applicationName: "Portfolio " + personalData.designation,
  title: {
    default: personalData.name,
    template: "%s - " + personalData.designation,
  },
  description: personalData.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: personalData.name,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  authors: {
    url: personalData.socialLinks.github,
    name: personalData.username,
  },
  keywords: personalData.keywords,
  creator: personalData.username,
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#16f2b3",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const gtmId = process.env.NEXT_PUBLIC_GTM || '';
  if (!gtmId) {
    console.error('GTM ID is missing!');
  }
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <ToastContainer />
        {children}
      </body>
      <GoogleTagManager gtmId={gtmId} />
    </html>
  );
}
