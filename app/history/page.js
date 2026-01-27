"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHistory, deleteAnalysis } from "../lib/storage";
import ScoreCircle from "../components/ScoreCircle";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getHistory();
    setHistory(data);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis(id);
      loadHistory();
    }
  };

  const handleView = (id) => {
    router.push(`/results/${id}`);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Analysis History
            </h1>
            <p className="text-lg text-gray-300">
              View and manage your past resume analyses
            </p>
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            New Analysis
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No Analysis History
            </h2>
            <p className="text-gray-300 mb-6">
              You haven't analyzed any resumes yet. Start by uploading your
              first resume.
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl hover:border-purple-500 transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Header with score */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {item.companyName && (
                        <h3 className="text-lg font-bold text-white mb-1">
                          {item.companyName}
                        </h3>
                      )}
                      {item.jobTitle && (
                        <p className="text-gray-300 mb-2">{item.jobTitle}</p>
                      )}
                      {!item.companyName && !item.jobTitle && (
                        <h3 className="text-lg font-bold text-white mb-2">
                          Resume Analysis
                        </h3>
                      )}
                      {item.fileName && (
                        <p className="text-sm text-gray-400 truncate">
                          {item.fileName}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <ScoreCircle score={item.feedback.overallScore} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400 text-xs">Tone & Style</p>
                      <p className="font-semibold text-white">
                        {item.feedback.toneAndStyle.score}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400 text-xs">Content</p>
                      <p className="font-semibold text-white">
                        {item.feedback.content.score}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400 text-xs">Structure</p>
                      <p className="font-semibold text-white">
                        {item.feedback.structure.score}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400 text-xs">Skills</p>
                      <p className="font-semibold text-white">
                        {item.feedback.skills.score}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(item.id)}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-red-900/30 border border-red-500 text-red-400 rounded-lg font-medium hover:bg-red-900/50 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
