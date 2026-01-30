"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploader from "../components/FileUploader";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume first");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobTitle", jobTitle);
      formData.append("companyName", companyName);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to analyze resume");
        throw new Error(data.error || "Failed to analyze resume");
      }

      toast.success("Resume analyzed successfully!");

      // Navigate to results page with the analysis ID from database
      router.push(`/results/${data.analysisId}`);
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Upload Your Resume
              </h1>
              <p className="text-lg text-gray-300">
                Get AI-powered feedback to improve your resume
              </p>
            </div>
            <button
              onClick={() => router.push("/history")}
              className="px-4 py-2 text-white border-2 border-purple-500 rounded-lg hover:bg-purple-500/10 transition-all"
            >
              View History
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 space-y-6">
            {/* Optional job details */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Frontend Developer"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* File uploader */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resume (PDF)
              </label>
              <FileUploader onFileSelect={setFile} />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
