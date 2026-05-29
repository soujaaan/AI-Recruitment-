import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api";

import { motion } from "framer-motion";
import GlassCard from "../common/GlassCard";

// react-markdown is optional at runtime (prevents profile page crash if dependency is missing)
let ReactMarkdown = null;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  ReactMarkdown = require("react-markdown");
  ReactMarkdown = ReactMarkdown?.default || ReactMarkdown;
} catch (_) {
  ReactMarkdown = null;
}
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "../../utils/formatTime";

const defaultWelcome =
  "Hi 👋\nI'm your AI Career Copilot.\nI can help you improve resumes, prepare for interviews, optimize ATS scores, and plan your career.";

const quickActions = [
  { label: "Analyze Resume", mode: "resume", prompt: "Analyze my resume and suggest improvements (strengths, gaps, missing keywords, and next actions)." },
  { label: "Improve ATS Score", mode: "ats", prompt: "Improve my ATS score. Provide ATS-friendly changes and keyword strategy based on my profile and resume analysis." },
  { label: "Generate Interview Questions", mode: "interview", prompt: "Generate tailored interview questions for my target role. Include behavioral and technical questions and a 45-minute plan." },
  { label: "Career Roadmap", mode: "roadmap", prompt: "Create a career roadmap based on my current profile and ATS insights. Include milestones, steps, and projects." },
  { label: "Skill Gap Analysis", mode: "career", prompt: "Identify my skill gaps and recommend growth steps and roles I’m likely to succeed in." },
  { label: "Mock HR Round", mode: "default", prompt: "Conduct a mock HR round. Ask me interview questions and evaluate my responses." },
];

const AICopilotChat = () => {
  const { user } = useSelector((s) => s.auth);

  const [mode, setMode] = useState("default");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);

  const typingMessage = useMemo(() => {
    return { role: "assistant", content: "", loading: true };
  }, []);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: defaultWelcome,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const getAuthHeader = () => {
    // token is stored in redux auth slice if your app already does that
    // fallback: cookie auth handled by backend protectRoute
    return undefined;
  };

  const buildContextPayload = () => {
    // Minimal: backend will fetch profile/profile-analysis/applied jobs itself.
    // If frontend has extra cached data, we can inject it later.
    return {
      profile: null,
      resumeData: null,
      atsData: null,
    };
  };

  const sendMessage = async () => {
    if (loading) return;

    const trimmed = query.trim();
    if (!trimmed) return;

    setError(null);
    setLoading(true);

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");

    // typing indicator
    setMessages((prev) => [...prev, { ...typingMessage, id: crypto.randomUUID(), timestamp: Date.now(), mode }]);

    try {
      const payload = {
        message: trimmed,
        type: mode,
        ...buildContextPayload(),
      };

      const headers = getAuthHeader() ? { Authorization: getAuthHeader() } : undefined;

      const res = await apiClient.post(`/api/ai/chat`, payload);

      const reply = res?.data?.reply;

      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.loading);
        return [
          ...withoutTyping,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply || "I couldn’t generate a response right now. Please try again.",
            timestamp: Date.now(),
            mode,
          },
        ];
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "AI request failed. Please retry.";

      setError(msg);
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.loading);
        return [
          ...withoutTyping,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Sorry — ${msg}`,
            timestamp: Date.now(),
            mode,
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full"
    >
      <GlassCard className="h-full flex flex-col overflow-hidden border-accent/20 bg-white/[0.02]">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground">AI Career Copilot</h3>
            <p className="text-xs text-accent">Recruitment-ready guidance (Groq-powered)</p>
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <button
                key={a.mode}
                type="button"
                onClick={async () => {
                  setMode(a.mode);
                  setQuery(a.prompt);
                  // trigger send after state update
                  setTimeout(() => {
                    // eslint-disable-next-line no-use-before-define
                    sendMessage();
                  }, 0);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-accent/50 hover:text-accent transition-colors flex items-center gap-1.5 text-muted-foreground"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-3">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    isUser
                      ? "max-w-[85%] bg-accent text-[#0a0a0a] rounded-2xl px-4 py-3 shadow"
                      : "max-w-[85%] bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                  }
                >
                  {m.loading ? (
                    <div className="flex items-center gap-2 text-accent">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Typing…</span>
                    </div>
                  ) : ReactMarkdown ? (
                    <ReactMarkdown className={isUser ? "text-sm" : "text-sm text-foreground/90"}>
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    <pre className={isUser ? "text-sm whitespace-pre-wrap" : "text-sm text-foreground/90 whitespace-pre-wrap"}>
                      {m.content}
                    </pre>
                  )}
                  <div className="mt-2 text-[10px] opacity-70">
                    {formatDistanceToNow(m.timestamp || Date.now())}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {error ? (
          <div className="px-5 pb-2">
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
              {error}
            </div>
          </div>
        ) : null}

        <div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#0a0a0a]/80 backdrop-blur">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              placeholder="Ask AI anything…"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className="w-full bg-surface-elevated border border-white/10 rounded-full py-3 px-5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-12"
              disabled={loading}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-[#0a0a0a] hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="mt-2 text-[11px] text-accent/80">
            Press Enter or click send. Mode: <span className="text-foreground/90">{mode}</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AICopilotChat;

