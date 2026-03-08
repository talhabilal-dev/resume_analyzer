import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RESUMIND - AI Resume Analyzer",
  description: "Get AI-powered feedback on your resume with advanced analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider
          appearance={{
            cssLayerName: "clerk",
            theme: dark,
            variables: {
              colorPrimary: "#a855f7",
            },
          }}
        >
          <main>{children}</main>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
