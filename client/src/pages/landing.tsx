import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Shield,
  Sparkles,
  Brain,
  MessageSquare,
  FileText,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

// Types for Chat Mockup
interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface DemoScenario {
  title: string;
  prompt: string;
  steps: string[];
  response: string;
}

export default function LandingPage() {

  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoChat, setDemoChat] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingProgress, setTypingProgress] = useState<string>("");

  const demoScenarios: DemoScenario[] = [
    {
      title: "Throbbing Headache",
      prompt: "I have a throbbing headache on one side of my head, accompanied by nausea and sensitivity to light.",
      steps: [
        "Analyzing symptom patterns...",
        "Cross-referencing with migraine and neurological data...",
        "Identifying environmental triggers...",
        "Drafting clinical navigation guidance...",
      ],
      response: "Based on your description, this strongly aligns with a **migraine episode**. \n\n**Potential Actions:**\n1. Rest in a dark, quiet room.\n2. Apply a cold compress to your forehead.\n3. Stay hydrated and avoid caffeine.\n\n*Recommended Doctor Triage:* Primary Care Physician or Neurologist if headaches are frequent or severe. Seek urgent care if accompanied by sudden vision loss or speech difficulties.",
    },
    {
      title: "Acid Reflux Symptoms",
      prompt: "I feel a burning sensation in my chest after eating, especially when lying down.",
      steps: [
        "Evaluating gastrointestinal markers...",
        "Checking correlation with GERD criteria...",
        "Formulating lifestyle adjustment options...",
        "Generating diet guidelines...",
      ],
      response: "Your symptoms are typical of **acid reflux (GERD)**.\n\n**Immediate Lifestyle Tips:**\n1. Avoid lying down for 2-3 hours after eating.\n2. Reduce intake of spicy, acidic, or fatty foods.\n3. Eat smaller, more frequent meals.\n\n*Recommended Doctor Triage:* Gastroenterologist if symptoms persist more than twice a week despite over-the-counter antacids.",
    },
    {
      title: "Mild Joint Stiffness",
      prompt: "My knees are stiff in the morning for about 15 minutes, but it gets better once I start moving.",
      steps: [
        "Analyzing musculoskeletal load indicators...",
        "Evaluating joint wear-and-tear history...",
        "Assessing low-impact mobility recommendations...",
        "Compiling clinical advice...",
      ],
      response: "Morning stiffness that resolves within 15 minutes suggests early-stage **osteoarthritis** or joint strain.\n\n**Self-Care Strategies:**\n1. Perform gentle, low-impact morning stretches.\n2. Maintain a moderate, regular exercise routine (e.g., swimming or cycling).\n3. Apply warmth to stiff joints to relax muscles.\n\n*Recommended Doctor Triage:* Rheumatologist or Orthopedic Specialist for clinical evaluation and imaging if pain escalates.",
    },
  ];

  // Handle running the interactive demo chatbot simulator
  const runDemo = async (index: number) => {
    if (isTyping) return;
    const scenario = demoScenarios[index];
    setSelectedDemo(index);
    setDemoChat([{ sender: "user", text: scenario.prompt }]);
    setIsTyping(true);

    // Animate the analyzing steps
    for (let i = 0; i < scenario.steps.length; i++) {
      setTypingProgress(scenario.steps[i]);
      setDemoStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Add AI message with typing effect
    setIsTyping(false);
    setDemoChat((prev) => [...prev, { sender: "ai", text: scenario.response }]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[100px] dark:bg-teal-500/5" />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Next-Gen Medical Navigator
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            >
              Navigate Your Health With{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200">
                Absolute Clarity
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl"
            >
              Analyze symptoms, map healthcare choices, and reference medical literature instantaneously. Empowering your wellness journey with AI-driven clarity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-start"
            >
              <Link to="/signup">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-8 py-6 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 text-base font-semibold border-0 gap-2 transition-transform hover:scale-105">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-xl text-base font-semibold border-border hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Try Interactive Demo
                </Button>
              </a>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-4 border-t border-border max-w-lg"
            >
              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground">99.2%</h4>
                <p className="text-xs text-muted-foreground">Clinical Accuracy Matches</p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground">24/7</h4>
                <p className="text-xs text-muted-foreground">Virtual Navigation Triage</p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground">100%</h4>
                <p className="text-xs text-muted-foreground">HIPAA Secure & Encrypted</p>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto w-full max-w-[400px] lg:max-w-none aspect-[4/5] rounded-3xl border border-border bg-card/60 backdrop-blur-xl shadow-2xl p-6 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400" />
              
              {/* Inside Mockup UI */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">Health Scan Engine</h5>
                    <p className="text-[10px] text-muted-foreground">Checking live directories</p>
                  </div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-4 pt-4 h-[calc(100%-80px)] flex flex-col justify-between">
                {/* Simulated Scans */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs flex justify-between items-center hover:bg-muted/60 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Brain className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-foreground">Symptom Mapping</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Ready
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs flex justify-between items-center hover:bg-muted/60 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-teal-500/10 text-teal-500 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-foreground">Literature Reference</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Ready
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-emerald-500/5 dark:bg-emerald-400/5 text-xs flex flex-col gap-2 relative">
                    <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">Triage Intelligence Active</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      AI is ready to cross-reference diagnostic guidance. Choose a scenario below to run a simulation.
                    </p>
                  </div>
                </div>

                {/* Floating Heart Beat Graph Mockup */}
                <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-4">
                  <div className="w-full h-8 overflow-hidden relative flex items-center">
                    <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-500 stroke-current stroke-2 fill-none">
                      <path d="M0,15 L30,15 L35,5 L40,25 L45,15 L50,15 L55,10 L60,20 L65,15 L100,15" className="animate-[dash_2s_linear_infinite]" strokeDasharray="100" strokeDashoffset="0" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 bg-muted/20 border-y border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Intelligent Healthcare Decoupled from Complexity
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Navigating healthcare shouldn't feel like searching a labyrinth. Our assistant offers modular guidance tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="h-full border-border bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-emerald-500/5 group-hover:border-emerald-500/40">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">Symptom Deciphering</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Convert vague physical discomfort descriptions into parsed medical vocabulary suitable for clinician dialog.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="h-full border-border bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-emerald-500/5 group-hover:border-emerald-500/40">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">HIPAA-Grade Security</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your records and query summaries are double-encrypted. Your personal health identity remains strictly confidential.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="h-full border-border bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-emerald-500/5 group-hover:border-emerald-500/40">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">Doctor Match Roadmap</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Instantly identify which specific clinical specialty matches your analysis, avoiding circular clinic references.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="h-full border-border bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-emerald-500/5 group-hover:border-emerald-500/40">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">24/7 Clinical Reference</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No waiting lines or clinical appointment delays. Check primary queries instantly before calling your doctor.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Simple 3-Step Navigation Triage
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We guide you from symptoms to actionable clarity in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-[32px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-500/30 to-teal-500/30 -z-10" />

            {/* Step 1 */}
            <div className="text-center space-y-4 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold relative shadow-md shadow-emerald-500/5">
                01
                <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping opacity-25" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Input Symptoms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Describe how you feel, where the discomfort is, and any associated conditions. Simply use free-text.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl font-bold relative shadow-md shadow-teal-500/5">
                02
              </div>
              <h3 className="text-lg font-bold text-foreground">Contextual Processing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Our engine parses medical guidelines and cross-references your description for clinical clarity.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold relative shadow-md shadow-emerald-500/5">
                03
              </div>
              <h3 className="text-lg font-bold text-foreground">Actionable Roadmap</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Receive doctor triage warnings, self-care suggestions, and precise reference guides to show your physician.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Demo Section */}
      <section id="demo" className="relative z-10 py-20 bg-muted/20 border-y border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Experience the Triage Simulator
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Test how the AI Health Information Navigator structures responses. Choose one of our sample prompts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Scenario Picker */}
            <div className="lg:col-span-4 flex flex-col justify-start gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                Simulated Scenarios
              </h3>
              {demoScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => runDemo(index)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group relative overflow-hidden ${
                    selectedDemo === index
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-400/5 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-card/60 hover:bg-muted/50 hover:border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
                  disabled={isTyping}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedDemo === index ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                    }`}>
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{scenario.title}</h4>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{scenario.prompt}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>

            {/* Chatbot Visual Container */}
            <div className="lg:col-span-8">
              <Card className="h-full border-border bg-card/60 backdrop-blur-md flex flex-col shadow-xl min-h-[400px]">
                <CardContent className="p-0 flex flex-col h-full justify-between">
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm">
                        <Activity className="h-4.5 w-4.5" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Interactive Navigator Triage</h4>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">System Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 p-6 space-y-4 min-h-[300px] overflow-y-auto">
                    {demoChat.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                        <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Activity className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">Awaiting Input Simulation</h4>
                          <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            Click one of the scenario buttons on the left to see the AI Health Navigator in action.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {demoChat.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                          >
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                              msg.sender === "user" ? "bg-emerald-600 text-white" : "bg-muted text-foreground"
                            }`}>
                              {msg.sender === "user" ? "U" : "AI"}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-emerald-600 text-white rounded-tr-none"
                                : "bg-muted/80 text-foreground border border-border rounded-tl-none whitespace-pre-line"
                            }`}>
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Analyzing Loader overlay */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-3"
                      >
                        <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Processing Engine</span>
                          <span className="animate-pulse">{typingProgress}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="bg-emerald-500 h-1.5"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(demoStep / 4) * 100}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Chat Footer warning */}
                  <div className="px-6 py-3.5 border-t border-border/80 bg-muted/10 text-[10px] text-center text-muted-foreground leading-relaxed rounded-b-xl">
                    Disclaimer: This tool provides quick mock simulation for demonstration purposes. Use clinical authentication before treating symptoms.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Testimonial Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Clinical & Patient Consensus
            </h2>
            <p className="text-lg text-muted-foreground">
              Doctors and patients alike rely on our navigation mappings for initial clinical orientation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quote 1 */}
            <Card className="border-border bg-card/60 backdrop-blur-sm p-6 relative">
              <CardContent className="p-0 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "HealthNavigator makes my conversations with patients much more efficient. They arrive in the clinic with organized descriptions of their symptoms, which expedites my diagnostic workup."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    DH
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Dr. Helen Chen, MD</h4>
                    <p className="text-[11px] text-muted-foreground">Chief Neurologist, SF General</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote 2 */}
            <Card className="border-border bg-card/60 backdrop-blur-sm p-6 relative">
              <CardContent className="p-0 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "I was always confused about which specialist to visit for my chronic acid reflux. The navigator pointed me straight to gastroenterology and helped me formulate my diet diary."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center font-bold text-teal-600 dark:text-teal-400">
                    MS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Marcus Sterling</h4>
                    <p className="text-[11px] text-muted-foreground">Patient User (GERD recovery)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote 3 */}
            <Card className="border-border bg-card/60 backdrop-blur-sm p-6 relative">
              <CardContent className="p-0 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "The HIPAA-grade privacy settings were a must for me. I can search symptom guides and clinical publications without worrying that my queries will be sold to ad companies."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    AL
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Aria Laurent</h4>
                    <p className="text-[11px] text-muted-foreground">Privacy Advocate & Patient</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 bg-muted/20 border-t border-border">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="faq-1" className="border border-border bg-card/60 px-4 rounded-xl">
              <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-foreground">
                How does AI Health Navigator guarantee my data safety?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                All traffic is encrypted in transit and at rest. We adhere strictly to HIPAA guidelines. Your search metrics are stored anonymously and never linked to advertising trackers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border border-border bg-card/60 px-4 rounded-xl">
              <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-foreground">
                Is this application a replacement for my doctor?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Absolutely not. The AI Health Navigator translates human discomfort vocabulary into organized clinical terminology and identifies doctor routing maps. It cannot write prescriptions or perform physical diagnostics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border border-border bg-card/60 px-4 rounded-xl">
              <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-foreground">
                What reference materials does the AI consult?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Our model utilizes curated clinical databases, peer-reviewed medical publications, and official CDC/WHO public health guidelines to formulate advice templates.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 text-center">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-tr from-emerald-950/80 via-teal-900/60 to-emerald-950/80 dark:from-emerald-950/60 dark:to-teal-950/60 px-6 py-16 sm:px-12 shadow-2xl overflow-hidden">
            {/* Internal design elements */}
            <div className="absolute top-[-20%] right-[-20%] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[60px]" />
            <div className="absolute bottom-[-20%] left-[-20%] h-[300px] w-[300px] rounded-full bg-teal-500/10 blur-[60px]" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Organize Your Healthcare Journey?
              </h2>
              <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed">
                Sign up today to get access to custom records storage, diagnostic summary PDFs, and priority clinical navigators.
              </p>
              <div className="pt-4">
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-900 font-bold px-8 py-6 rounded-xl border-0 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105">
                    Create Your Account Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
