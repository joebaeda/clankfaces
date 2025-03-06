import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./providers/Provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = "https://clankfaces.com";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const ogImageUrl = `${appUrl}/og-image.jpg`;

  return {
    title: "Clank Faces | Mint your Clank Faces!",
    description: "A Unique Art Algorithm to celebrate the power of Clankers community!",
    openGraph: {
      title: "Clank Faces | Mint your Clank Faces!",
      description: "A Unique Art Algorithm to celebrate the power of Clankers community!",
      url: appUrl,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 600,
          alt: 'Mint your Clank Faces!',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Clank Faces | Mint your Clank Faces!",
      description: "A Unique Art Algorithm to celebrate the power of Clankers community!",
      images: [ogImageUrl],
    },
    icons: {
      icon: '/favicon.ico',
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: ogImageUrl,
        button: {
          title: "Mint your CLANKFACES!",
          action: {
            type: "launch_frame",
            name: "Clank Faces",
            url: appUrl,
            splashImageUrl: `${appUrl}/splash.png`,
            splashBackgroundColor: "#1b1423",
          },
        },
      }),
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased bg-[#1b1423]`}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
