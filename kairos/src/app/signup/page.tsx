"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { LogoWithText } from "@/lib/components/ui/logo";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();

  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
    name: "",
    phonenumber: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        console.log("Login successful!");
        redirect("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="flex justify-center">
          <LogoWithText variant="primary" size="lg" />
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
