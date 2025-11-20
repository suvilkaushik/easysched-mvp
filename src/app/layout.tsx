import type { Metadata } from "next";
import Navigation, { NavigationWithSync } from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "EasySched CRM",
  description: "AI-powered client management and scheduling platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <ClerkProvider>
          <NavigationWithSync />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
