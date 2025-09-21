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
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold">{title || "Kairos"}</h1>
          </div>

          <div className="flex items-center gap-4">
            {actions}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
        </div>
      </div>
    </header>
  );
};