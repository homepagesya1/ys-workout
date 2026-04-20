import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YS.Workout',
  description: 'Track your workouts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}