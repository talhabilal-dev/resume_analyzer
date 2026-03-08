"use client";

import { SignUp, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/upload");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-4 bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            RESUMIND
          </h1>
          <p className="text-xl text-gray-300">
            Create your account to get started
          </p>
        </div>

        <div className="flex items-center justify-center">
          <SignUp
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "mx-auto",
                card: "bg-gray-900/85 backdrop-blur-xl border border-gray-700 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-300",
                socialButtonsBlockButton:
                  "bg-gray-800 border-gray-600 text-white hover:bg-gray-700",
                socialButtonsBlockButtonText: "text-white",
                dividerLine: "bg-gray-700",
                dividerText: "text-gray-400",
                formFieldLabel: "text-gray-200",
                formFieldInput:
                  "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400",
                formButtonPrimary:
                  "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white hover:opacity-90",
                footerActionText: "text-gray-300",
                footerActionLink:
                  "text-purple-300 hover:text-purple-200 font-medium",
              },
            }}
            fallbackRedirectUrl="/upload"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
