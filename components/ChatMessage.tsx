/**
 * components/ChatMessage.tsx
 * Renders a single chat bubble (user or assistant) with optional
 * Reasoning / Source explainability panel.
 */
"use client";

import { useState } from "react";
import { SQLSource } from "@/lib/api";
import { ChevronDownIcon, ChevronUpIcon, CodeBracketIcon, CircleStackIcon } from "@heroicons/react/24/outline";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  source?: SQLSource;
}

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const [showSource, setShowSource] = useState(false);
  const isUser = message.role === "user";

  return (
    <div className={\`flex gap-3 \${isUser ? "justify-end" : "justify-start"} animate-fade-in\`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <CircleStackIcon className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={\`max-w-[75%] flex flex-col gap-2 \${isUser ? "items-end" : "items-start"}\`}>
        {/* Bubble */}
        <div
          className={\`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md \${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-500 text-white rounded-tr-sm"
              : "bg-white/10 backdrop-blur-sm border border-white/10 text-slate-100 rounded-tl-sm"
          }\`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Source / Explainability toggle (assistant only) */}
        {!isUser && message.source && (
          <div className="w-full">
            <button
              onClick={() => setShowSource((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
              aria-expanded={showSource}
              aria-label="Toggle reasoning source"
            >
              <CodeBracketIcon className="w-3.5 h-3.5" />
              SQL Query & Results
              {showSource ? (
                <ChevronUpIcon className="w-3 h-3" />
              ) : (
                <ChevronDownIcon className="w-3 h-3" />
              )}
            </button>

            {showSource && (
              <div className="mt-2 rounded-xl bg-slate-900 border border-white/10 overflow-hidden text-xs font-mono">
                {/* SQL Query */}
                {message.source.sql_query && (
                  <div className="p-3 border-b border-white/10">
                    <p className="text-blue-400 mb-1.5 font-sans font-semibold not-italic">
                      T-SQL Query
                    </p>
                    <pre className="text-emerald-300 whitespace-pre-wrap break-all leading-5">
                      {message.source.sql_query}
                    </pre>
                  </div>
                )}

                {/* Raw Results */}
                {message.source.raw_results?.length > 0 && (
                  <div className="p-3">
                    <p className="text-blue-400 mb-1.5 font-sans font-semibold not-italic">
                      Database Results ({message.source.raw_results.length} rows)
                    </p>
                    <pre className="text-slate-300 whitespace-pre-wrap break-all leading-5 max-h-48 overflow-y-auto">
                      {JSON.stringify(message.source.raw_results, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shadow">
          <span className="text-slate-200 text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
}
