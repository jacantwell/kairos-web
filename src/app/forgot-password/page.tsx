"use client";

import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { Logo } from "@/lib/components/ui/logo";

export default function ForgotPasswordPage() {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.users.resetPasswordApiV1UsersResetPasswordPost(email);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
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
  If an account with that email exists, we&#39;ve sent a password reset
  link to it.
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
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-grey-300 placeholder-grey-400 text-grey-900 rounded-lg focus:outline-none focus:ring-primary-green-500 focus:border-primary-green-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
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
