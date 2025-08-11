import Link from 'next/link';
import { CalendarDaysIcon, TicketIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Choose your role to get started
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RoleCard
            href="/host"
            title="Host Dashboard"
            description="Create New Events"
            gradientFrom="indigo-50"
            gradientTo="indigo-100"
            iconColor="indigo-600"
            Icon={CalendarDaysIcon}
          />
          <RoleCard
            href="/events"
            title="Events"
            description="Browse and book events"
            gradientFrom="purple-50"
            gradientTo="purple-100"
            iconColor="purple-600"
            Icon={TicketIcon}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  href,
  title,
  description,
  gradientFrom,
  gradientTo,
  iconColor,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  Icon: React.ComponentType<{ className: string }>;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`bg-${gradientTo} rounded-xl p-3 group-hover:bg-opacity-60 transition duration-300`}>
              {/* <Icon className={`h-6 w-6 text-${iconColor} group-hover:scale-110 transition-transform duration-300`} /> */}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
