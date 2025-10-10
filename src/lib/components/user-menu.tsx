"use client";

import { useSession } from "../context/session-provider";
import { LoadingDots } from "./ui/loading";
import Link from "next/link";

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingDots size="sm" className="absolute bottom-0" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Link
      key={"/profile"}
      href={"/profile"}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Profile
    </Link>
  );
};