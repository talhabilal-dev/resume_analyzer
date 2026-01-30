"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../components/Navbar";

export default function UsagePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchUsage();
    }
  }, [isSignedIn]);

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/user/usage");
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
      toast.error("Failed to load usage data.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Unable to load usage data</p>
      </div>
    );
  }

  const percentage = (usage.uploadsToday / usage.dailyLimit) * 100;
  const remaining = usage.dailyLimit - usage.uploadsToday;
  const resetsIn = new Date(usage.resetsAt) - new Date();
  const hoursUntilReset = Math.floor(resetsIn / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(
    (resetsIn % (1000 * 60 * 60)) / (1000 * 60),
  );

  return (
    <>
      <Navbar />

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative px-4 py-12">
        <div className="relative mx-auto max-w-2xl">
          <h1 className="mb-8 text-center text-5xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Usage Statistics
          </h1>

          <div className="rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
              <div>
                <p className="text-sm text-gray-400">Account</p>
                <p className="text-lg font-semibold text-white">
                  {usage.email}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Daily Upload Limit
                </h2>
                <span className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {usage.uploadsToday} / {usage.dailyLimit}
                </span>
              </div>

              <div className="mb-4 h-4 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-linear-to-r from-purple-500 to-pink-600 transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {usage.canUpload ? (
                    <span className="text-green-400 font-semibold">
                      ✓ {remaining} upload{remaining !== 1 ? "s" : ""} remaining
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold">
                      ✗ Daily limit reached
                    </span>
                  )}
                </span>
                <span className="text-gray-400">
                  Resets in {hoursUntilReset}h {minutesUntilReset}m
                </span>
              </div>
            </div>

            {usage.lastUploadDate && (
              <div className="mb-6 rounded-lg bg-gray-800/50 border border-gray-700 p-4">
                <p className="text-sm text-gray-400">Last Upload</p>
                <p className="font-medium text-white">
                  {new Date(usage.lastUploadDate).toLocaleString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-linear-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/50 p-4 text-center">
                <p className="text-sm text-purple-300">Daily Limit</p>
                <p className="text-3xl font-bold text-purple-400">
                  {usage.dailyLimit}
                </p>
              </div>
              <div className="rounded-lg bg-linear-to-br from-pink-900/30 to-pink-800/30 border border-pink-700/50 p-4 text-center">
                <p className="text-sm text-pink-300">Used Today</p>
                <p className="text-3xl font-bold text-pink-400">
                  {usage.uploadsToday}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push("/upload")}
                disabled={!usage.canUpload}
                className={`flex-1 rounded-full px-6 py-3 font-semibold transition-all ${
                  usage.canUpload
                    ? "bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                    : "cursor-not-allowed bg-gray-700 text-gray-500"
                }`}
              >
                {usage.canUpload ? "Upload Resume" : "Limit Reached"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 rounded-full border-2 border-purple-500 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-500/10 hover:scale-105"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
