import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import AuthProvider from "@/components/AuthProvider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Executive Edu - Professional Courses",
  description: "Advanced courses in AI and Digital Transformation for companies.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster position="bottom-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  )
}
