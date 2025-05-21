// Trigger deployment commit
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  title: {
    default: "Add AI Chatbot to Your Website Easily | SiteAgent",
    template: "%s | SiteAgent",
  },
  description: "Easily add a custom AI chatbot to your website with SiteAgent. Boost engagement, automate support, and integrate with your data. No coding required to start.",
  openGraph: {
    title: "Add an AI Chatbot to Your Website | SiteAgent",
    description: "Discover how to quickly add an intelligent AI chatbot to your website using SiteAgent. Enhance user experience and automate tasks.",
    url: "https://siteagent.eu",
    siteName: "SiteAgent",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SiteAgent - Add AI Chatbot to Website",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add AI Chatbot to Website | SiteAgent",
    description: "Learn how to add a powerful AI chatbot to your website in minutes with SiteAgent. Improve customer interaction and support.",
    images: ["/og-image.png"],
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
  // icons: { // Optional: Add favicons
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },
  // manifest: "/site.webmanifest", // Optional: Path to your web app manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager - Global site tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-P056NB8EH7"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-P056NB8EH7');
            `,
          }}
        />
        {/* DataFast Analytics Script */}
        <Script
          defer
          data-website-id="682e196bcf3d65067036c6f7"
          data-domain="siteagent.eu"
          src="/js/script.js" // Proxied source
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-gray-950`}
      >
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
