/**
 * components/ChatMessage.tsx
 * Renders a single chat bubble (user or assistant) with optional
 * SQL or Graph explainability panel.
 */
"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";
import { ChevronDownIcon, ChevronUpIcon, CodeBracketIcon } from "@heroicons/react/24/outline";

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const [showSource, setShowSource] = useState(false);
  const isUser = message.role === "user";
  const hasSource = !isUser && (message.sqlSource || message.graphSource);

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <CodeBracketIcon className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-indigo-500 text-white rounded-tr-sm"
              : "bg-white/10 backdrop-blur-sm border border-white/10 text-slate-100 rounded-tl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Explainability toggle */}
        {hasSource && (
          <div className="w-full">
            <button
              onClick={() => setShowSource((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors"
              aria-expanded={showSource}
              aria-label="Toggle reasoning source"
            >
              <CodeBracketIcon className="w-3.5 h-3.5" />
              {message.graphSource ? "Graph Reasoning & Path" : "SQL Query & Results"}
              {showSource ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
            </button>

            {showSource && (
              <div className="mt-2 rounded-xl bg-slate-900 border border-white/10 overflow-hidden text-xs font-mono">
                {/* ── Graph Source ─────────────────────────────────── */}
                {message.graphSource && (
                  <>
                    {/* Reasoning Summary */}
                    <div className="p-3 border-b border-white/10">
                      <p className="text-violet-400 mb-1.5 font-sans font-semibold not-italic">Reasoning Summary</p>
                      <p className="text-slate-300 font-sans leading-relaxed">{message.graphSource.reasoning_summary}</p>
                    </div>

                    {/* Relationship Path */}
                    {message.graphSource.relationship_path.length > 0 && (
                      <div className="p-3 border-b border-white/10">
                        <p className="text-violet-400 mb-1.5 font-sans font-semibold not-italic">Relationship Path</p>
                        <div className="flex flex-wrap gap-1">
                          {message.graphSource.relationship_path.map((step, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300">
                              {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source Systems */}
                    {message.graphSource.source_systems.length > 0 && (
                      <div className="p-3 border-b border-white/10">
                        <p className="text-violet-400 mb-1.5 font-sans font-semibold not-italic">Source Systems</p>
                        <div className="flex flex-wrap gap-1">
                          {message.graphSource.source_systems.map((sys) => (
                            <span key={sys} className="px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300">
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cypher Query */}
                    {message.graphSource.cypher_query && (
                      <div className="p-3 border-b border-white/10">
                        <p className="text-violet-400 mb-1.5 font-sans font-semibold not-italic">Cypher Query</p>
                        <pre className="text-emerald-300 whitespace-pre-wrap break-all leading-5">
                          {message.graphSource.cypher_query}
                        </pre>
                      </div>
                    )}

                    {/* Raw Graph Results */}
                    {message.graphSource.raw_results?.length > 0 && (
                      <div className="p-3">
                        <p className="text-violet-400 mb-1.5 font-sans font-semibold not-italic">
                          Raw Results ({message.graphSource.raw_results.length} records)
                        </p>
                        <pre className="text-slate-300 whitespace-pre-wrap break-all leading-5 max-h-48 overflow-y-auto">
                          {JSON.stringify(message.graphSource.raw_results, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {/* ── SQL Source ───────────────────────────────────── */}
                {message.sqlSource && (
                  <>
                    {message.sqlSource.sql_query && (
                      <div className="p-3 border-b border-white/10">
                        <p className="text-blue-400 mb-1.5 font-sans font-semibold not-italic">T-SQL Query</p>
                        <pre className="text-emerald-300 whitespace-pre-wrap break-all leading-5">
                          {message.sqlSource.sql_query}
                        </pre>
                      </div>
                    )}

                    {message.sqlSource.raw_results?.length > 0 && (
                      <div className="p-3">
                        <p className="text-blue-400 mb-1.5 font-sans font-semibold not-italic">
                          Database Results ({message.sqlSource.raw_results.length} rows)
                        </p>
                        <pre className="text-slate-300 whitespace-pre-wrap break-all leading-5 max-h-48 overflow-y-auto">
                          {JSON.stringify(message.sqlSource.raw_results, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shadow">
          <span className="text-slate-200 text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
}
