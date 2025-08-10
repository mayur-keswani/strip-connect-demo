'use client';

import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useUser();
  const pathname = usePathname();
  
  // Don't show header on login and signup pages
  const hideHeader = pathname === '/login' || pathname === '/signup';
  
  if (hideHeader || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Project Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                Event Booking Demo
              </h1>
            </Link>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user.name || user.email}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
