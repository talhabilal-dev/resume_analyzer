"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import Navbar from "./components/Navbar";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      {isSignedIn && <Navbar />}
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 pt-20">
          <div className="inline-block mb-6">
            <div className="relative">
              <h1 className="text-7xl md:text-8xl font-black mb-4 bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                RESUMIND
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"></div>
            </div>
          </div>

          <p className="text-3xl md:text-4xl font-bold text-gray-300 mb-4">
            AI-Powered Resume Analysis
          </p>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your resume with cutting-edge AI technology. Get instant,
            detailed feedback and stand out in the job market.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <Link
                href="/upload"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-linear-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Analyze Your Resume</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-linear-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Get Started Free</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-purple-500 rounded-full hover:bg-purple-500/10 transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-sm text-gray-400 mt-1">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-linear-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                &lt;10s
              </div>
              <div className="text-sm text-gray-400 mt-1">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI
              </div>
              <div className="text-sm text-gray-400 mt-1">Powered</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 rounded-3xl hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              Comprehensive Analysis
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Deep dive into tone, content, structure, and skills with
              actionable insights
            </p>
          </div>

          <div className="group bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 rounded-3xl hover:border-pink-500 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              Instant Results
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Powered by Google Gemini AI for lightning-fast and accurate
              analysis
            </p>
          </div>

          <div className="group bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 rounded-3xl hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
              💡
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              Actionable Tips
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Get specific, personalized recommendations to boost your resume
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-12 mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-linear-to-br from-purple-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50"></div>
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Upload</h3>
              <p className="text-gray-400">
                Upload your resume in PDF format securely
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-linear-to-br from-pink-600 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-pink-600 to-blue-600 rounded-2xl blur-xl opacity-50"></div>
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Analyze</h3>
              <p className="text-gray-400">
                AI analyzes your resume in seconds
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-linear-to-br from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Improve</h3>
              <p className="text-gray-400">
                Get detailed feedback and level up
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-linear-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Elevate Your Resume?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of job seekers who improved their resumes with AI
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-linear-to-r from-purple-600 to-pink-600 rounded-full hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
