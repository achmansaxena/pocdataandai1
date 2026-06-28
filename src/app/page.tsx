'use client';

import { useState, useRef, useEffect } from 'react';
import { NetworkIcon, SparklesIcon } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import SuggestionChip from '@/components/SuggestionChip';
import { sendGraphMessage } from '@/lib/api';
import type { Message } from '@/lib/types';

/** The 10 predefined business questions from the POC document. */
const BUSINESS_QUESTIONS = [
  "Why is HealthBridge at risk of renewal?",
  "What products does Acme Corp own?",
  "Which contracts are expiring soon with high renewal risk?",
  "What support issues impact renewal outcomes?",
  "Show me all customers with a health score below 60.",
  "What is the ARR and churn risk for TechNova Inc?",
  "Which customers have open P1 or P2 support cases?",
  "What entitlements are under-utilized (below 40% usage)?",
  "Who manages HealthBridge and what is their contact?",
  "List all customers and their contract status.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const text = (question ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: `${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await sendGraphMessage(text);

      const assistantMsg: Message = {
        id: `${Date.now() + 1}`,
        role: 'assistant',
        content: data.answer,
        graphSource: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 1}`,
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to get a response.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-mesh">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 backdrop-blur-md bg-white/3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 shadow-lg shadow-violet-900/40 animate-pulse-glow">
            <NetworkIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">
              Knowledge Graph AI
            </h1>
            <p className="text-xs text-slate-500">Conversational Analytics · Agentic AI POC</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <SparklesIcon className="w-4 h-4 text-violet-400" />
          <span>Neo4j · 6 Entity Types · 6 Relationships</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-violet-900/50 animate-pulse-glow">
                <NetworkIcon className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-100 tracking-tight">
                  Knowledge Graph Analytics
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Ask cross-domain questions about Customers, Contracts, Products,
                  Entitlements, Support Cases, and Financial Metrics.
                  Every answer includes explainable reasoning.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="w-full max-w-2xl">
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 font-semibold">
                  Predefined Business Questions
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {BUSINESS_QUESTIONS.map((q, i) => (
                    <SuggestionChip key={i} text={q} onClick={handleSend} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <NetworkIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 flex items-center gap-1.5">
                    {['-0.3s', '-0.15s', '0s'].map((delay, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                        style={{ animationDelay: delay }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input Footer */}
      <footer className="px-4 pb-6 pt-2 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => handleSend()}
            isLoading={isLoading}
          />
          <p className="text-center text-xs text-slate-600 mt-2">
            AI can make mistakes. Verify critical information.
          </p>
        </div>
      </footer>
    </div>
  );
}
