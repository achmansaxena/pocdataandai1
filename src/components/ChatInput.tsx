/**
 * components/ChatInput.tsx
 * Controlled textarea with Send button. Supports Shift+Enter for new lines,
 * Enter to submit.
 */
"use client";

import { FormEvent, KeyboardEvent, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, isLoading }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSubmit();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoading && value.trim()) onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-xl shadow-black/20"
    >
      <textarea
        ref={textareaRef}
        id="chat-input"
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about customers, contracts, risk… (Enter to send)"
        disabled={isLoading}
        className="flex-1 resize-none bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none leading-relaxed max-h-40 disabled:opacity-50"
        aria-label="Chat input"
      />

      <button
        type="submit"
        id="send-button"
        disabled={isLoading || !value.trim()}
        aria-label="Send message"
        className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/40 disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all"
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
        ) : (
          <PaperAirplaneIcon className="w-4 h-4 text-white" />
        )}
      </button>
    </form>
  );
}
