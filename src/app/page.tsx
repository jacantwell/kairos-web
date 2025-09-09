"use client";

import Link from "next/link";
import { useSession } from "@/lib/context/session";

export default function Home() {
  const { isAuthenticated, user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to Kairos</h1>

        {isAuthenticated ? (
          <div className="text-center sm:text-left">
            <p className="text-lg mb-4">Hello, {user?.username}!</p>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="rounded-full bg-foreground text-background px-6 py-3 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center sm:text-left">
            <p className="text-lg mb-4">Please sign in to continue</p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="rounded-full bg-foreground text-background px-6 py-3 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
