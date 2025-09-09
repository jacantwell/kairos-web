"use client";

import Link from "next/link";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { Logo } from "@/lib/components/ui/logo";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const api = useApi();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formDetails, setFormDetails] = useState({
    password: "",
    confirmed_password: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formDetails.password !== formDetails.confirmed_password) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const response =
        await api.users.updatePasswordApiV1UsersUpdatePasswordPost(
          token,
          formDetails.password
        );
      if (response.status === 200) {
        setIsReset(true);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setError(
        "An error occurred while sending the reset email. Please try again."
      );
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
      setIsReset(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="flex justify-center">
          <Logo variant="primary" size="lg" />
        </div>
        {isReset ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold font-logo text-shark-500 mb-4">
              Password reset successful
            </h2>
            <p className="text-grey-500 text-sm">
              You can now log in with your new password.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-primary-green-500 hover:text-primary-green-600 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold font-logo text-shark-500">
                Forgot your password?
              </h2>
              <p className="text-grey-500 text-sm">
                Please enter your new password below.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={formDetails.password}
                  onChange={(e) =>
                    setFormDetails((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                  placeholder="New Password"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={formDetails.confirmed_password}
                  onChange={(e) =>
                    setFormDetails((prev) => ({
                      ...prev,
                      confirmed_password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                  placeholder="Confirm New Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg px-6 py-3 bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Changing password..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
