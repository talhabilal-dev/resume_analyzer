"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Summary from "../../components/Summary";
import Details from "../../components/Details";
import Navbar from "../../components/Navbar";
import { toast } from "sonner";
export default function ResultsPage() {
  const [analysis, setAnalysis] = useState(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const analysisId = params.id;
    if (!analysisId) {
      router.push("/upload");
      return;
    }

    // Fetch analysis from database
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analyses/${analysisId}`);
        if (!response.ok) {
          toast.error("Analysis not found. Redirecting to upload page.");
          router.push("/upload");
          return;
        }
        const data = await response.json();
        toast.success("Analysis fetched successfully!");
        setAnalysis(data.analysis);
      } catch (error) {
        // console.error("Error fetching analysis:", error);
        toast.error("Failed to fetch analysis. Redirecting to upload page.");
        router.push("/upload");
      }
    };

    fetchAnalysis();
  }, [params.id, router]);

  const handleExportJSON = () => {
    if (analysis) {
      const dataStr = JSON.stringify(analysis, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `resume-analysis-${analysis.fileName || "export"}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setShowExportMenu(false);
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Resume Analysis Results
            </h1>
            {(analysis.companyName || analysis.jobTitle) && (
              <p className="text-lg text-gray-300">
                {analysis.jobTitle && `${analysis.jobTitle}`}
                {analysis.jobTitle && analysis.companyName && " at "}
                {analysis.companyName && analysis.companyName}
              </p>
            )}
            {analysis.fileName && (
              <p className="text-sm text-gray-400 mt-2">
                File: {analysis.fileName}
              </p>
            )}
            {analysis.createdAt && (
              <p className="text-sm text-gray-400">
                Analyzed: {new Date(analysis.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Summary */}
          <Summary feedback={analysis.feedback} />

          {/* Detailed feedback */}
          <Details feedback={analysis.feedback} />

          {/* Action buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push("/upload")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Analyze Another Resume
            </button>
            <button
              onClick={() => router.push("/history")}
              className="px-6 py-3 bg-gray-800 border-2 border-purple-500 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
