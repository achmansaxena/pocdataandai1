/**
 * app/layout.tsx – Root layout with metadata and font setup.
 */
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Knowledge Graph – Agentic AI Analytics",
  description:
    "Conversational analytics powered by a Neo4j knowledge graph and a Cerebras LLM. Ask natural-language questions about customers, products, contracts, and support cases.",
  keywords: ["knowledge graph", "agentic AI", "Neo4j", "conversational analytics", "LangChain"],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${dmSans.className}`}>
      <head />
      <body className="h-full bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
