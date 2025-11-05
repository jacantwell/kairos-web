"use client";

import Link from "next/link";
import { Logo } from "@/lib/components/ui/logo";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-10 text-center animate-fade-in">
        <div className="space-y-4">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold font-logo text-shark-500">
            Welcome to Kairos
          </h1>
          <p className="text-grey-500 text-sm">
            The app that helps bikepackers connect, share journeys, and meet on the road.
          </p>
        </div>

        <div className="space-y-6 text-grey-600 text-left">
          <div className="bg-grey-50 border border-grey-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-shark-600">Plan Your Journey</h3>
            <p className="text-sm">
              Create your own bikepacking route by adding journey points for your past or upcoming trips.
            </p>
          </div>

          <div className="bg-grey-50 border border-grey-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-shark-600">Discover Fellow Travellers</h3>
            <p className="text-sm">
              See other riders’ journeys nearby on the map and find those heading in a similar direction.
            </p>
          </div>

          <div className="bg-grey-50 border border-grey-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-shark-600">Connect and Ride Together</h3>
            <p className="text-sm">
              View profiles of nearby riders and send messages to coordinate meetups or share tips from the road.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/signup"
            className="w-full inline-block rounded-lg px-6 py-3 bg-primary-green-500 text-white text-center font-medium hover:bg-primary-green-600 focus:ring-primary-green-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
          >
            Get Started
          </Link>

          <p className="text-sm text-grey-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-green-600 hover:text-primary-green-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-grey-400">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-primary-green-600 hover:text-primary-green-700 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-primary-green-600 hover:text-primary-green-700 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
