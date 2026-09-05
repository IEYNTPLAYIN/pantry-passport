import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'

import './globals.css'
import { Providers } from '@/shared/providers'
import type { RootLayoutProps } from '@/types'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'Pantry Passport',
  description:
    'Search packaged food products through an Express API with subscription-aware nutrition access.',
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
