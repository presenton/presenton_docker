import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces, Montserrat, Inria_Serif, Roboto, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fraunces",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-montserrat",
});
const inria_serif = Inria_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inria-serif",
});

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-sans",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://presenton.ai"),
  title: "Presenton.ai - AI Presentation Maker for Data Storytelling",
  description:
    "Turn complex data into stunning, interactive presentations with Presenton.ai. Create professional slides from reports and analytics in minutes. Try now!",
  keywords: [
    "AI presentation maker",
    "data storytelling",
    "data visualization tool",
    "AI data presentation",
    "presentation generator",
    "data to presentation",
    "interactive presentations",
    "professional slides",
  ],
  openGraph: {
    title: "Presenton.ai - AI-Powered Data Presentations",
    description:
      "Transform data into engaging presentations effortlessly with Presenton.ai, your go-to AI tool for stunning slides and data storytelling.",
    url: "https://presenton.ai",
    siteName: "Presenton.ai",
    images: [
      {
        url: "https://presenton.ai/presenton-feature-graphics.png",
        width: 1200,
        height: 630,
        alt: "Presenton.ai Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://presenton.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Presenton.ai - AI Presentation Maker for Data Storytelling",
    description:
      "Create stunning presentations from data with Presenton.ai. Simplify reports and analytics into interactive slides fast!",
    images: ["https://presenton.ai/presenton-feature-graphics.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`$ ${inter.variable} ${fraunces.variable} ${montserrat.variable} ${inria_serif.variable} ${roboto.variable} ${instrument_sans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
