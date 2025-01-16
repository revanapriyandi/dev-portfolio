import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/card.scss";
import "@/styles/globals.scss";
import { ReactNode } from "react";
import { personalData } from "@/utils/data/personal-data";
import { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/panel/sidebar";
import { cn } from "@/utils/util";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    applicationName: "Dashboard Portfolio " + personalData.designation,
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
    robots: "no index, follow",
};
interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" dir="ltr">
            <body className={inter.className}>
                <ClerkProvider>
                    <ToastContainer />
                    <div
                        className={cn(
                            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800  flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen w-screen",
                        )}
                    >
                        <DashboardSidebar />
                        {children}
                    </div>
                </ClerkProvider>
            </body>
        </html>
    )
}