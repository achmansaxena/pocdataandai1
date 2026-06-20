'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Database, Loader2, ChevronDown, ChevronUp, Bot, User, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  explainability?: {
    cypherQuery: string;
    accessedData: any;
  };
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/db/seed');
      const data = await res.json();
      if (res.ok && data.success) {
        setSeedResult({ success: true, message: data.message || 'Database seeded successfully!' });
      } else {
        setSeedResult({ success: false, message: data.error || 'Failed to seed database.' });
      }
    } catch (error: any) {
      setSeedResult({ success: false, message: error.message || 'An error occurred while seeding.' });
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedResult(null), 5000); // Hide toast after 5s
    }
  };

  const handleSendMessage = async (textOrEvent?: string | React.FormEvent) => {
    let messageContent = typeof textOrEvent === 'string' ? textOrEvent : input;
    if (typeof textOrEvent !== 'string') {
      textOrEvent?.preventDefault();
    }
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'No response generated.',
        explainability: data.source ? {
          cypherQuery: data.source.cypher_query,
          accessedData: data.source.raw_results,
        } : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to get a response.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Knowledge Graph AI</h1>
            <p className="text-xs text-gray-500">Agentic POC Interface</p>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-5xl mx-auto flex flex-col space-y-6">
        {/* Seed Toast */}
        {seedResult && (
          <div className={`flex items-center p-4 mb-4 text-sm rounded-lg border ${seedResult.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} animate-in fade-in slide-in-from-top-4`} role="alert">
            {seedResult.success ? <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
            <span className="font-medium">{seedResult.message}</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-xl">
              <Bot className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to the AI Knowledge Graph</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask questions about your enterprise data. The AI will navigate the Neo4j graph database to find your answers.
              </p>
            </div>

            {/* Example Questions */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {[
                "Why is Acme Corp at risk of renewal?",
                "Which customers have open critical support cases?",
                "List all products owned by Enterprise-tier customers.",
                "What is the total contract value for Umbrella Ltd?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isLoading}
                  className="flex items-start p-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-xl text-left transition-all group disabled:opacity-50"
                >
                  <MessageSquare className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-blue-700 transition-colors">{suggestion}</span>
                </button>
              ))}
            </div>


          </div>
        ) : (
          <div className="flex flex-col space-y-8 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${msg.role === 'user' ? 'bg-blue-600 ml-3' : 'bg-gray-100 mr-3 border border-gray-200'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-600" />}
                  </div>
                  
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                    <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    
                    {msg.role === 'assistant' && msg.explainability && (
                      <ExplainabilityPanel explainability={msg.explainability} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mr-3 border border-gray-200">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-tl-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the graph data..."
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 transition-all shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-xs text-gray-500">AI can make mistakes. Verify critical information.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ExplainabilityPanel({ explainability }: { explainability: NonNullable<Message['explainability']> }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!explainability.cypherQuery) return null;

  return (
    <div className="w-full max-w-2xl mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-200 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-colors focus:outline-none"
      >
        <div className="flex items-center">
          <span className="mr-2">🔍 View Graph Reasoning</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50/50 space-y-4 text-sm animate-in slide-in-from-top-2 duration-200">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Generated Cypher Query</div>
            <pre className="p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
              <code className="text-blue-700 font-mono text-xs leading-relaxed">
                {explainability.cypherQuery}
              </code>
            </pre>
          </div>

          {explainability.accessedData && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Raw Accessed Data</div>
              <pre className="p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto max-h-48">
                <code className="text-green-700 font-mono text-xs leading-relaxed">
                  {JSON.stringify(explainability.accessedData, null, 2)}
                </code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
