"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare, Search, Trash2, ArrowLeft, Calendar,
  AlertTriangle, CheckCircle, Info, Filter, X, Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const riskConfig = {
  low:    { color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   icon: CheckCircle   },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: Info          },
  high:   { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       icon: AlertTriangle },
};

const categories = ["All", "Theft", "Harassment", "Tenant", "Consumer", "Cyber", "FIR", "Divorce", "Property", "Labor", "General"];

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading, chatHistory, deleteChatItem, clearChatHistory } = useAuth();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const filtered = useMemo(() => {
    return chatHistory.filter(item => {
      const matchSearch = !search ||
        item.query.toLowerCase().includes(search.toLowerCase()) ||
        item.response.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || item.category.toLowerCase().includes(category.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [chatHistory, search, category]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }, [filtered]);

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Chat History</h1>
            <p className="text-gray-400 mt-1">{chatHistory.length} conversations saved</p>
          </div>
          <div className="flex gap-3">
            <Link href="/chat"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all">
              <MessageSquare className="w-4 h-4" /> New Chat
            </Link>
            {chatHistory.length > 0 && (
              <button onClick={clearChatHistory}
                className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search your conversations..."
            className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${category === cat ? "bg-blue-600 text-white" : "glass text-gray-300 border border-white/10 hover:bg-white/10"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {chatHistory.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-white/10 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No chat history yet</h3>
          <p className="text-gray-500 text-sm mb-6">Your conversations will appear here after you use the AI chat.</p>
          <Link href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
            Start a Conversation
          </Link>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No results for "{search}" {category !== "All" ? `in ${category}` : ""}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 font-medium">{date}</span>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-600">{items.length} chat{items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="glass rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                    <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="w-full p-4 flex items-start justify-between gap-3 text-left">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {item.risk && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${riskConfig[item.risk].bg} ${riskConfig[item.risk].color}`}>
                              {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)} Risk
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded-full border border-white/10">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium truncate">{item.query}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteChatItem(item.id); }}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                      </button>
                    </button>

                    <AnimatePresence>
                      {expanded === item.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/10">
                          <div className="p-4 bg-white/3">
                            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Your Question</p>
                            <p className="text-sm text-gray-300 mb-4">{item.query}</p>
                            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">AI Response</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.response}</p>
                            <div className="mt-4 flex gap-2">
                              <Link href="/chat"
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                <MessageSquare className="w-3 h-3" /> Continue this topic
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
