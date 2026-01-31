import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Trading Bot Dashboard',
  description: 'Market sentiment analysis and automated trading',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#f0f4f8] dark:bg-slate-900 min-h-screen`}>
        <Header />
        <Sidebar />
        <main className="ml-64 pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
