import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Zap, Clock, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { BackButton } from "@/components/ui/back-button";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`;

const EXAMPLE_PROMPTS = [
  "Send $50 to maria@email.com for groceries",
  "Set up a weekly $100 transfer to mom@family.com",
  "Show my current balance",
  "List my active payment rules",
  "Create a monthly rent payment of $800",
];

async function streamChat({
  messages,
  conversationId,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  conversationId: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    onError("Please log in to use the AI agent.");
    return;
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ messages, conversation_id: conversationId }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    if (resp.status === 429) {
      onError("Rate limit reached. Please wait a moment and try again.");
    } else if (resp.status === 402) {
      onError("AI credits exhausted. Please add funds in workspace settings.");
    } else {
      onError(body.error || "Something went wrong. Please try again.");
    }
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || !line.trim()) continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  // flush
  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw || !raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {}
    }
  }

  onDone();
}

export default function AutoPay() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const [activeTab, setActiveTab] = useState<"chat" | "rules">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch payment rules
  const { data: rules = [], refetch: refetchRules } = useQuery({
    queryKey: ["payment-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_rules")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Toggle rule
  const toggleRule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("payment_rules")
        .update({ is_active: active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-rules"] });
      toast.success("Rule updated");
    },
  });

  // Delete rule
  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payment_rules")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-rules"] });
      toast.success("Rule deleted");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let soFar = "";
    const upsert = (chunk: string) => {
      soFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: soFar } : m);
        }
        return [...prev, { role: "assistant", content: soFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      conversationId,
      onDelta: upsert,
      onDone: () => {
        setIsLoading(false);
        refetchRules();
      },
      onError: (err) => {
        setIsLoading(false);
        toast.error(err);
      },
    });
  }, [messages, isLoading, conversationId, refetchRules]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="min-h-screen modern-gradient">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <BackButton to="/dashboard" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AutoPay Agent</h1>
              <p className="text-white/60 text-sm">AI-powered payment automation</p>
            </div>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "chat" ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === "rules" ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Rules
              {rules.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {rules.length}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {activeTab === "chat" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-180px)]">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">What can I do for you?</h2>
                    <p className="text-white/50 text-sm max-w-md">
                      Send payments, create automation rules, check balances — all through natural language.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {EXAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 text-xs transition-colors text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-violet-600/40 text-white"
                          : "bg-white/5 border border-white/10 text-white/90"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-white/70" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command... e.g., 'Send $50 to maria@email.com'"
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[44px] max-h-[120px] rounded-xl"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl h-11 w-11 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Rules Panel */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Zap className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-white font-semibold mb-2">No active rules</h3>
                <p className="text-white/50 text-sm max-w-sm mb-4">
                  Use the chat to create automated payment rules like "Send $100 to mom every Friday"
                </p>
                <Button
                  onClick={() => setActiveTab("chat")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Create a rule via chat
                </Button>
              </div>
            ) : (
              rules.map((rule: any) => (
                <ModernCard key={rule.id} variant="glass" className="bg-white/5 border border-white/10">
                  <ModernCardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold text-sm">{rule.rule_name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-300">
                            {rule.rule_type}
                          </span>
                        </div>
                        <p className="text-white/60 text-xs">
                          {rule.action_config?.amount} {rule.action_config?.currency} → {rule.action_config?.recipient_email}
                        </p>
                        {rule.trigger_config?.frequency && (
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{rule.trigger_config.frequency}</span>
                            {rule.next_trigger_at && (
                              <span>· Next: {new Date(rule.next_trigger_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        <p className="text-white/30 text-xs">
                          Executed {rule.execution_count || 0} times
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteRule.mutate(rule.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
