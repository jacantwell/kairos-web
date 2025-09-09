// kairos/src/lib/components/navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";

interface NavigationProps {
  title?: string;
  actions?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ title, actions }) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", label: "Map", icon: "🗺️" },
    { href: "/journeys", label: "Journeys", icon: "🚴" },
  ];

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold">{title || "Kairos"}</h1>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-green-100 text-primary-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {actions}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex space-x-1 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-green-100 text-primary-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};