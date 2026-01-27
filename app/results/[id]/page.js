"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Summary from "../../components/Summary";
import Details from "../../components/Details";
import { getAnalysisById, exportToJSON, exportToPDF } from "../../lib/storage";

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const analysisId = params.id;
    if (!analysisId) {
      router.push("/upload");
      return;
    }

    const data = getAnalysisById(analysisId);
    if (!data) {
      router.push("/upload");
      return;
    }

    setAnalysis(data);
  }, [params.id, router]);

  const handleExportJSON = () => {
    if (analysis) {
      exportToJSON(analysis);
      setShowExportMenu(false);
    }
  };

  const handleExportPDF = async () => {
    if (analysis) {
      setIsExporting(true);
      try {
        await exportToPDF(analysis);
        setShowExportMenu(false);
      } catch (error) {
        alert("Failed to export PDF. Please try again.");
      } finally {
        setIsExporting(false);
      }
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
    <div className="min-h-screen bg-black py-12 px-4">
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
          {analysis.timestamp && (
            <p className="text-sm text-gray-400">
              Analyzed: {new Date(analysis.timestamp).toLocaleString()}
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
            className="px-6 py-3 bg-white border-2 border-purple-500 text-purple-500 rounded-lg font-semibold hover:bg-purple-50 transition-all"
          >
            View History
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? "Exporting..." : "📥 Export"}
            </button>

            {showExportMenu && !isExporting && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleExportJSON}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-t-lg transition-all flex items-center gap-2"
                >
                  <span className="text-lg">📄</span>
                  <span className="font-medium text-gray-600">
                    Export as JSON
                  </span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-b-lg transition-all flex items-center gap-2 border-t border-gray-100"
                >
                  <span className="text-lg">📑</span>
                  <span className="font-medium text-gray-600">
                    Export as PDF
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
