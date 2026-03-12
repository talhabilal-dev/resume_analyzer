"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Zap, FileText, TrendingUp, ShoppingCart } from "lucide-react";
import Navbar from "../components/Navbar";

export default function UsagePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user/usage")
        .then((r) => r.json())
        .then((d) => setUsage(d))
        .catch(() => toast.error("Failed to load usage data."))
        .finally(() => setLoading(false));
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Unable to load usage data</p>
      </div>
    );
  }

  const txTypeLabel = {
    initial_grant: "Welcome bonus",
    purchase: "Purchase",
    usage: "Resume analysis",
    refund: "Refund",
    bonus: "Bonus",
  };

  const txColor = {
    initial_grant: "text-blue-400",
    purchase: "text-green-400",
    usage: "text-red-400",
    refund: "text-green-400",
    bonus: "text-purple-400",
  };

  return (
    <>
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-center text-5xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Usage &amp; Credits
          </h1>

          {/* Credit balance */}
          <div className="rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 shadow-xl">
            <p className="text-sm text-gray-400 mb-1">Account</p>
            <p className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-4">
              {usage.email}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-purple-900/30 border border-purple-700/50 p-4 text-center">
                <Zap className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-3xl font-bold text-purple-400">{usage.credits}</p>
                <p className="text-xs text-purple-300 mt-1">Credits</p>
              </div>
              <div className="rounded-xl bg-pink-900/30 border border-pink-700/50 p-4 text-center">
                <FileText className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                <p className="text-3xl font-bold text-pink-400">{usage.analysesRemaining}</p>
                <p className="text-xs text-pink-300 mt-1">Analyses left</p>
              </div>
              <div className="rounded-xl bg-blue-900/30 border border-blue-700/50 p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-3xl font-bold text-blue-400">{usage.creditsPerAnalysis}</p>
                <p className="text-xs text-blue-300 mt-1">Credits / scan</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/purchase"
                className="flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all shadow-lg hover:shadow-purple-500/50"
              >
                <ShoppingCart className="w-4 h-4" /> Buy Credits
              </Link>
              <Link
                href="/upload"
                className={`flex-1 text-center rounded-full border-2 px-6 py-3 font-semibold transition-all hover:scale-105 ${
                  usage.credits >= usage.creditsPerAnalysis
                    ? "border-purple-500 text-white hover:bg-purple-500/10"
                    : "border-gray-600 text-gray-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                Upload Resume
              </Link>
            </div>
          </div>

          {/* Recent transactions */}
          {usage.recentTransactions?.length > 0 && (
            <div className="rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
              <ul className="space-y-3">
                {usage.recentTransactions.map((tx) => (
                  <li key={tx._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-white font-medium">{tx.description || txTypeLabel[tx.type] || tx.type}</p>
                      <p className="text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`font-bold ${txColor[tx.type] ?? "text-gray-300"}`}>
                      {tx.credits > 0 ? "+" : ""}{tx.credits}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
