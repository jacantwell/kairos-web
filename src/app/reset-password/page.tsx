"use client";

import Link from "next/link";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { Logo } from "@/lib/components/ui/logo";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingScreen } from "@/lib/components/ui/loading";
import {
  FormField,
  FormInput,
  FormLabel,
  FormError,
} from "@/lib/components/ui/form";
function ForgotPassword() {
  const api = useApi();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formDetails, setFormDetails] = useState({
    password: "",
    confirmed_password: "",
  });
  const [isReset, setIsReset] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Clear previous errors
    const newErrors: Record<string, string> = {};

    // Validate the passwords match
    if (formDetails.password !== formDetails.confirmed_password) {
      newErrors.confirmed_password = "Passwords do not match";
    }

    // If there are errors, set them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response =
        await api.users.updatePasswordApiV1UsersUpdatePasswordPost(
          token,
          formDetails.password
        );
      if (response.status === 200) {
        setIsReset(true);
        return;
      } else {
        setErrors({
          password: "Failed to reset password. Please try again.",
        });
      }
    } catch (err) {
      setErrors({
        password: "Failed to reset password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof typeof formDetails) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormDetails((prev) => ({ ...prev, [field]: e.target.value }));

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
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="flex justify-center">
          <Logo size="lg" />
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
              <FormField>
                <FormLabel htmlFor="password">New Password</FormLabel>
                <FormInput
                  id="password"
                  type="password"
                  value={formDetails.password}
                  onChange={handleChange("password")}
                  placeholder="New Password"
                  error={!!errors.password}
                />
              </FormField>
            </div>
            <div className="space-y-4">
              <FormField>
                <FormLabel htmlFor="password">Confirm Password</FormLabel>
                <FormInput
                  id="password"
                  type="password"
                  value={formDetails.confirmed_password}
                  onChange={handleChange("confirmed_password")}
                  placeholder="Confirm New Password"
                  error={!!errors.confirmed_password}
                />
              </FormField>
              {errors.confirmed_password && (
                <FormError>{errors.confirmed_password}</FormError>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg px-6 py-3 bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Changing password..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ForgotPassword />
    </Suspense>
  );
}
