import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from '@/contexts/AuthContext'
import AppHeader from '@/app/components/auth/AppHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Missing Atilio',
  description: 'Recordá los 11 de Atilio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <AppHeader />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
