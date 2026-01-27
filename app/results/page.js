"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Summary from "../components/Summary";
import Details from "../components/Details";

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("latestAnalysis");
    if (!data) {
      router.push("/upload");
      return;
    }

    const parsed = JSON.parse(data);
    setAnalysis(parsed);
  }, [router]);

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Resume Analysis Results
          </h1>
          {(analysis.companyName || analysis.jobTitle) && (
            <p className="text-lg text-gray-600">
              {analysis.jobTitle && `${analysis.jobTitle}`}
              {analysis.jobTitle && analysis.companyName && " at "}
              {analysis.companyName && analysis.companyName}
            </p>
          )}
        </div>

        {/* Summary */}
        <Summary feedback={analysis.feedback} />

        {/* Detailed feedback */}
        <Details feedback={analysis.feedback} />

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/upload")}
            className="px-6 py-3 bg-white border-2 border-purple-500 text-purple-500 rounded-lg font-semibold hover:bg-purple-50 transition-all"
          >
            Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
}
