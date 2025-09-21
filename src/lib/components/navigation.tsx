"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, CircleArrowLeft } from "lucide-react";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/home") return "Map";
    if (pathname === "/profile") return "Profile";
    return "Kairos";
  };

  const getBackLink = () => {
    if (pathname === "/profile") return "/home";
    return "/home"; // Default back to home
  };

  const showBackButton = pathname !== "/home";
  const showProfileButton = pathname !== "/profile";

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-3 items-center h-14 sm:h-16">
          {/* Left: Back button */}
          <div className="flex justify-start">
            {showBackButton ? (
              <Link
                href={getBackLink()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <CircleArrowLeft className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            ) : null}
          </div>

          {/* Center: Title */}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
            {getPageTitle()}
          </h1>

          {/* Right: Profile button */}
          <div className="flex justify-end">
            {showProfileButton ? (
              <Link
                href={"/profile"}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-sm font-medium">Profile</span>
                <CircleUserRound className="w-5 h-5 ml-1" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
