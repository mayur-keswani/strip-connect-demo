import './globals.css';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';

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
      <body className="antialiased">
        <UserProvider>
          <Header />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
