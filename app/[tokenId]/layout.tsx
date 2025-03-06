import { Geist_Mono } from "next/font/google";
import "../globals.css";
import Provider from "../providers/Provider";
import { Metadata } from "next";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const appUrl = "https://clankfaces.com";
export const revalidate = 300;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tokenId: string }>
}): Promise<Metadata> {
    const { tokenId } = await params;

    try {
        // Dynamically set the og-image based on the tokenId
        const ogImageUrl = `${appUrl}/api/og-image?tokenId=${tokenId}`;

        return {
            title: "Clank Faces | Mint your Clank Faces!",
            description: "A Unique Art Algorithm to celebrate the power of Clankers community!",
            openGraph: {
                title: "Clank Faces | Mint your Clank Faces!",
                description: "A Unique Art Algorithm to celebrate the power of Clankers community!",
                url: appUrl,
                type: "website",
                images: [
                    {
                        url: ogImageUrl, // Use the dynamically generated og-image URL
                        width: 1200,
                        height: 600,
                        alt: `Clank Faces #${tokenId}`,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: "Clank Faces | Mint your Clank Faces!",
                description: "A Unique Art Algorithm to celebrate the power of Clankers community!",
                images: [ogImageUrl], // Use the dynamically generated og-image URL
            },
            icons: {
                icon: "/favicon.ico",
            },
            other: {
                "fc:frame": JSON.stringify({
                    version: "next",
                    imageUrl: ogImageUrl, // Use the dynamically generated og-image URL
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
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: "Clank Faces | Mint your Clank Faces!",
            description: 'Failed to load token data',
        };
    }
}

export default function TokenDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${geistMono.variable} antialiased`}>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
