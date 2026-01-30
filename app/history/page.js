"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScoreCircle from "../components/ScoreCircle";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/analyses");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.analyses);
      }
    } catch (error) {
      // console.error("Error loading history:", error);
      toast.error("Failed to load analysis history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/analyses/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Analysis deleted successfully!");
        loadHistory();
      }
    } catch (error) {
      // console.error("Error deleting analysis:", error);
      toast.error("Failed to delete analysis.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleView = (id) => {
    router.push(`/results/${id}`);
  };

  if (loading) {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Analysis History
              </h1>
              <p className="text-lg text-gray-300">
                View and manage your past resume analyses
              </p>
            </div>
            <button
              onClick={() => router.push("/upload")}
              className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              New Analysis
            </button>
          </div>

          {history.length === 0 ? (
            <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl p-12 text-center">
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
                className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl hover:border-purple-500 transition-all overflow-hidden"
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
                      <div className="shrink-0 ml-4">
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
                      {new Date(item.createdAt).toLocaleString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(item._id)}
                        className="flex-1 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
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

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Delete Analysis?
              </h3>
              <p className="text-gray-300 text-center mb-6">
                Are you sure you want to delete this analysis? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
