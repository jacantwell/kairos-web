"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/context/session-provider";
import { useRouter } from "next/navigation";
import { Logo } from "@/lib/components/ui/logo";
import { LoadingSpinner } from "@/lib/components/ui/loading";
import * as EmailValidator from "email-validator";
import { FormField, FormLabel, FormInput } from "@/lib/components/ui/form";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useSession();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isLoading) return;

    // Clear previous errors
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (credentials.email && !EmailValidator.validate(credentials.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    }

    // If there are errors, set them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    clearError();
    setErrors({});
    setIsSubmitting(true);

    try {
      const success = await login(credentials);
      if (success) {
        router.push("/home");
      } else {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      // Set error on both fields for failed login
      setErrors({
        email: "Invalid email or password",
        password: "Invalid email or password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof typeof credentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Clear form-level error when user starts typing
      if (errors.form) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.form;
          return newErrors;
        });
      }

      // Clear session error when user starts typing
      if (error) clearError();
    };

  const isFormLoading = isSubmitting || isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="text-center space-y-4">
          <Logo size="lg" />
          <h2 className="text-2xl font-bold font-logo text-shark-500">
            Welcome back to Kairos
          </h2>
          <p className="text-grey-500 text-sm">
            Connect with fellow bikepackers on the road
          </p>
        </div>

        <div className="animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Session Error (from API) */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Form-level Error (from local validation) */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1">{errors.form}</span>
                <button
                  type="button"
                  onClick={() => setErrors({})}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <FormField>
                <FormLabel htmlFor="email">
                  Email address
                </FormLabel>
                <FormInput
                  id="email"
                  type="text" // Should be email but there are issues with error displaying.
                  value={credentials.email}
                  onChange={handleChange("email")}
                  placeholder="Enter your email"
                  disabled={isFormLoading}
                  error={!!errors.email}
                />
              </FormField>

              {/* Password Field */}
              <FormField>
                <FormLabel htmlFor="password">
                  Password
                </FormLabel>
                <FormInput
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange("password")}
                  placeholder="Enter your password"
                  disabled={isFormLoading}
                  error={!!errors.password}
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={isFormLoading}
                  className="rounded border-grey-300 text-primary-green-600 focus:ring-primary-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span
                  className={`text-grey-600 ${
                    isFormLoading ? "opacity-50" : ""
                  }`}
                >
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className={`text-primary-green-600 hover:text-primary-green-700 font-medium transition-colors ${
                  isFormLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full rounded-lg px-6 py-3 bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {isFormLoading ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Signing in...</span>
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
                className={`w-full text-center inline-block rounded-lg px-6 py-3 bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 focus:ring-2 focus:ring-offset-2 transition-colors ${
                  isFormLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-grey-500">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className={`text-primary-green-600 hover:text-primary-green-700 transition-colors ${
              isFormLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className={`text-primary-green-600 hover:text-primary-green-700 transition-colors ${
              isFormLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
