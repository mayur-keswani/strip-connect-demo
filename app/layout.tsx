import './globals.css';

export const metadata = {
  title: 'Event Booking Demo',
  description: 'A demo application for event booking with Stripe integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
