import './globals.css';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 transition-colors duration-200">
        <UserProvider>
          <ThemeProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
