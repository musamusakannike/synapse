"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FlashcardAPI } from "@/lib/api";
import {
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Loader from "@/components/Loader";

type FlashcardItem = {
  front: string;
  back: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
};

type FlashcardSetFull = {
  _id: string;
  title: string;
  description?: string;
  flashcards: FlashcardItem[];
};

export default function StudyFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [setData, setSetData] = useState<FlashcardSetFull | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [cardResults, setCardResults] = useState<boolean[]>([]);
  const [showComplete, setShowComplete] = useState(false);

  const correctCount = cardResults.filter(Boolean).length;
  const total = cardResults.length || (setData?.flashcards.length || 0);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await FlashcardAPI.get(id);
      const full = data?.flashcardSet;
      setSetData(full || null);
      // reset session when reloading
      setCurrentCardIndex(0);
      setShowBack(false);
      setCardResults([]);
      setShowComplete(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const markCard = async (isCorrect: boolean) => {
    if (!setData) return;
    const next = [...cardResults];
    next[currentCardIndex] = isCorrect;
    setCardResults(next);

    if (currentCardIndex < setData.flashcards.length - 1) {
      setCurrentCardIndex((i) => i + 1);
      setShowBack(false);
    } else {
      // session complete
      try {
        const scorePct = Math.round((next.filter(Boolean).length / next.length) * 100);
        await FlashcardAPI.updateStudyStats(id, scorePct);
      } catch (e) {
        console.error(e);
      }
      setShowComplete(true);
    }
  };

  const resetStudy = () => {
    setCurrentCardIndex(0);
    setShowBack(false);
    setCardResults([]);
    setShowComplete(false);
  };

  const currentCard = setData?.flashcards[currentCardIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/flashcards" className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader size="30" />
        </div>
      ) : !setData ? (
        <p className="text-gray-600">Flashcard set not found.</p>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900" title={setData.title}>{setData.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Card {currentCardIndex + 1} of {setData.flashcards.length}
            </p>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / (setData.flashcards.length || 1)) * 100}%` }}
            />
          </div>

          {/* Card */}
          {currentCard && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 min-h-[220px] flex flex-col justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-4">{currentCard.front}</p>
                {showBack && (
                  <div className="border-t border-gray-300 pt-4">
                    <p className="text-gray-700">{currentCard.back}</p>
                    {currentCard.tags && currentCard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {currentCard.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          {currentCard && (
            <div className="flex items-center justify-center gap-4">
              {!showBack ? (
                <button
                  onClick={() => setShowBack(true)}
                  className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded"
                >
                  <Eye className="w-4 h-4" />
                  Show Answer
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => markCard(false)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded"
                  >
                    Incorrect
                  </button>
                  <button
                    onClick={() => markCard(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded"
                  >
                    Correct
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {currentCard && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentCardIndex > 0) {
                    setCurrentCardIndex((i) => i - 1);
                    setShowBack(false);
                  }
                }}
                disabled={currentCardIndex === 0}
                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {currentCardIndex + 1} / {setData.flashcards.length}
              </span>
              <button
                onClick={() => {
                  if (currentCardIndex < setData.flashcards.length - 1) {
                    setCurrentCardIndex((i) => i + 1);
                    setShowBack(false);
                  }
                }}
                disabled={currentCardIndex === setData.flashcards.length - 1}
                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Popup */}
      {showComplete && setData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowComplete(false)} />
          <div className="relative z-10 w-[92%] max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <span className="absolute inline-flex h-12 w-12 rounded-full bg-green-200 opacity-75 animate-ping"></span>
                <div className="relative inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-600 text-white">
                  <svg className="w-6 h-6 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center">Study Session Completed!</h3>
            <p className="mt-1 text-center text-gray-700">
              Score: <span className="font-semibold">{Math.round((correctCount / (setData.flashcards.length || 1)) * 100)}%</span>
              {" "}({correctCount}/{setData.flashcards.length})
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
                onClick={() => setShowComplete(false)}
              >
                Review
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setShowComplete(false);
                  resetStudy();
                }}
              >
                Study again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
