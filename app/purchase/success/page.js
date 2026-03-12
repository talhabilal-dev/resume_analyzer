"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, FileText } from "lucide-react";
import Navbar from "../../components/Navbar";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [credits, setCredits] = useState(null);

  // After Stripe redirects back, fetch the updated balance
  useEffect(() => {
    if (!sessionId) {
      router.push("/purchase");
      return;
    }
    // Small delay so the webhook has time to fire
    const t = setTimeout(() => {
      fetch("/api/user/usage")
        .then((r) => r.json())
        .then((d) => { if (d.credits !== undefined) setCredits(d.credits); })
        .catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-black text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400">Your credits have been added to your account.</p>
          </div>

          {/* Balance card */}
          <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
            {credits === null ? (
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <span className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                Updating balance…
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">New credit balance</p>
                <p className="text-5xl font-black bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {credits}
                </p>
                <p className="text-gray-500 text-sm">= {Math.floor(credits / 5)} resume {Math.floor(credits / 5) === 1 ? "analysis" : "analyses"}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/upload"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-white bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/40 text-lg"
            >
              <FileText className="w-5 h-5" /> Analyze a Resume
            </Link>
            <Link
              href="/purchase"
              className="w-full py-3 rounded-full border-2 border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white transition-all font-semibold"
            >
              Buy More Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
