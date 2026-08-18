import './global.css'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'precisionFDA Documentation',
    template: '%s | precisionFDA Documentation',
  },
  description: 'Guides, tutorials, and reference documentation for the precisionFDA platform.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider search={{ options: { api: '/docs/api/search' } }} theme={{ defaultTheme: 'light' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
