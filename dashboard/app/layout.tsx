import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { SafeWrapper } from '@/components/SafeWrapper'

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
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <SafeWrapper>
              {children}
            </SafeWrapper>
          </main>
        </div>
      </body>
    </html>
  )
}
