/**
 * components/SuggestionChip.tsx
 * Quick-access suggestion pills shown on empty chat state.
 */
"use client";

interface Props {
  text: string;
  onClick: (text: string) => void;
}

export default function SuggestionChip({ text, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(text)}
      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-violet-300 transition-all duration-200 text-left"
    >
      {text}
    </button>
  );
}
