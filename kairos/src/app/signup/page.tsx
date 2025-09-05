"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";

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
        { name: userDetails.name, email: userDetails.email, password: userDetails.password, phonenumber: userDetails.phonenumber, country: userDetails.country },
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register now
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails((prev) => ({ ...prev, email: e.target.value }))
                }
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Display Name"
              />
            </div>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Country (optional)"
              />
            </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-foreground text-background w-full px-6 py-3 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
