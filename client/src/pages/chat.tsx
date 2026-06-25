import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Send,
  Paperclip,
  ArrowUp,
  Bot,
  User,
  Sparkles,
  Settings,
  LogOut,
  Sun,
  Moon,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Square,
  Activity,
  ChevronDown,
  Info,
  Edit2,
  Heart,
  MessageSquare,
  Shield,
  Search
} from "lucide-react";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  feedback?: "like" | "dislike" | null;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  model: string;
}

// Models Config
const MODELS = [
  {
    id: "health-nav-1.0",
    name: "HealthNavigator AI 1.0",
    description: "Tailored for health, nutrition, and medical advice.",
    icon: Activity,
    color: "text-emerald-500"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (General)",
    description: "OpenAI's flagship model for complex general tasks.",
    icon: Sparkles,
    color: "text-purple-500"
  },
  {
    id: "claude-3-5",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's model optimized for logical coding & writing.",
    icon: Bot,
    color: "text-orange-500"
  }
];

// Context-aware Mock Responses database
const MOCK_ANSWERS: Record<string, string> = {
  greetings: `Hello! I'm **HealthNavigator AI**, your virtual wellness assistant. 

How can I help you today? I can assist you with:
* 🥗 **Nutrition & Meal Planning** (custom diets, calories, recipe ideas)
* 🏃‍♂️ **Exercise & Workouts** (routines, stretching, recovery)
* 🩺 **Symptom Education** (understanding allergies, pain indicators)
* 💤 **Mental & Sleep Health** (stress management, sleep hygiene)

*Disclaimer: I am an AI, not a doctor. For urgent health issues, please contact a medical professional.*`,

  headache: `### 🤕 Understanding Headaches & Relief Strategies

Headaches are extremely common and can stem from many sources. Here is a breakdown of common types and how to manage them:

#### 1. Common Types
* **Tension Headaches:** Dull, aching pain, typically feeling like a tight band around your forehead. Often triggered by stress, eye strain, or dehydration.
* **Migraines:** Intense throbbing pain, usually on one side of the head, often accompanied by sensitivity to light/sound and nausea.
* **Sinus Headaches:** Pain centered around the nose, forehead, and cheeks, often accompanied by congestion.

#### 2. Immediate Self-Care Tips
* **Hydrate:** Drink a large glass of water immediately. Dehydration is a leading cause of sudden headaches.
* **Rest in Dark/Quiet:** Lie down in a quiet, darkened room, especially if you suspect a migraine.
* **Cold/Warm Compress:** Apply a cold pack to your forehead/temples for migraines, or a warm cloth to your neck/shoulders for tension headaches.
* **Acupressure:** Massage the webbed space between your thumb and index finger (LI-4 point) firmly for 1-2 minutes.

#### 3. When to See a Doctor (Red Flags)
> [!WARNING]
> Seek immediate emergency medical care if your headache is:
> * Sudden, extremely severe ("thunderclap" headache).
> * Accompanied by fever, stiff neck, confusion, double vision, or numbness.
> * Follows a head injury.

*Would you like me to help design a hydration or stress reduction plan?*`,

  recipe: `### 🥗 High-Protein Quinoa & Roasted Veggie Bowl (Healthy Recipe)

Here is a delicious, nutrient-dense recipe that promotes sustained energy and is packed with fiber and complete proteins.

* **Prep time:** 15 mins | **Cook time:** 25 mins | **Servings:** 2
* **Nutritional Highlights:** ~410 kcal, 18g Protein, 12g Fiber, Rich in Vitamins A & C.

---

#### 🛒 Ingredients
* **Base:** 1 cup Quinoa (uncooked)
* **Vegetables:** 1 Sweet Potato (cubed), 1 cup Broccoli florets, 1 Bell Pepper (sliced), 1/2 Red Onion (chopped)
* **Protein Boost:** 1 cup canned Chickpeas (rinsed and drained)
* **Dressing:** 2 tbsp Tahini, 1 tbsp Lemon juice, 1 clove Garlic (minced), 1-2 tbsp warm water (to thin)
* **Healthy Fats:** 1/2 Avocado (sliced), 1 tbsp Olive oil (for roasting)

---

#### 🍳 Step-by-Step Instructions

1. **Prep the Oven:** Preheat your oven to 400°F (200°C).
2. **Roast Veggies & Chickpeas:** Toss the cubed sweet potato, broccoli, bell pepper, red onion, and chickpeas with olive oil, salt, pepper, and garlic powder. Spread them on a baking sheet. Roast for 20-25 minutes until tender and slightly browned.
3. **Cook the Quinoa:** While veggies are roasting, rinse quinoa. Combine 1 cup quinoa with 2 cups water in a pot. Bring to a boil, then cover, reduce heat, and simmer for 15 minutes. Remove from heat and let sit covered for 5 minutes, then fluff with a fork.
4. **Whisk the Dressing:** In a small bowl, whisk the tahini, lemon juice, minced garlic, and salt. Gradually stir in warm water until it reaches a smooth, drizzlable consistency.
5. **Assemble the Bowl:** Divide the cooked quinoa into two bowls. Arrange the roasted vegetables and chickpeas on top. Add avocado slices, and drizzle with the creamy tahini dressing.

*Tip: You can add 150g of grilled chicken breast or baked tofu for an extra 30g of protein!*`,

  anxiety: `### 🧘‍♂️ Coping Techniques for Sudden Anxiety & Stress

If you are experiencing a surge of anxiety or feel overwhelmed, these evidence-based techniques can help calm your nervous system in real-time.

#### 1. The 5-4-3-2-1 Grounding Method
This exercise helps anchor your mind in the present moment by engaging all your senses. Look around you and identify:
* 👁️ **5 things you can see** (e.g., a chair, a window, a cup)
* ✋ **4 things you can feel** (e.g., your feet on the floor, your shirt against your skin)
* 👂 **3 things you can hear** (e.g., traffic, wind, hum of a fan)
* 👃 **2 things you can smell** (e.g., soap, coffee, paper)
* 👅 **1 thing you can taste** (even just the neutral taste in your mouth)

#### 2. Box Breathing (Navy SEAL Technique)
* **Step 1:** Inhale slowly through your nose for **4 seconds**.
* **Step 2:** Hold your breath for **4 seconds**.
* **Step 3:** Exhale completely through your mouth for **4 seconds**.
* **Step 4:** Hold your lungs empty for **4 seconds**.
* *Repeat this loop 4-5 times to lower your heart rate and activate the parasympathetic nervous system.*

#### 3. Progressive Muscle Relaxation (PMR)
1. Sit or lie down comfortably.
2. Tense your toes tightly for 5 seconds, then release completely for 10 seconds.
3. Move up your body: tense/relax your calves, thighs, stomach, hands, shoulders, and face.
4. Notice the contrast between tension and complete relaxation.

> [!NOTE]
> Constant anxiety is a signal from your body that it needs rest, hydration, or support. Consider journaling your thoughts, reducing caffeine intake, and getting 7-8 hours of sleep.`,

  code: `### 💻 Responsive React Chat Bubbles Component

Here is a clean, responsive React + Tailwind CSS component for rendering chat bubbles, with message roles, timestamps, and copy actions.

\`\`\`tsx
import React, { useState } from 'react';
import { Bot, User, Check, Copy } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAI = role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={\`flex gap-4 p-4 \${isAI ? 'bg-muted/40' : 'bg-transparent'}\`}>
      <div className={\`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full \${
        isAI ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
      }\`}>
        {isAI ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            {isAI ? 'HealthNavigator AI' : 'You'}
          </span>
          <span className="text-[10px] text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{content}</p>
        
        {isAI && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
\`\`\`

*This component automatically changes background color, avatar icon, and alignment according to the user's role.*`,

  fallback: `Thank you for your inquiry! As **HealthNavigator AI**, I am designed to give you specialized health, fitness, nutrition, and wellness support.

Here are some helpful starting actions:
1. **Explore Symptoms:** Type *"I have a tension headache"* or *"How to identify seasonal allergy symptoms"*.
2. **Nutrition:** Try asking *"What is a high-protein breakfast recipe?"* or *"How much water should I drink daily?"*.
3. **Fitness:** Ask *"Create a 15-minute home flexibility routine"* or *"Explain the benefits of anaerobic exercise"*.
4. **General Assistance:** I can also write code, answer general questions, and assist in drafting copy.

*How can I help you take a step forward in your health journey today?*`
};

const SUGGESTED_PROMPTS = [
  {
    title: "Relieve Headache",
    snippet: "natural remedies and types",
    prompt: "What are some immediate home remedies for a tension headache, and when should I see a doctor?"
  },
  {
    title: "Healthy Meal Bowl",
    snippet: "high protein quinoa recipe",
    prompt: "Can you give me a high-protein healthy quinoa recipe with step-by-step cooking instructions?"
  },
  {
    title: "Calm Anxiety",
    snippet: "grounding techniques",
    prompt: "I feel stressed and anxious right now. What are some breathing or grounding exercises to calm down?"
  },
  {
    title: "React Chat Component",
    snippet: "tailwind styled code",
    prompt: "Show me a clean React and Tailwind CSS component for chat bubbles."
  }
];

// Helper to parse simple markdown to React nodes
function parseMarkdown(text: string) {
  const lines = text.split("\n");
  let inList = false;
  let inCode = false;
  let codeContent: string[] = [];
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block Handler
    if (line.startsWith("```")) {
      if (inCode) {
        inCode = false;
        elements.push(
          <div key={`code-${i}`} className="my-3 overflow-x-auto rounded-lg border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-200">
            <div className="mb-2 flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] uppercase text-zinc-500">
              <span>code block</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeContent.join("\n"))}
                className="flex items-center gap-1 hover:text-white"
              >
                <Copy size={10} /> Copy
              </button>
            </div>
            <pre>{codeContent.join("\n")}</pre>
          </div>
        );
        codeContent = [];
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeContent.push(line);
      continue;
    }

    // Alerts Handler
    if (line.startsWith("> [!WARNING]")) {
      let warningLines = [];
      i++;
      while (i < lines.length && lines[i].startsWith(">")) {
        warningLines.push(lines[i].replace(/^>\s*\*\s*/, "").replace(/^>\s*/, ""));
        i++;
      }
      i--;
      elements.push(
        <div key={`warn-${i}`} className="my-3 flex gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-foreground">
          <Info className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <span className="font-bold text-red-500 block mb-1">Warning</span>
            <div className="space-y-1">{warningLines.map((wl, idx) => <p key={idx}>{wl}</p>)}</div>
          </div>
        </div>
      );
      continue;
    }

    if (line.startsWith("> [!NOTE]")) {
      let noteLines = [];
      i++;
      while (i < lines.length && lines[i].startsWith(">")) {
        noteLines.push(lines[i].replace(/^>\s*\*\s*/, "").replace(/^>\s*/, ""));
        i++;
      }
      i--;
      elements.push(
        <div key={`note-${i}`} className="my-3 flex gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-foreground">
          <Info className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <span className="font-bold text-emerald-500 block mb-1">Note</span>
            <div className="space-y-1">{noteLines.map((nl, idx) => <p key={idx}>{nl}</p>)}</div>
          </div>
        </div>
      );
      continue;
    }

    // Headings Handler
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-base font-bold text-foreground">
          {inlineStyles(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="mt-3 mb-1 text-sm font-bold text-foreground/90">
          {inlineStyles(line.substring(5))}
        </h4>
      );
      continue;
    }

    // Horizontal Rule Handler
    if (line.trim() === "---") {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-t border-border" />);
      continue;
    }

    // Bullet Points Handler
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      if (!inList) {
        inList = true;
      }
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-sm text-foreground/90 leading-relaxed mb-1">
          {inlineStyles(line.trim().substring(2))}
        </li>
      );
      continue;
    }

    // Standard Paragraph
    if (line.trim() !== "") {
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/90 mb-3">
          {inlineStyles(line)}
        </p>
      );
    }
  }

  return elements;
}

// Inline Bold/Italic formatting
function inlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

// Helper to determine date categories for conversations grouping
function groupConversations(chats: Conversation[]) {
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const previous7Days: Conversation[] = [];
  const older: Conversation[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  chats.forEach((chat) => {
    const time = new Date(chat.createdAt).getTime();
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

// Main Chat Page Component
export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [activeModel, setActiveModel] = useState(MODELS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<number | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("healthnav_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveChatId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed parsing chats", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const saveChats = (newChats: Conversation[]) => {
    setConversations(newChats);
    localStorage.setItem("healthnav_chats", JSON.stringify(newChats));
  };

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeChatId, streamingText]);

  // Handle textarea height auto-growth
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const activeChat = conversations.find((c) => c.id === activeChatId);

  // Start New Chat
  const handleNewChat = () => {
    setActiveChatId(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Delete Chat
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const filtered = conversations.filter((c) => c.id !== id);
    saveChats(filtered);

    if (activeChatId === id) {
      if (filtered.length > 0) {
        setActiveChatId(filtered[0].id);
      } else {
        setActiveChatId(null);
      }
    }
  };

  // Start Rename Chat Mode
  const startRenameChat = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingChatId(id);
    setRenameTitle(currentTitle);
  };

  // Confirm Rename Chat
  const saveRenameChat = (id: string) => {
    if (!renameTitle.trim()) return;
    const updated = conversations.map((c) => {
      if (c.id === id) {
        return { ...c, title: renameTitle };
      }
      return c;
    });
    saveChats(updated);
    setRenamingChatId(null);
  };

  // Generate Reply content based on keywords
  const generateMockReply = (userMsg: string): string => {
    const text = userMsg.toLowerCase();
    if (text.includes("headache") || text.includes("migraine")) {
      return MOCK_ANSWERS.headache;
    }
    if (text.includes("recipe") || text.includes("food") || text.includes("quinoa") || text.includes("cook")) {
      return MOCK_ANSWERS.recipe;
    }
    if (text.includes("anxiety") || text.includes("stress") || text.includes("grounding") || text.includes("panic")) {
      return MOCK_ANSWERS.anxiety;
    }
    if (text.includes("code") || text.includes("component") || text.includes("react") || text.includes("css")) {
      return MOCK_ANSWERS.code;
    }
    if (text.includes("hello") || text.includes("hi ") || text.trim() === "hi" || text.includes("hey")) {
      return MOCK_ANSWERS.greetings;
    }
    return MOCK_ANSWERS.fallback;
  };

  // Stream text effect simulating AI typing
  const streamAIResponse = (responseText: string, conversationId: string) => {
    setIsStreaming(true);
    setStreamingText("");
    
    let index = 0;
    const words = responseText.split(" ");
    
    streamIntervalRef.current = window.setInterval(() => {
      if (index < words.length) {
        setStreamingText((prev) => prev + (prev ? " " : "") + words[index]);
        index++;
      } else {
        // Stream completed
        finalizeResponse(responseText, conversationId);
      }
    }, 45); // Speed of word typing
  };

  // Finalize stream and write to history
  const finalizeResponse = (fullText: string, conversationId: string) => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    
    setIsStreaming(false);
    setStreamingText("");

    const aiMessage: Message = {
      id: Math.random().toString(),
      role: "assistant",
      content: fullText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, messages: [...c.messages, aiMessage] };
        }
        return c;
      });
      localStorage.setItem("healthnav_chats", JSON.stringify(updated));
      return updated;
    });
  };

  // Cancel current generation
  const handleStopGeneration = () => {
    if (isStreaming && activeChatId) {
      const textToSave = streamingText + " ... [Generation stopped by user]";
      finalizeResponse(textToSave, activeChatId);
    }
  };

  // Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    setInput("");
    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let targetChatId = activeChatId;

    if (!targetChatId) {
      // Create new conversation
      const newId = Math.random().toString();
      const newChat: Conversation = {
        id: newId,
        title: text.length > 25 ? text.substring(0, 25) + "..." : text,
        messages: [userMessage],
        createdAt: new Date().toISOString(),
        model: activeModel.name
      };
      
      const updatedChats = [newChat, ...conversations];
      saveChats(updatedChats);
      setActiveChatId(newId);
      targetChatId = newId;

      // Start response streaming
      const reply = generateMockReply(text);
      streamAIResponse(reply, newId);
    } else {
      // Append to existing
      const updated = conversations.map((c) => {
        if (c.id === targetChatId) {
          return { ...c, messages: [...c.messages, userMessage] };
        }
        return c;
      });
      saveChats(updated);

      // Start response streaming
      const reply = generateMockReply(text);
      streamAIResponse(reply, targetChatId);
    }
  };

  // Message Copy Handler
  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Thumbs Up / Down Handler
  const handleFeedback = (msgId: string, type: "like" | "dislike") => {
    if (!activeChatId) return;
    const updated = conversations.map((c) => {
      if (c.id === activeChatId) {
        const msgs = c.messages.map((m) => {
          if (m.id === msgId) {
            return { ...m, feedback: m.feedback === type ? null : type };
          }
          return m;
        });
        return { ...c, messages: msgs };
      }
      return c;
    });
    saveChats(updated);
  };

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden animate-fade-in">
        {/* SHADCN UI SIDEBAR */}
        <ChatSidebar
          conversations={conversations}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          renamingChatId={renamingChatId}
          renameTitle={renameTitle}
          setRenameTitle={setRenameTitle}
          saveRenameChat={saveRenameChat}
          startRenameChat={startRenameChat}
          setRenamingChatId={setRenamingChatId}
        />

        {/* MAIN CONTAINER */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          
          {/* TOP HEADER */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border hidden md:block" />
              
              {/* Model Dropdown Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 font-medium px-2 hover:bg-muted select-none">
                    <activeModel.icon className={`h-4 w-4 ${activeModel.color}`} />
                    <span className="text-sm font-semibold">{activeModel.name}</span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-1">
                  {MODELS.map((model) => {
                    const Icon = model.icon;
                    return (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setActiveModel(model)}
                        className="flex flex-col items-start gap-1 p-2 rounded-md cursor-pointer hover:bg-muted"
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <Icon className={`h-4 w-4 ${model.color}`} />
                          <span>{model.name}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{model.description}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                  <Activity size={14} className="animate-pulse" />
                  HealthNavigator Home
                </Button>
              </Link>
            </div>
          </header>

          {/* CHAT VIEWPORT */}
          <div className="flex-1 overflow-y-auto bg-background/50 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              
              {!activeChat && !isStreaming ? (
                // WELCOME STATE (EMPTY CHAT)
                <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 space-y-6">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/15">
                    <Activity className="h-8 w-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                      How can I help you today?
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Ask me health questions, create customized recipes, draft copy, write code, or organize your workout planner.
                    </p>
                  </div>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl pt-4 animate-fade-in-up">
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/40 hover:border-emerald-500/30 transition-all group duration-200"
                      >
                        <span className="font-semibold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {item.snippet}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // MESSAGES LIST
                <div className="space-y-6">
                  {/* Past messages */}
                  {activeChat?.messages.map((message) => {
                    const isAI = message.role === "assistant";
                    return (
                      <div key={message.id} className="flex gap-4 group animate-fade-in">
                        {/* Avatar */}
                        <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
                          isAI ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {isAI ? <Bot size={16} /> : <User size={16} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1.5 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">
                              {isAI ? "HealthNavigator AI" : "You"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {message.timestamp}
                            </span>
                          </div>
                          
                          {/* Markdown Styled Box */}
                          <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90">
                            {parseMarkdown(message.content)}
                          </div>

                          {/* Message Actions */}
                          {isAI && (
                            <div className="flex items-center gap-1.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopyMessage(message.id, message.content)}
                                title="Copy content"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 hover:bg-muted ${
                                  message.feedback === "like" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => handleFeedback(message.id, "like")}
                                title="Good response"
                              >
                                <ThumbsUp size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 hover:bg-muted ${
                                  message.feedback === "dislike" ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => handleFeedback(message.id, "dislike")}
                                title="Bad response"
                              >
                                <ThumbsDown size={12} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming Message Indicator */}
                  {isStreaming && streamingText && (
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white">
                        <Bot size={16} />
                      </div>
                      <div className="flex-1 space-y-1.5 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">HealthNavigator AI</span>
                          <span className="text-[10px] text-muted-foreground">Generating...</span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90">
                          {parseMarkdown(streamingText)}
                          <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-500 animate-pulse align-middle" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* BOTTOM FLOATING INPUT */}
          <footer className="px-4 py-4 md:px-8 shrink-0 bg-background/80 border-t border-border backdrop-blur-sm">
            <div className="mx-auto max-w-3xl relative">
              <div className="relative flex items-end w-full rounded-2xl border border-border bg-card shadow-sm focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all overflow-hidden p-2 pr-12 pl-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                  title="Attach file (mocked)"
                >
                  <Paperclip size={16} />
                </Button>
                
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
                  placeholder={`Message ${activeModel.name}...`}
                  className="flex-1 min-h-[36px] max-h-[180px] bg-transparent resize-none border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground py-2 px-3 self-center overflow-y-auto no-scrollbar"
                  rows={1}
                />

                {isStreaming ? (
                  <Button
                    onClick={handleStopGeneration}
                    size="icon"
                    className="absolute right-3 bottom-3 h-8 w-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl"
                  >
                    <Square size={12} className="fill-current" />
                  </Button>
                ) : (
                  <Button
                    disabled={!input.trim()}
                    onClick={() => handleSendMessage()}
                    size="icon"
                    className={`absolute right-3 bottom-3 h-8 w-8 rounded-xl transition-all ${
                      input.trim()
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/10 hover:opacity-90"
                        : "bg-muted text-muted-foreground pointer-events-none"
                    }`}
                  >
                    <ArrowUp size={14} className="stroke-[3]" />
                  </Button>
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                HealthNavigator AI can make errors. Verify medical and dosage information with a professional doctor.
              </p>
            </div>
          </footer>

        </div>
      </div>
    </SidebarProvider>
  );
}

// ==========================================
// SUBCOMPONENTS - SHADCN SIDEBAR IMPLEMENTATION
// ==========================================
interface ChatSidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  renamingChatId: string | null;
  renameTitle: string;
  setRenameTitle: (val: string) => void;
  saveRenameChat: (id: string) => void;
  startRenameChat: (id: string, currentTitle: string, e: React.MouseEvent) => void;
  setRenamingChatId: (val: string | null) => void;
}

function ChatSidebar({
  conversations,
  activeChatId,
  setActiveChatId,
  onNewChat,
  onDeleteChat,
  renamingChatId,
  renameTitle,
  setRenameTitle,
  saveRenameChat,
  startRenameChat,
  setRenamingChatId
}: ChatSidebarProps) {
  const { theme, setTheme } = useTheme();
  
  // Group conversations by period
  const { today, yesterday, previous7Days, older } = groupConversations(conversations);

  const renderChatListItem = (chat: Conversation) => {
    const isActive = chat.id === activeChatId;
    const isRenaming = chat.id === renamingChatId;

    return (
      <SidebarMenuItem key={chat.id}>
        {isRenaming ? (
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md w-full">
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRenameChat(chat.id);
                if (e.key === "Escape") setRenamingChatId(null);
              }}
              className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 border-0 focus:ring-0 text-foreground"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 hover:bg-emerald-500/20 text-emerald-600"
              onClick={() => saveRenameChat(chat.id)}
            >
              <Check size={10} />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => setActiveChatId(chat.id)}
            className={`group/item flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer select-none ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 truncate flex-1">
              <MessageSquare size={14} className="shrink-0 opacity-70" />
              <span className="truncate">{chat.title}</span>
            </div>
            
            {/* Actions for chat history item */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={(e) => startRenameChat(chat.id, chat.title, e)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                title="Rename chat"
              >
                <Edit2 size={11} />
              </button>
              <button
                onClick={(e) => onDeleteChat(chat.id, e)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500"
                title="Delete chat"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar shrink-0">
      
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
        <Link to="/" className="flex items-center space-x-2 mb-4 group/logo">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md transition-transform group-hover/logo:scale-105">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-sm font-bold tracking-tight text-transparent dark:from-emerald-400 dark:to-teal-300">
            HealthNavigator
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
            AI
          </span>
        </Link>

        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs shadow-md border-0 transition-transform active:scale-98"
        >
          <Plus size={14} className="stroke-[3]" />
          New Chat
        </Button>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="p-2 space-y-4 no-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <MessageSquare size={20} className="stroke-[1.5] mb-2 opacity-40" />
            <span className="text-[11px]">No chat history</span>
          </div>
        ) : (
          <SidebarMenu className="space-y-4">
            {/* Today's chats */}
            {today.length > 0 && (
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Today</span>
                <div className="space-y-0.5">{today.map(renderChatListItem)}</div>
              </div>
            )}

            {/* Yesterday's chats */}
            {yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Yesterday</span>
                <div className="space-y-0.5">{yesterday.map(renderChatListItem)}</div>
              </div>
            )}

            {/* Past 7 Days */}
            {previous7Days.length > 0 && (
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Previous 7 Days</span>
                <div className="space-y-0.5">{previous7Days.map(renderChatListItem)}</div>
              </div>
            )}

            {/* Older */}
            {older.length > 0 && (
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Older</span>
                <div className="space-y-0.5">{older.map(renderChatListItem)}</div>
              </div>
            )}
          </SidebarMenu>
        )}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar/50 flex flex-col gap-2">
        {/* Theme Toggle Button */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1.5 border border-border/40">
          <span className="text-[11px] font-medium text-muted-foreground pl-1.5 flex items-center gap-1.5">
            {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
            Theme
          </span>
          <div className="flex gap-0.5">
            <Button
              size="icon"
              variant={theme === "light" ? "secondary" : "ghost"}
              className="h-5 w-5 rounded-md p-0"
              onClick={() => setTheme("light")}
              title="Light mode"
            >
              <Sun size={11} />
            </Button>
            <Button
              size="icon"
              variant={theme === "dark" ? "secondary" : "ghost"}
              className="h-5 w-5 rounded-md p-0"
              onClick={() => setTheme("dark")}
              title="Dark mode"
            >
              <Moon size={11} />
            </Button>
          </div>
        </div>

        {/* Profile Card & Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-1.5 hover:bg-muted rounded-xl cursor-pointer group transition-colors select-none w-full border border-transparent hover:border-border/40">
              <Avatar size="sm" className="border border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">PS</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 flex flex-col items-start">
                <span className="text-xs font-semibold text-foreground truncate block">Prakash Singh</span>
                <span className="text-[9px] text-muted-foreground truncate block">prakash@healthnav.ai</span>
              </div>
              <ChevronDown size={12} className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <div className="px-2 py-1.5 flex flex-col">
              <span className="text-xs font-semibold text-foreground">Prakash Singh</span>
              <span className="text-[10px] text-muted-foreground">prakash@healthnav.ai</span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-xs rounded-md">
              <Settings size={14} className="text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-xs rounded-md text-red-500 hover:text-red-500 hover:bg-red-500/10">
              <LogOut size={14} />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

    </Sidebar>
  );
}
