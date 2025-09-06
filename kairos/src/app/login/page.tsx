"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { Logo, LogoWithText } from "@/lib/components/ui/logo";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useSession();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(credentials);
    if (success) {
      console.log("Login successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="text-center space-y-4">
          <Logo variant="primary" size="lg" />
          <h2 className="text-2xl font-bold font-logo text-shark-500">
            Welcome back to Kairos
          </h2>
          <p className="text-grey-500 text-sm">
            Connect with fellow bikepackers on the road
          </p>
        </div>

        <div className="animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-grey-600 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-grey-600 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-grey-300 text-primary-green-600 focus:ring-primary-green-500"
                />
                <span className="text-grey-600">Remember me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-primary-green-600 hover:text-primary-green-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg px-6 py-3 bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-grey-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-grey-500">
                  New to Kairos?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/signup"
                className="w-full text-center inline-block rounded-lg px-6 py-3 bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 focus:ring-2 focus:ring-offset-2 transition-colors"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-grey-500">
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="text-primary-green-600 hover:text-primary-green-700"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-primary-green-600 hover:text-primary-green-700"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
