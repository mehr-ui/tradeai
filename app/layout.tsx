import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Trade — AI Assistant',
  description: 'Bold solutions for innovative interior design businesses',
  icons: {
    icon: '/trade-favicon.png',
    shortcut: '/trade-favicon.png',
    apple: '/trade-favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${cormorant.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  )
}
