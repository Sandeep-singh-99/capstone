import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Upload,
  MessageSquare,
  Bell,
  Stethoscope,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { RootState } from "../../app/store";
import { historyApi } from "../../api/historyApi";
import { reminderApi } from "../../api/reminderApi";
import { chatApi } from "../../api/chatApi";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);

  // Queries
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ["healthHistory"],
    queryFn: historyApi.getHealthHistory,
  });

  const {
    data: remindersData,
    isLoading: isRemindersLoading,
    error: remindersError,
    refetch: refetchReminders
  } = useQuery({
    queryKey: ["reminders"],
    queryFn: reminderApi.listReminders,
  });

  const {
    data: chatsData,
    isLoading: isChatsLoading,
    error: chatsError,
    refetch: refetchChats
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatApi.getConversations,
  });

  // Toggle reminder completion mutation
  const toggleReminderMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      reminderApi.markReminderCompleted(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: () => {
      toast.error("Failed to update reminder status.");
    },
  });

  const handleToggleReminder = (id: string, currentStatus: boolean) => {
    toggleReminderMutation.mutate({ id, isCompleted: !currentStatus });
  };

  const handleRetry = () => {
    refetchHistory();
    refetchReminders();
    refetchChats();
  };

  if (isHistoryLoading || isRemindersLoading || isChatsLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (historyError || remindersError || chatsError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState onRetry={handleRetry} />
      </div>
    );
  }

  // Parse lists
  const historyList = historyData?.data || [];
  const remindersList = remindersData?.data || [];
  const chatsList = chatsData?.data || [];

  // Filter recent reports (uploaded files from history)
  const recentReports = historyList.filter(
    (item) => item.title.toLowerCase().includes("upload") || item.title.toLowerCase().includes("report")
  ).slice(0, 3);

  // Filter active / completed reminders
  const activeReminders = remindersList.filter((r) => !r.is_completed);
  const completedRemindersCount = remindersList.filter((r) => r.is_completed).length;

  // Filter specialist symptom checks from history
  const recentSymptomChecks = historyList.filter(
    (item) => item.title.toLowerCase().includes("symptom")
  ).slice(0, 1);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.full_name || "Patient"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor your diagnostic files, coordinate clinical follow-ups, and consult your health navigator.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate("/reports/upload")}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md border-0 gap-2 font-medium"
          >
            <Upload size={14} />
            Upload New Report
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/chat")}
            className="gap-2 border-emerald-500/25 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <MessageSquare size={14} />
            New AI Consultation
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border/80 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Reports Logged</span>
              <p className="text-2xl font-black text-foreground">{recentReports.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Activity size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Reminders</span>
              <p className="text-2xl font-black text-foreground">{activeReminders.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <Bell size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Consultations</span>
              <p className="text-2xl font-black text-foreground">{chatsList.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <MessageSquare size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Completed Reminders</span>
              <p className="text-2xl font-black text-foreground">{completedRemindersCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reports List */}
          <Card className="bg-card/40 border-border/80 shadow-md relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  Recent Health Reports
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Parsed analysis reports uploaded by you.
                </CardDescription>
              </div>
              <Link to="/history" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                View Timeline <ChevronRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No health reports found. Upload one to start tracking.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3.5 border border-border/40 hover:border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-all flex items-start gap-4"
                    >
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Upload size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">{report.title}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent AI Chats */}
          <Card className="bg-card/40 border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-500" />
                  Recent Consultation Chats
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Recent AI navigation consultation threads.
                </CardDescription>
              </div>
              <Link to="/chat" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
                Go to Consultations <ChevronRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {chatsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No consultation chat history. Click new consultation above.
                </div>
              ) : (
                <div className="space-y-3">
                  {chatsList.slice(0, 3).map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      className="p-3.5 border border-border/40 hover:border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-all flex items-start justify-between cursor-pointer gap-4"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                          <MessageSquare size={16} />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-foreground truncate block">{chat.title}</span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            Active session
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0 self-center" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Reminders List */}
          <Card className="bg-card/40 border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell size={16} className="text-amber-500" />
                  Upcoming Reminders
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Scheduled medical alarms & visits.
                </CardDescription>
              </div>
              <Link to="/reminders" className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5">
                Manage <ChevronRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {activeReminders.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No upcoming reminders.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReminders.slice(0, 4).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-3 border border-border/40 rounded-xl bg-muted/10 flex items-start gap-3 hover:bg-muted/20 transition-all"
                    >
                      <button
                        onClick={() => handleToggleReminder(reminder.id, reminder.is_completed)}
                        className={`h-5 w-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          reminder.is_completed
                            ? "bg-emerald-500 border-emerald-600 text-white"
                            : "border-input hover:border-emerald-500/50"
                        }`}
                      >
                        {reminder.is_completed && <CheckCircle2 size={12} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">{reminder.title}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Clock size={10} />
                          <span>
                            {new Date(reminder.reminder_date).toLocaleDateString()} at{" "}
                            {new Date(reminder.reminder_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialist Recommendations */}
          <Card className="bg-card/40 border-border/80 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Stethoscope size={16} className="text-teal-500" />
                Symptom Specialty Check
              </CardTitle>
              <CardDescription className="text-[11px]">
                Recommended medical specialties.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSymptomChecks.length === 0 ? (
                <div className="rounded-xl border border-border/40 p-4 bg-muted/10 text-center text-xs space-y-3">
                  <p className="text-muted-foreground text-[11px]">
                    Check which specialist matches your health issues.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate("/specialists")}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs py-4 rounded-lg"
                  >
                    Recommend Specialty
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSymptomChecks.map((check) => (
                    <div key={check.id} className="p-3.5 border border-border/40 rounded-xl bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          Last Check
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(check.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-foreground block">{check.title}</span>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {check.description}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate("/specialists")}
                        className="w-full text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 p-0 h-8"
                      >
                        Run New Symptom Check
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
