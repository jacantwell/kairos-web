"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { LogoWithText } from "@/lib/components/ui/logo";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const api = useApi();
  const router = useRouter();

  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
    confirmed_password: "",
    name: "",
    phonenumber: "",
    instagram: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (userDetails.password !== userDetails.confirmed_password) {
      setPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const signupResponse = await api.users.registerUserApiV1UsersRegisterPost(
        {
          name: userDetails.name,
          email: userDetails.email,
          password: userDetails.password,
          phonenumber: userDetails.phonenumber,
          country: userDetails.country,
        }
      );
      if (signupResponse.status == 200) {
        router.push("/unverified");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="flex justify-center">
          <LogoWithText size="lg" />
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={userDetails.password}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={userDetails.confirmed_password}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    confirmed_password: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
            {passwordError && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 00-.993.883L9 10v3a1 1 0 001.993.117L11 13v-3a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {passwordError}
              </div>
            )}
            <div>
              <input
                type="name"
                required
                value={userDetails.name}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Display Name"
              />
            </div>
            <div>
              <input
                type="tel"
                required={false}
                value={userDetails.phonenumber}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    phonenumber: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Phone Number (optional)"
              />
            </div>
            <div>
              <input
                type="text"
                required={false}
                value={userDetails.instagram}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    instagram: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Instagram (optional)"
              />
            </div>
            <div>
              <input
                type="text"
                required={false}
                value={userDetails.country}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                placeholder="Country (optional)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg px-6 py-3 bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
