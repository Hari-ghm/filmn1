"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Send, Activity, BarChart2 } from "lucide-react";

type EmotionDataPoint = {
  segment: number;
  textSnippet: string;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  trust: number;
};

type AnalysisResponse = {
  overallSentiment: string;
  summary: string;
  arc: EmotionDataPoint[];
  message?: string;
};

export default function EmotionsPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length < 10) {
      setError("Please enter at least 10 characters for a meaningful analysis.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze.");
      }
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 p-6 sm:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium">
            <Activity className="w-4 h-4" /> New Feature
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
            Story Emotion Analyzer
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover the emotional arc of your scripts or text. We map out joy, sadness, fear, and more across narrative segments.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
          <form onSubmit={handleAnalyze} className="relative z-10 space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your screenplay, story, or text here (minimum 10 characters)..."
              className="w-full h-48 bg-gray-950/50 border border-gray-700/50 rounded-2xl p-6 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none font-medium leading-relaxed"
            />
            {error && <p className="text-red-400 text-sm ml-2">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-spin" /> Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Analyze Arc
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        {analysis && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest text-xs">Overall Sentiment</h3>
                <p className="text-3xl font-bold text-gray-100">{analysis.overallSentiment}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest text-xs">AI Summary</h3>
                <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-3 mb-8">
                  <BarChart2 className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-gray-100">Emotional Trajectory</h2>
               </div>
               
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysis.arc} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                      dataKey="textSnippet" 
                      stroke="#9CA3AF" 
                      fontSize={12} 
                      tickMargin={10}
                      tickFormatter={(val) => val.slice(0, 15) + "..."}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="joy" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="sadness" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="anger" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="fear" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="surprise" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="trust" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
