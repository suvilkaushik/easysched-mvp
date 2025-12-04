import type { Metadata } from "next";
import { NavigationWithSync } from "@/components/Navigation";
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
      <ClerkProvider>
        <body className="antialiased min-h-screen bg-gradient-to-br from-[#00085f] via-[#4f5fff] to-[#56009c] text-slate-100">
          <div className="flex min-h-screen">
            {/* Left sidebar */}
            <NavigationWithSync />

            {/* Main area */}
            <div className="flex flex-1 flex-col">
              <main className="flex-1 px-4 sm:px-8 py-8">{children}</main>
              <Footer />
            </div>
          </div>
        </body>
      </ClerkProvider>
    </html>
  );
}
