import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeEstate - Premium Real Estate",
  description: "Find your sanctuary. Curated luxury properties for the discerning eye.",
};

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="es" className="h-full">
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          />
        </head>
        <body className="min-h-full bg-clear-day text-nordic font-display antialiased selection:bg-mosque selection:text-white">
          {children}
        </body>
      </html>
    );
  }