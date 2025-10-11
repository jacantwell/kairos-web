"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { LogoWithText } from "@/lib/components/ui/logo";
import {
  FormField,
  FormLabel,
  FormInput,
  FormError,
} from "@/lib/components/ui/form";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    
    // Clear previous errors
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!userDetails.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!userDetails.password) {
      newErrors.password = "Password is required";
    }
    if (!userDetails.confirmed_password) {
      newErrors.confirmed_password = "Please confirm your password";
    }
    if (!userDetails.name.trim()) {
      newErrors.name = "Display name is required";
    }

    // Validate password match
    if (userDetails.password && userDetails.confirmed_password && 
        userDetails.password !== userDetails.confirmed_password) {
      newErrors.confirmed_password = "Passwords do not match";
    }

    // If there are errors, set them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        router.push("/unverified");
      }
    } catch (error) {
      setErrors({ form: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof userDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserDetails((prev) => ({ ...prev, [field]: e.target.value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="flex justify-center">
          <LogoWithText size="lg" />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.form}
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <FormField>
              <FormLabel htmlFor="email" required>
                Email Address
              </FormLabel>
              <FormInput
                id="email"
                type="email"
                value={userDetails.email}
                onChange={handleChange("email")}
                placeholder="Email address"
                disabled={isLoading}
                error={!!errors.email}
              />
            </FormField>

            {/* Password Field */}
            <FormField>
              <FormLabel htmlFor="password" required>
                Password
              </FormLabel>
              <FormInput
                id="password"
                type="password"
                value={userDetails.password}
                onChange={handleChange("password")}
                placeholder="Password"
                disabled={isLoading}
                error={!!errors.password}
              />
            </FormField>

            {/* Confirm Password Field */}
            <FormField>
              <FormLabel htmlFor="confirmed_password" required>
                Confirm Password
              </FormLabel>
              <FormInput
                id="confirmed_password"
                type="password"
                value={userDetails.confirmed_password}
                onChange={handleChange("confirmed_password")}
                placeholder="Confirm Password"
                disabled={isLoading}
                error={!!errors.confirmed_password}
              />
            </FormField>

            {/* Name Field */}
            <FormField>
              <FormLabel htmlFor="name" required>
                Display Name
              </FormLabel>
              <FormInput
                id="name"
                type="text"
                value={userDetails.name}
                onChange={handleChange("name")}
                placeholder="Display Name"
                disabled={isLoading}
                error={!!errors.name}
              />
            </FormField>

            {/* Phone Number Field */}
            <FormField>
              <FormLabel htmlFor="phonenumber">Phone Number</FormLabel>
              <FormInput
                id="phonenumber"
                type="tel"
                value={userDetails.phonenumber}
                onChange={handleChange("phonenumber")}
                placeholder="Phone Number"
                disabled={isLoading}
              />
            </FormField>

            {/* Instagram Field */}
            <FormField>
              <FormLabel htmlFor="instagram">Instagram</FormLabel>
              <FormInput
                id="instagram"
                type="text"
                value={userDetails.instagram}
                onChange={handleChange("instagram")}
                placeholder="@yourusername"
                disabled={isLoading}
              />
            </FormField>

            {/* Country Field */}
            <FormField>
              <FormLabel htmlFor="country">Country</FormLabel>
              <FormInput
                id="country"
                type="text"
                value={userDetails.country}
                onChange={handleChange("country")}
                placeholder="Country"
                disabled={isLoading}
              />
            </FormField>
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