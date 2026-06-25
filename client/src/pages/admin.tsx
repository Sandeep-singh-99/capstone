import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  Plus,
  Search,
  Trash2,
  Edit,
  ShieldAlert,
  Check,
  X,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Sliders,
  Database,
  Bell,
  FileText,
  Filter,
  Lock,
  Unlock,
  TrendingUp,
  Mail,
  UserPlus
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

// Types & Mock Data Interfaces
interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  status: "Active" | "Pending Approval" | "Suspended";
  joinedDate: string;
  avatarFallback: string;
  bio: string;
  patientsTreated: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Suspended";
  joinedDate: string;
  avatarFallback: string;
  age: number;
  gender: string;
}

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  category: "doctors" | "users" | "system" | "security";
  admin: string;
}

// Pre-populated Doctor Mock Data
const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@healthnav.ai",
    specialty: "Cardiology",
    status: "Active",
    joinedDate: "2026-01-12",
    avatarFallback: "SJ",
    bio: "Senior cardiologist with over 12 years of experience in cardiovascular health.",
    patientsTreated: 420
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    email: "m.vance@healthnav.ai",
    specialty: "Pediatrics",
    status: "Pending Approval",
    joinedDate: "2026-06-20",
    avatarFallback: "MV",
    bio: "Specialist in pediatric medicine, focusing on preventative child health.",
    patientsTreated: 0
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    email: "e.rostova@healthnav.ai",
    specialty: "General Medicine",
    status: "Active",
    joinedDate: "2026-03-05",
    avatarFallback: "ER",
    bio: "Dedicated primary care physician focused on holistic and preventative family health.",
    patientsTreated: 950
  },
  {
    id: "doc-4",
    name: "Dr. Kenji Tanaka",
    email: "k.tanaka@healthnav.ai",
    specialty: "Dermatology",
    status: "Suspended",
    joinedDate: "2026-02-18",
    avatarFallback: "KT",
    bio: "Clinical dermatologist specialized in inflammatory skin conditions and oncology.",
    patientsTreated: 180
  }
];

// Pre-populated Patient User Mock Data
const INITIAL_USERS: User[] = [
  {
    id: "usr-1",
    name: "John Doe",
    email: "john.doe@gmail.com",
    status: "Active",
    joinedDate: "2026-04-10",
    avatarFallback: "JD",
    age: 34,
    gender: "Male"
  },
  {
    id: "usr-2",
    name: "Alice Smith",
    email: "alice.s@yahoo.com",
    status: "Active",
    joinedDate: "2026-05-15",
    avatarFallback: "AS",
    age: 28,
    gender: "Female"
  },
  {
    id: "usr-3",
    name: "Robert Lee",
    email: "rlee99@outlook.com",
    status: "Suspended",
    joinedDate: "2026-03-01",
    avatarFallback: "RL",
    age: 45,
    gender: "Male"
  },
  {
    id: "usr-4",
    name: "Clara Oswald",
    email: "clara.o@gmail.com",
    status: "Active",
    joinedDate: "2026-06-22",
    avatarFallback: "CO",
    age: 25,
    gender: "Female"
  }
];

// Pre-populated System Audit Log Mock Data
const INITIAL_LOGS: AuditLog[] = [
  {
    id: "log-1",
    action: "Approved Doctor credentials for Dr. Elena Rostova",
    timestamp: "2026-06-25 09:12:45",
    category: "doctors",
    admin: "Prakash Singh"
  },
  {
    id: "log-2",
    action: "Suspended User Robert Lee (Reason: Policy Violations)",
    timestamp: "2026-06-24 15:30:10",
    category: "users",
    admin: "Prakash Singh"
  },
  {
    id: "log-3",
    action: "Updated safety filter configurations to 'Standard'",
    timestamp: "2026-06-23 11:45:00",
    category: "system",
    admin: "Prakash Singh"
  },
  {
    id: "log-4",
    action: "Dr. Kenji Tanaka status marked as Suspended",
    timestamp: "2026-06-22 17:05:22",
    category: "doctors",
    admin: "Prakash Singh"
  }
];

export default function AdminPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "doctors" | "users" | "settings">("dashboard");

  // Search & Filter States
  const [doctorQuery, setDoctorQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");

  // Modals Toggle States
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  
  // Form State for Adding Doctor
  const [newDoc, setNewDoc] = useState({
    name: "",
    email: "",
    specialty: "General Medicine",
    status: "Active" as Doctor["status"],
    bio: ""
  });

  // Form State for Editing Doctor
  const [editDocData, setEditDocData] = useState<Doctor | null>(null);

  // Settings Configuration Form State
  const [settings, setSettings] = useState({
    safetyLevel: "Standard",
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: "Weekly",
    apiKey: "hn_live_e93847fae3012bb8c74"
  });

  const [settingsSaved, setSettingsSaved] = useState(false);

  // Add a log entry helper
  const addLog = (action: string, category: AuditLog["category"]) => {
    const newLog: AuditLog = {
      id: Math.random().toString(),
      action,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category,
      admin: "Prakash Singh"
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Manage Doctors: Add Doctor
  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name.trim() || !newDoc.email.trim()) return;

    const added: Doctor = {
      id: `doc-${Math.random().toString().substring(2, 6)}`,
      name: newDoc.name,
      email: newDoc.email,
      specialty: newDoc.specialty,
      status: newDoc.status,
      joinedDate: new Date().toISOString().substring(0, 10),
      avatarFallback: newDoc.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2),
      bio: newDoc.bio,
      patientsTreated: 0
    };

    setDoctors((prev) => [added, ...prev]);
    addLog(`Registered new doctor: ${added.name} (${added.specialty})`, "doctors");
    
    // Reset form
    setNewDoc({
      name: "",
      email: "",
      specialty: "General Medicine",
      status: "Active",
      bio: ""
    });
    setShowAddDocModal(false);
  };

  // Manage Doctors: Edit Doctor Setup
  const setupEditDoctor = (doc: Doctor) => {
    setEditDocData(doc);
    setShowEditDocModal(true);
  };

  // Manage Doctors: Submit Edit Doctor
  const handleEditDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDocData) return;

    setDoctors((prev) =>
      prev.map((d) => (d.id === editDocData.id ? editDocData : d))
    );
    addLog(`Modified profile details for ${editDocData.name}`, "doctors");
    setShowEditDocModal(false);
    setEditDocData(null);
  };

  // Manage Doctors: Approve Doctor
  const handleApproveDoctor = (id: string, name: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Active" } : d))
    );
    addLog(`Approved pending credentials for ${name}`, "doctors");
  };

  // Manage Doctors: Suspend Doctor
  const handleSuspendDoctor = (id: string, name: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Suspended" } : d))
    );
    addLog(`Suspended Doctor profile: ${name}`, "doctors");
  };

  // Manage Doctors: Reactivate Doctor
  const handleReactivateDoctor = (id: string, name: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Active" } : d))
    );
    addLog(`Re-activated Doctor profile: ${name}`, "doctors");
  };

  // Manage Doctors: Delete Doctor
  const handleDeleteDoctor = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the directory?`)) {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      addLog(`Removed doctor ${name} from directory`, "doctors");
    }
  };

  // Manage Users: Toggle Suspension
  const handleToggleUserSuspension = (id: string, name: string, currentStatus: User["status"]) => {
    const targetStatus = currentStatus === "Active" ? "Suspended" : "Active";
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: targetStatus } : u))
    );
    addLog(`${targetStatus === "Suspended" ? "Suspended" : "Un-suspended"} patient account: ${name}`, "users");
  };

  // Manage Users: Delete User
  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete patient account: ${name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addLog(`Deleted patient account: ${name}`, "users");
    }
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    addLog("Modified system configurations & safety parameters", "system");
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Filters
  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase())
  );

  // Statistics calculations
  const pendingDocsCount = doctors.filter((d) => d.status === "Pending Approval").length;
  const activeDocsCount = doctors.filter((d) => d.status === "Active").length;
  const activeUsersCount = users.filter((u) => u.status === "Active").length;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        
        {/* SHADCN SIDEBAR FOR ADMIN PANEL */}
        <Sidebar className="border-r border-sidebar-border bg-sidebar shrink-0">
          <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
            <Link to="/" className="flex items-center space-x-2 mb-4 group/logo">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md transition-transform">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-sm font-bold tracking-tight text-transparent dark:from-emerald-400 dark:to-teal-300">
                  HealthNavigator
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold -mt-1 tracking-wider uppercase">ADMIN PORTAL</span>
              </div>
            </Link>
          </SidebarHeader>

          {/* Sidebar Menu Options */}
          <SidebarContent className="p-2 space-y-1 no-scrollbar">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  className="w-full gap-3 cursor-pointer"
                >
                  <Activity size={16} />
                  <span>Dashboard & Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "doctors"}
                  onClick={() => setActiveTab("doctors")}
                  className="w-full gap-3 cursor-pointer"
                >
                  <Users size={16} />
                  <span>Manage Doctors</span>
                  {pendingDocsCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                      {pendingDocsCount}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "users"}
                  onClick={() => setActiveTab("users")}
                  className="w-full gap-3 cursor-pointer"
                >
                  <Users size={16} />
                  <span>Manage Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  className="w-full gap-3 cursor-pointer"
                >
                  <Settings size={16} />
                  <span>System Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          {/* Sidebar Footer with theme switcher & profile dropdown */}
          <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar/50 flex flex-col gap-2">
            <AdminThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-1.5 hover:bg-muted rounded-xl cursor-pointer group transition-colors select-none w-full border border-transparent hover:border-border/40">
                  <Avatar size="sm" className="border border-border">
                    <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">PS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <span className="text-xs font-semibold text-foreground truncate block">Prakash Singh</span>
                    <span className="text-[9px] text-muted-foreground truncate block">prakash.admin@healthnav.ai</span>
                  </div>
                  <ChevronDown size={12} className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <div className="px-2 py-1.5 flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Prakash Singh</span>
                  <span className="text-[10px] text-muted-foreground">Admin Officer</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs rounded-md text-red-500 hover:text-red-500 hover:bg-red-500/10">
                  <LogOut size={14} />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN DISPLAY REGION */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          
          {/* HEADER HEADER */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border hidden md:block" />
              <h1 className="text-sm font-bold capitalize text-foreground">
                {activeTab === "dashboard" ? "Dashboard & Analytics" : activeTab === "doctors" ? "Manage Doctors" : activeTab === "users" ? "Manage Patients" : "System Configurations"}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/chat">
                <Button size="sm" variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5">
                  <Activity size={13} />
                  Open AI Chat
                </Button>
              </Link>
            </div>
          </header>

          {/* TAB CONTENTS VIEWPORTS */}
          <div className="flex-1 overflow-y-auto bg-background/50 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
              
              {/* =======================================================
                  TAB: DASHBOARD
                  ======================================================= */}
              {activeTab === "dashboard" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* METRIC COUNTER CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Total Users</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Users size={16} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{users.length}</span>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center">
                          +24% this week
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Active Doctors</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                          <Users size={16} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{activeDocsCount}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {pendingDocsCount} pending approval
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Consultation Chats</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                          <Activity size={16} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">1,280</span>
                        <span className="text-xs text-purple-600 font-semibold">
                          +15% active
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">System Alerts</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                          <ShieldAlert size={16} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {pendingDocsCount}
                        </span>
                        <span className="text-xs text-red-600 font-semibold">
                          Actions required
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SVG ANALYTICS LINE CHART */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-base text-foreground">Weekly Chat Activities</h3>
                        <p className="text-xs text-muted-foreground">Volume of user-AI consult sessions over the last 7 days</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <TrendingUp size={14} />
                        Average: 182 chats/day
                      </div>
                    </div>

                    {/* Glowing SVG Path */}
                    <div className="w-full overflow-hidden">
                      <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible select-none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-border/40" strokeWidth="0.5" strokeDasharray="3" />
                        <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-border/40" strokeWidth="0.5" strokeDasharray="3" />
                        <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-border/40" strokeWidth="0.5" strokeDasharray="3" />
                        
                        {/* Gradient Area */}
                        <path
                          d="M 10 140 Q 80 80, 150 110 T 290 50 T 430 90 Q 465 60, 490 30 L 490 150 L 10 150 Z"
                          fill="url(#chartGradient)"
                        />

                        {/* Chart Line */}
                        <path
                          d="M 10 140 Q 80 80, 150 110 T 290 50 T 430 90 Q 465 60, 490 30"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Data Points */}
                        <circle cx="10" cy="140" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="85" cy="98" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="150" cy="110" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="220" cy="80" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="290" cy="50" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="360" cy="72" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="430" cy="90" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="490" cy="30" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />

                        {/* Labels */}
                        <text x="10" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Mon</text>
                        <text x="85" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Tue</text>
                        <text x="150" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Wed</text>
                        <text x="220" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Thu</text>
                        <text x="290" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Fri</text>
                        <text x="360" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Sat</text>
                        <text x="430" y="170" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">Sun</text>
                        <text x="490" y="170" textAnchor="end" className="text-[10px] fill-muted-foreground font-medium">Today</text>
                      </svg>
                    </div>
                  </div>

                  {/* PENDING APPROVAL QUEUE & RECENT SYSTEM LOGS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* APPROVAL QUEUE */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                      <h3 className="font-bold text-base text-foreground mb-4">Doctor Registration Approvals</h3>
                      
                      {pendingDocsCount === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
                          <Check className="h-6 w-6 text-emerald-500 mb-2" />
                          <span className="text-xs font-semibold">All registrations processed</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {doctors
                            .filter((d) => d.status === "Pending Approval")
                            .map((doc) => (
                              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-muted/25 gap-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-sm">
                                      {doc.avatarFallback}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="text-xs font-bold text-foreground">{doc.name}</h4>
                                    <p className="text-[10px] text-muted-foreground">{doc.specialty} • Registered: {doc.joinedDate}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveDoctor(doc.id, doc.name)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-8 px-3 font-semibold"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                                    className="text-red-500 hover:bg-red-500/10 border-red-500/20 text-[11px] h-8 px-3 font-semibold"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* SYSTEM AUDIT LOG */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-foreground">Recent Security & System Logs</h3>
                        <FileText size={16} className="text-muted-foreground" />
                      </div>
                      
                      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 no-scrollbar flex-1">
                        {logs.map((log) => {
                          const categoryColor =
                            log.category === "doctors"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : log.category === "users"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20";
                          return (
                            <div key={log.id} className="flex items-start gap-3 text-xs border-b border-border/40 pb-2">
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold shrink-0 ${categoryColor}`}>
                                {log.category}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground/90 font-medium leading-normal break-words">{log.action}</p>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">
                                  {log.timestamp} • Admin: {log.admin}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* =======================================================
                  TAB: MANAGE DOCTORS
                  ======================================================= */}
              {activeTab === "doctors" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* DOCTORS CONTROLS */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search doctor name or specialty..."
                        value={doctorQuery}
                        onChange={(e) => setDoctorQuery(e.target.value)}
                        className="pl-9 h-9 w-full rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-foreground"
                      />
                    </div>
                    <Button
                      onClick={() => setShowAddDocModal(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs h-9 gap-1.5 shrink-0"
                    >
                      <Plus size={14} className="stroke-[3]" />
                      Add New Doctor
                    </Button>
                  </div>

                  {/* DOCTORS GRID */}
                  {filteredDoctors.length === 0 ? (
                    <div className="text-center p-12 bg-card border border-border rounded-xl">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-muted-foreground">No doctors match your query</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDoctors.map((doc) => {
                        const isPending = doc.status === "Pending Approval";
                        const isSuspended = doc.status === "Suspended";
                        
                        let badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                        if (isPending) badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                        if (isSuspended) badgeColor = "bg-red-500/10 text-red-600 border-red-500/20";

                        return (
                          <div key={doc.id} className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500/20 transition-all group duration-200">
                            <div>
                              <div className="flex items-start justify-between">
                                <Avatar className="h-10 w-10 border border-border">
                                  <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-sm">
                                    {doc.avatarFallback}
                                  </AvatarFallback>
                                </Avatar>
                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-semibold ${badgeColor}`}>
                                  {doc.status}
                                </span>
                              </div>

                              <div className="mt-3">
                                <h4 className="text-sm font-bold text-foreground leading-normal">{doc.name}</h4>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">{doc.specialty}</span>
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{doc.bio}</p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                                <div>
                                  <span>Patients Treated:</span>
                                  <strong className="block font-bold text-foreground mt-0.5">{doc.patientsTreated}</strong>
                                </div>
                                <div>
                                  <span>Joined On:</span>
                                  <strong className="block font-bold text-foreground mt-0.5">{doc.joinedDate}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Doctor Action Buttons */}
                            <div className="mt-5 flex gap-2 border-t border-border/50 pt-3">
                              {isPending ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveDoctor(doc.id, doc.name)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] h-7 px-2 font-semibold"
                                >
                                  Approve Credentials
                                </Button>
                              ) : isSuspended ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReactivateDoctor(doc.id, doc.name)}
                                  className="flex-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20 text-[10px] h-7 px-2 font-semibold gap-1"
                                >
                                  <Unlock size={10} /> Reactivate
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuspendDoctor(doc.id, doc.name)}
                                  className="flex-1 text-red-500 hover:bg-red-500/10 border-red-500/20 text-[10px] h-7 px-2 font-semibold gap-1"
                                >
                                  <Lock size={10} /> Suspend
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setupEditDoctor(doc)}
                                className="h-7 w-7 p-0 shrink-0 hover:bg-muted border-border/70"
                                title="Edit Profile"
                              >
                                <Edit size={12} className="text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                                className="h-7 w-7 p-0 shrink-0 hover:bg-red-500/10 border-red-500/20"
                                title="Remove Doctor"
                              >
                                <Trash2 size={12} className="text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* =======================================================
                  TAB: MANAGE USERS
                  ======================================================= */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* PATIENT CONTROLS */}
                  <div className="flex gap-3 max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search patient name or email account..."
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        className="pl-9 h-9 w-full rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-foreground"
                      />
                    </div>
                  </div>

                  {/* PATIENTS TABLE */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase">
                            <th className="p-4">Patient</th>
                            <th className="p-4">Age / Gender</th>
                            <th className="p-4">Account Status</th>
                            <th className="p-4">Registration Date</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No registered patients found.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => {
                              const isSuspended = user.status === "Suspended";
                              return (
                                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8 border border-border">
                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-semibold text-xs">
                                          {user.avatarFallback}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <span className="font-bold text-foreground block">{user.name}</span>
                                        <span className="text-[10px] text-muted-foreground block">{user.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 text-muted-foreground font-medium">
                                    {user.age} yrs • {user.gender}
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-semibold ${
                                      isSuspended
                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    }`}>
                                      {user.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-muted-foreground font-medium">
                                    {user.joinedDate}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className={`h-7 text-[10px] font-semibold gap-1 ${
                                          isSuspended
                                            ? "text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20"
                                            : "text-red-500 hover:bg-red-500/10 border-red-500/20"
                                        }`}
                                        onClick={() => handleToggleUserSuspension(user.id, user.name, user.status)}
                                      >
                                        {isSuspended ? (
                                          <>
                                            <Unlock size={10} /> Unsuspend
                                          </>
                                        ) : (
                                          <>
                                            <Lock size={10} /> Suspend
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 hover:bg-red-500/10 border-red-500/20"
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        title="Delete Account"
                                      >
                                        <Trash2 size={12} className="text-red-500" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* =======================================================
                  TAB: SETTINGS
                  ======================================================= */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-fade-in max-w-2xl">
                  
                  <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                    <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                      <Sliders size={18} className="text-emerald-500" />
                      Core Settings Config
                    </h3>
                    
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      
                      {/* Safety filter setting */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">AI Safety Guardrails Level</label>
                        <select
                          value={settings.safetyLevel}
                          onChange={(e) => setSettings({ ...settings, safetyLevel: e.target.value })}
                          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                        >
                          <option value="Conservative">Conservative (High safety checks)</option>
                          <option value="Standard">Standard (Medium safety checks - Recommended)</option>
                          <option value="Permissive">Permissive (Low safety checks)</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground">Adjusts how strictly the AI flags queries for medical disclaimers.</p>
                      </div>

                      {/* Backup Frequency setting */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Database Backup Frequency</label>
                        <select
                          value={settings.backupFrequency}
                          onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>

                      {/* API Key credential */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Integration API Token Key</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={settings.apiKey}
                            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                            className="h-9 w-full rounded-lg border border-border bg-background px-3 pr-10 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-mono"
                          />
                          <Database className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="pt-2 space-y-3">
                        {/* Maintenance switch */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-foreground block">System Maintenance Mode</span>
                            <span className="text-[10px] text-muted-foreground">Puts the application into read-only mode for users.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Email Notifications switch */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-foreground block">Send Admin Email Summaries</span>
                            <span className="text-[10px] text-muted-foreground">Receive weekly analytics charts and security alert logs.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Success Feedback message */}
                      {settingsSaved && (
                        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                          <Check size={14} className="stroke-[3]" />
                          System parameters updated successfully!
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs h-9 mt-4 shadow-md border-0"
                      >
                        Save Configurations
                      </Button>

                    </form>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* =======================================================
          MODAL OVERLAYS (ADD / EDIT DOCTOR FORM)
          ======================================================= */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl relative animate-scale-up">
            <button
              onClick={() => setShowAddDocModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="text-emerald-500" size={18} />
              Register New Doctor
            </h3>
            
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. a.pendelton@healthnav.ai"
                  value={newDoc.email}
                  onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">Specialty</label>
                  <select
                    value={newDoc.specialty}
                    onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">Initial Status</label>
                  <select
                    value={newDoc.status}
                    onChange={(e) => setNewDoc({ ...newDoc, status: e.target.value as Doctor["status"] })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Profile Bio</label>
                <textarea
                  placeholder="Brief biography or statement of medical focus..."
                  value={newDoc.bio}
                  onChange={(e) => setNewDoc({ ...newDoc, bio: e.target.value })}
                  className="w-full min-h-[70px] rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDocModal(false)}
                  className="flex-1 text-xs font-semibold h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs h-9 border-0"
                >
                  Create Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditDocModal && editDocData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl relative animate-scale-up">
            <button
              onClick={() => {
                setShowEditDocModal(false);
                setEditDocData(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Edit className="text-emerald-500" size={18} />
              Edit Doctor Profile
            </h3>
            
            <form onSubmit={handleEditDoctor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Full Name</label>
                <input
                  type="text"
                  required
                  value={editDocData.name}
                  onChange={(e) => setEditDocData({ ...editDocData, name: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Email Address</label>
                <input
                  type="email"
                  required
                  value={editDocData.email}
                  onChange={(e) => setEditDocData({ ...editDocData, email: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">Specialty</label>
                  <select
                    value={editDocData.specialty}
                    onChange={(e) => setEditDocData({ ...editDocData, specialty: e.target.value })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">Status</label>
                  <select
                    value={editDocData.status}
                    onChange={(e) => setEditDocData({ ...editDocData, status: e.target.value as Doctor["status"] })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">Profile Bio</label>
                <textarea
                  value={editDocData.bio}
                  onChange={(e) => setEditDocData({ ...editDocData, bio: e.target.value })}
                  className="w-full min-h-[70px] rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDocModal(false);
                    setEditDocData(null);
                  }}
                  className="flex-1 text-xs font-semibold h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs h-9 border-0"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </SidebarProvider>
  );
}

// Subcomponent: Admin Theme Toggle Widget
function AdminThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1.5 border border-border/40">
      <span className="text-[11px] font-medium text-muted-foreground pl-1.5 flex items-center gap-1.5">
        {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
        Theme Mode
      </span>
      <div className="flex gap-0.5">
        <Button
          size="icon"
          variant={theme === "light" ? "secondary" : "ghost"}
          className="h-5 w-5 rounded-md p-0"
          onClick={() => setTheme("light")}
          title="Light theme"
        >
          <Sun size={11} />
        </Button>
        <Button
          size="icon"
          variant={theme === "dark" ? "secondary" : "ghost"}
          className="h-5 w-5 rounded-md p-0"
          onClick={() => setTheme("dark")}
          title="Dark theme"
        >
          <Moon size={11} />
        </Button>
      </div>
    </div>
  );
}
