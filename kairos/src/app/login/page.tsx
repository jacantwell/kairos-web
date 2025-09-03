"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/context/session";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useSession();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(credentials);
    if (success) {
      // User will be redirected by the session context or navigation
      console.log("Login successful!");
      redirect("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-foreground text-background w-full px-6 py-3 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <p className="text-lg mb-4">Or click here to sign up</p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-foreground text-background px-6 py-3 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
