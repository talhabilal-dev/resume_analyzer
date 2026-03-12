"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, CreditCard, Info } from "lucide-react";
import Navbar from "../components/Navbar";
import { CREDITS_PER_DOLLAR, MIN_PURCHASE_DOLLARS } from "@/constants";

const QUICK_AMOUNTS = [5, 10, 20, 50];

export default function PurchasePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [amount, setAmount] = useState(10);
  const [customInput, setCustomInput] = useState("10");
  const [currentCredits, setCurrentCredits] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user/usage")
        .then((r) => r.json())
        .then((d) => { if (d.credits !== undefined) setCurrentCredits(d.credits); })
        .catch(() => {});
    }
  }, [isSignedIn]);

  const credits = Math.floor(amount * CREDITS_PER_DOLLAR);
  const analyses = Math.floor(credits / 5); // 5 credits per analysis

  const handleQuick = (val) => {
    setAmount(val);
    setCustomInput(String(val));
  };

  const handleInput = (e) => {
    const raw = e.target.value;
    setCustomInput(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed > 0) setAmount(parsed);
  };

  const handleCheckout = async () => {
    if (amount < MIN_PURCHASE_DOLLARS) {
      toast.error(`Minimum purchase is $${MIN_PURCHASE_DOLLARS}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-4 py-14 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 fill-purple-400" /> Credits
          </div>
          <h1 className="text-5xl font-black bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Buy Credits
          </h1>
          <p className="text-gray-400 text-lg">
            ${1} = {CREDITS_PER_DOLLAR} credits &nbsp;·&nbsp; 5 credits per resume analysis
          </p>
          {currentCredits !== null && (
            <p className="text-gray-500 text-sm mt-1">
              Current balance: <span className="text-purple-400 font-semibold">{currentCredits} credits</span>
            </p>
          )}
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 space-y-7">

          {/* Quick amounts */}
          <div>
            <p className="text-sm text-gray-400 mb-3 font-medium">Quick select</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuick(q)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    amount === q
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white"
                  }`}
                >
                  ${q}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-sm text-gray-400 mb-2 font-medium">Or enter amount</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">$</span>
              <input
                type="number"
                min={MIN_PURCHASE_DOLLARS}
                step="1"
                value={customInput}
                onChange={handleInput}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-8 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            {amount < MIN_PURCHASE_DOLLARS && customInput !== "" && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Minimum is ${MIN_PURCHASE_DOLLARS}
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="text-white font-semibold">${Number(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span className="text-white font-semibold">{CREDITS_PER_DOLLAR} credits / $1</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between">
              <span className="text-gray-300 font-medium">You'll receive</span>
              <span className="text-purple-400 font-black text-lg">
                <Zap className="inline w-4 h-4 fill-purple-400 mb-0.5 mr-0.5" />
                {credits} credits
              </span>
            </div>
            <p className="text-xs text-gray-500 text-right">= {analyses} resume {analyses === 1 ? "analysis" : "analyses"}</p>
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading || amount < MIN_PURCHASE_DOLLARS}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-white bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ${Number(amount).toFixed(2)} · Get {credits} credits
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-600">
            Secured by Stripe · No subscription · Credits never expire
          </p>
        </div>
      </div>
    </div>
  );
}
