"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/context/session";
import { redirect } from "next/navigation";
import { Logo, LogoWithText } from "@/lib/components/ui/logo";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/lib/api/hooks/use-api";
import { useEffect } from "react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div className="text-center space-y-4">
          <Logo variant="primary" size="lg" />
        </div>
        <div className="animate-fade-in items-center text-center space-y-6">
          Please check your email to verify your account.
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
