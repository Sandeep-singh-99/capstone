import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  Plus,
  ArrowUp,
  Bot,
  User,
  Activity,
  Copy,
  Check,
  Square,
  MessageSquare,
  Trash
} from "lucide-react";
import { setActiveConversationId } from "../../redux/chat/chatSlice";
import { chatApi } from "../../api/chatApi";
import type { ConversationResponse } from "../../api/chatApi";
import { Card } from "../../components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "../../components/ui/sidebar";
import { toast } from "sonner";


const SUGGESTED_PROMPTS = [
  {
    title: "Understanding High Blood Pressure",
    prompt: "What does it mean if my systolic blood pressure is consistently above 140, and what type of specialist should I see?"
  },
  {
    title: "Cholesterol Test Results",
    prompt: "I got my lab results back and my LDL cholesterol is 160 mg/dL. Can you explain what this means and suggest lifestyle changes?"
  },
  {
    title: "Identify Diabetes Symptoms",
    prompt: "What are the common early warning signs of type 2 diabetes, and how is it clinically diagnosed?"
  }
];

// Helper to parse simple markdown to React nodes
function parseMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mt-4 mb-2 text-sm font-bold text-foreground">
          {line.substring(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mt-5 mb-2 text-base font-bold text-foreground border-b border-border pb-1">
          {line.substring(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="mt-3 mb-1 text-xs font-bold text-foreground/90">
          {line.substring(5)}
        </h4>
      );
      continue;
    }
    if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-4 border-t border-border" />);
      continue;
    }
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-xs text-foreground/90 leading-relaxed mb-1">
          {line.trim().substring(2)}
        </li>
      );
      continue;
    }
    if (line.trim() !== "") {
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-foreground/90 mb-3">
          {line}
        </p>
      );
    }
  }

  return elements;
}

// Group conversations by period
function groupConversations(chats: ConversationResponse[]) {
  const today: ConversationResponse[] = [];
  const yesterday: ConversationResponse[] = [];
  const previous7Days: ConversationResponse[] = [];
  const older: ConversationResponse[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  chats.forEach((chat) => {
    const time = new Date(chat.created_at).getTime();
    if (time >= startOfToday) {
      today.push(chat);
    } else if (time >= startOfYesterday) {
      yesterday.push(chat);
    } else if (time >= startOf7DaysAgo) {
      previous7Days.push(chat);
    } else {
      older.push(chat);
    }
  });

  return { today, yesterday, previous7Days, older };
}

// Suppress unused warning
void (function() { return groupConversations; });

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<number | null>(null);

  // Redux Active Chat State
  useEffect(() => {
    dispatch(setActiveConversationId(conversationId || null));
  }, [conversationId, dispatch]);

  // Queries
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatApi.getConversations,
  });

  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ["chatHistory", conversationId],
    queryFn: () => chatApi.getSessionHistory(conversationId!),
    enabled: !!conversationId,
  });

  const conversations = conversationsData?.data || [];
  const activeSessionHistory = historyData?.data;
  const messagesList = activeSessionHistory?.messages || [];


  const sendMessageMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) => chatApi.sendMessage(id, msg),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory", variables.id] });
      const answer = res.data?.response || "";
      // Stream answer locally in the UI for premium UX
      streamResponse(answer, variables.id);
    },
    onError: (err: any) => {
      setIsStreaming(false);
      toast.error(err.response?.data?.detail || "Failed to process chat message.");
    },
  });

  const deleteConvoMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Consultation session deleted.");
      if (conversationId === deletedId) {
        navigate("/chat");
      }
    },
  });

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList, streamingText]);

  // Textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const streamResponse = (text: string, _id: string) => {
    setIsStreaming(true);
    setStreamingText("");
    let words = text.split(" ");
    let index = 0;

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    streamIntervalRef.current = window.setInterval(() => {
      if (index < words.length) {
        setStreamingText((prev) => prev + (prev ? " " : "") + words[index]);
        index++;
      } else {
        clearInterval(streamIntervalRef.current!);
        streamIntervalRef.current = null;
        setIsStreaming(false);
        setStreamingText("");
        refetchHistory();
      }
    }, 40);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming || sendMessageMutation.isPending) return;

    setInput("");

    // If no session exists, create one first
    if (!conversationId) {
      const title = text.length > 30 ? text.substring(0, 30) + "..." : text;
      try {
        const res = await chatApi.startChat(undefined, title);
        const newId = res.data?.id;
        if (newId) {
          // Pre-populate UI state
          setIsStreaming(true);
          setStreamingText("AI is compiling clinical logs...");
          sendMessageMutation.mutate({ id: newId, msg: text });
          navigate(`/chat/${newId}`);
        }
      } catch (e) {
        toast.error("Could not start consultation.");
      }
    } else {
      setIsStreaming(true);
      setStreamingText("Analyzing clinical query...");
      sendMessageMutation.mutate({ id: conversationId, msg: text });
    }
  };

  const handleStopGeneration = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsStreaming(false);
    setStreamingText("");
    refetchHistory();
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden animate-fade-in">
        {/* Chat Sidebar list */}
        <Sidebar className="border-r border-sidebar-border bg-sidebar shrink-0">
          <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
            <Button
              onClick={() => navigate("/chat")}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-md gap-2"
            >
              <Plus size={16} />
              New Consultation
            </Button>
          </SidebarHeader>

          <SidebarContent className="p-2 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No consultations yet.
              </div>
            ) : (
              <SidebarMenu>
                {conversations.map((convo) => {
                  const isActive = convo.id === conversationId;
                  return (
                    <SidebarMenuItem key={convo.id}>
                      <div
                        onClick={() => navigate(`/chat/${convo.id}`)}
                        className={`group/item flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer select-none ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1">
                          <MessageSquare size={14} className="shrink-0 opacity-70" />
                          <span className="truncate">{convo.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConvoMutation.mutate(convo.id);
                          }}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Trash size={11} />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar/50 text-[10px] text-muted-foreground flex flex-col gap-1.5 select-none">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Bot size={14} className="text-emerald-500 animate-pulse" />
              <span>MediGuide Agent Graph</span>
            </div>
            <span>Double-encrypted private clinical search vaults. HIPAA Compliant.</span>
          </SidebarFooter>
        </Sidebar>

        {/* Chat display box */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold">AI Medical Consultation</span>
              </div>
            </div>
            <Link to="/dashboard">
              <Button size="sm" variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
                Dashboard Overview
              </Button>
            </Link>
          </header>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto bg-background/50 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {messagesList.length === 0 && !isStreaming ? (
                // Welcome Empty view
                <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 space-y-6">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/15">
                    <Activity className="h-8 w-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                      How can I help you today?
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Ask about specific symptoms, diagnostic markings, or health reports. Information is double encrypted.
                    </p>
                  </div>

                  {/* Suggested prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl pt-4">
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                      <Card
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="bg-card/45 hover:bg-muted/30 border-border/80 cursor-pointer transition-all hover:scale-[1.02] p-4 flex flex-col text-left space-y-2 shadow-sm"
                      >
                        <span className="text-xs font-bold text-foreground leading-tight">
                          {item.title}
                        </span>
                        <p className="text-[10px] text-muted-foreground line-clamp-3">
                          "{item.prompt}"
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                // Messages List
                <div className="space-y-4">
                  {messagesList.map((msg) => (
                    <div key={msg.id} className="space-y-4">
                      {/* User message */}
                      <div className="flex gap-4 p-4 bg-transparent">
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border">
                          <User size={15} />
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <span className="text-xs font-bold text-foreground">You</span>
                          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{msg.question}</p>
                        </div>
                      </div>

                      {/* AI Response message */}
                      <div className="flex gap-4 p-4 bg-muted/35 rounded-xl border border-border/50">
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Bot size={15} />
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">MediGuide AI</span>
                            <button
                              onClick={() => handleCopy(msg.id, msg.answer)}
                              className="inline-flex items-center gap-1.5 rounded p-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                              <span>{copiedMessageId === msg.id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <div className="prose max-w-none text-muted-foreground">
                            {parseMarkdown(msg.answer)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Streaming Response */}
                  {isStreaming && (
                    <div className="flex gap-4 p-4 bg-muted/35 rounded-xl border border-border/50 animate-pulse">
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Bot size={15} />
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <span className="text-xs font-bold text-foreground">MediGuide AI</span>
                        <div className="prose max-w-none text-muted-foreground text-xs leading-relaxed">
                          {parseMarkdown(streamingText)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Input Area */}
          <div className="border-t border-border bg-background px-4 py-4 md:px-8 shrink-0">
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="relative flex items-center">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask a health question (e.g. 'What is LDL cholesterol?')..."
                  className="w-full resize-none rounded-xl border border-input bg-background pl-4 pr-12 py-3 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 max-h-[180px] min-h-[44px] no-scrollbar"
                  disabled={isStreaming}
                />
                
                <div className="absolute right-2 flex items-center gap-1.5">
                  {isStreaming ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleStopGeneration}
                      className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                    >
                      <Square size={14} fill="currentColor" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || sendMessageMutation.isPending}
                      className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm border-0"
                    >
                      <ArrowUp size={15} />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center select-none leading-relaxed">
                Consultation details are private. MediGuide is for educational purposes only. Review our medical disclosures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
