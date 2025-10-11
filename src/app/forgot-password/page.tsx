"use client";

import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { Logo } from "@/lib/components/ui/logo";
import { FormField, FormLabel, FormInput } from "@/lib/components/ui/form";

export default function ForgotPasswordPage() {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isFormLoading = isLoading;
  const clearError = () => setErrors({});
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) return;

    // Clear previous errors
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!email) {
      newErrors.email = "Email is required";
      setErrors(newErrors);
      return;
    }

    console.log("Submitting forgot password for email:", email);
    console.log(newErrors);

    clearError();
    setErrors({});
    setIsLoading(true);

    try {
      await api.users.resetPasswordApiV1UsersResetPasswordPost(email);
    } catch (err) {
      // Silently fail for data protection
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  const handleChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    // Clear error for this field when user starts typing
    if (errors.email) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
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
        {isSubmitted ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold font-logo text-shark-500 mb-4">
              Check your email
            </h2>
            <p className="text-grey-500 text-sm">
              If an account with that email exists, we&#39;ve sent a password
              reset link to it.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold font-logo text-shark-500">
                Forgot your password?
              </h2>
              <p className="text-grey-500 text-sm">
                Enter your email address below and we&#39;ll send you a link to
                reset your password.
              </p>
            </div>
            <div className="space-y-4">
              <FormField>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <FormInput
                  id="email"
                  type="text" // Should be email but there are issues with error displaying.
                  value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  onChange={handleChange()}
                  placeholder="Enter your email"
                  disabled={isFormLoading}
                  error={!!errors.email}
                />
              </FormField>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg px-6 py-3 bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Sending email..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
