"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/api/hooks/use-api";
import { Logo } from "@/lib/components/ui/logo";
import { Suspense } from "react";

function Verify() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const api = useApi();
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationError("Invalid or missing token.");
        setIsVerifying(false);
        return;
      }
      
      try {
        const response = await api.users.verifyEmailApiV1UsersVerifyEmailGet(
          token
        );
        console.log("Verification response:", response);
        console.log(response);
        if (response.status === 200) {
          console.log("Email verified successfully!");
          router.push("/login");
        } else {
          const errorData = await response;
          setVerificationError(`Verification failed: ${errorData.detail}`);
          setIsVerifying(false);
        }
      } catch (error) {
        console.log("Error during verification:", error);
        setVerificationError("An error occurred during verification.");
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationError("Invalid or missing token.");
      setIsVerifying(false);
    }
  }, [token, api, router]); // Added api and router to dependency array for best practice

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="text-center space-y-4">
          <Logo size="lg" />
        </div>
        <div className="animate-fade-in items-center text-center space-y-6">
          {isVerifying ? (
            <>Verifying...</>
          ) : verificationError ? (
            <p className="text-red-500">{verificationError}</p>
          ) : (
            <p className="text-green-500">Verified! Redirecting...</p>
          )}
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  );
}