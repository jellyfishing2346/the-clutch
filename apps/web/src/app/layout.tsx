import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clutch — Hyperlocal Community Help',
  description: 'Connect with neighbors for everyday tasks. Post or find help for errands, moving, tech support, and more — right in your neighborhood.',
  keywords: ['community', 'local help', 'neighborhood', 'tasks', 'NYC', 'hyperlocal'],
  openGraph: {
    title: 'Clutch',
    description: 'Neighbors helping neighbors.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
