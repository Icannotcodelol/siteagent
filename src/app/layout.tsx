// Trigger deployment commit
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  title: "SiteAgent",
  description: "Create and manage your custom AI chatbots",
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
