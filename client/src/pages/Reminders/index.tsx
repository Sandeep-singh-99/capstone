import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlarmClock,
  Loader2,
  ListTodo,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { reminderApi } from "../../api/reminderApi";
import type { ReminderResponse } from "../../api/reminderApi";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

// ─── Schema ──────────────────────────────────────────────────────────────────
const reminderSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().max(300).optional(),
  reminder_date: z.string().min(1, "Please pick a date and time"),
});
type ReminderFormValues = z.infer<typeof reminderSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatReminderDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isPast: d < new Date(),
    isSoon: d > new Date() && d < new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

function getMinDateTime() {
  // Minimum is 5 minutes from now
  const d = new Date(Date.now() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Reminder Card ───────────────────────────────────────────────────────────
function ReminderCard({
  reminder,
  onToggle,
  onDelete,
  isTogglingId,
  isDeletingId,
}: {
  reminder: ReminderResponse;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  isTogglingId: string | null;
  isDeletingId: string | null;
}) {
  const { date, time, isPast, isSoon } = formatReminderDate(reminder.reminder_date);
  const isCompleted = reminder.is_completed;

  return (
    <Card
      className={`border transition-all duration-200 shadow-sm hover:shadow-md ${
        isCompleted
          ? "bg-muted/30 border-border/40 opacity-70"
          : isSoon
          ? "border-amber-500/30 bg-amber-500/5"
          : isPast
          ? "border-red-500/20 bg-red-500/5"
          : "bg-card/50 border-border/70 hover:border-border"
      }`}
    >
      <CardContent className="p-4 flex items-start gap-4">
        {/* Toggle button */}
        <button
          onClick={() => onToggle(reminder.id, isCompleted)}
          disabled={isTogglingId === reminder.id}
          className="mt-0.5 shrink-0 transition-colors"
          title={isCompleted ? "Mark as pending" : "Mark as completed"}
        >
          {isTogglingId === reminder.id ? (
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <Circle size={18} className="text-muted-foreground hover:text-emerald-500 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={`text-sm font-semibold leading-snug ${
              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {reminder.title}
          </p>

          {reminder.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {reminder.description}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap mt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar size={10} />
              {date}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} />
              {time}
            </span>
            {isCompleted && (
              <Badge className="text-[9px] px-2 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border rounded-full font-semibold">
                Done
              </Badge>
            )}
            {!isCompleted && isSoon && (
              <Badge className="text-[9px] px-2 py-0 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 border rounded-full font-semibold animate-pulse">
                Due soon
              </Badge>
            )}
            {!isCompleted && isPast && !isSoon && (
              <Badge className="text-[9px] px-2 py-0 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 border rounded-full font-semibold">
                Overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Delete */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(reminder.id)}
          disabled={isDeletingId === reminder.id}
          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0 transition-colors"
          title="Delete reminder"
        >
          {isDeletingId === reminder.id ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────
function CreateReminderForm({ onCreated }: { onCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { title: "", description: "", reminder_date: "" },
  });

  const createMutation = useMutation({
    mutationFn: (values: ReminderFormValues) =>
      reminderApi.createReminder(
        values.title,
        values.description ?? "",
        new Date(values.reminder_date).toISOString()
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder created successfully!");
      reset();
      setIsOpen(false);
      onCreated();
    },
    onError: () => {
      toast.error("Failed to create reminder. Please try again.");
    },
  });

  return (
    <Card className="border border-dashed border-border/70 bg-card/30 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/10 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Plus size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">New Reminder</span>
        </div>
        {isOpen ? (
          <ChevronUp size={15} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4 animate-fade-in">
          <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Reminder Title *
              </label>
              <Input
                {...register("title")}
                placeholder="e.g. Take blood pressure medication"
                className="h-9 text-xs focus-visible:ring-emerald-500"
              />
              {errors.title && (
                <p className="text-[10px] text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Notes (optional)
              </label>
              <Input
                {...register("description")}
                placeholder="Any additional notes..."
                className="h-9 text-xs focus-visible:ring-emerald-500"
              />
              {errors.description && (
                <p className="text-[10px] text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <AlarmClock size={11} />
                Date & Time *
              </label>
              <Input
                {...register("reminder_date")}
                type="datetime-local"
                min={getMinDateTime()}
                className="h-9 text-xs focus-visible:ring-emerald-500"
              />
              {errors.reminder_date && (
                <p className="text-[10px] text-red-500">{errors.reminder_date.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold gap-2 shadow-md"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={13} />
                    Create Reminder
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setIsOpen(false); reset(); }}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RemindersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: remindersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["reminders"],
    queryFn: reminderApi.listReminders,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) =>
      reminderApi.markReminderCompleted(id, val),
    onMutate: ({ id }) => setTogglingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder status updated.");
    },
    onError: () => toast.error("Failed to update reminder."),
    onSettled: () => setTogglingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reminderApi.deleteReminder(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted.");
    },
    onError: () => toast.error("Failed to delete reminder."),
    onSettled: () => setDeletingId(null),
  });

  const handleToggle = (id: string, current: boolean) => {
    toggleMutation.mutate({ id, val: !current });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this reminder permanently?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <LoadingSkeleton type="list" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const allReminders: ReminderResponse[] = remindersResponse?.data ?? [];
  const upcoming = allReminders
    .filter((r) => !r.is_completed)
    .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime());
  const completed = allReminders
    .filter((r) => r.is_completed)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const displayedList = activeTab === "upcoming" ? upcoming : completed;

  const overdueCount = upcoming.filter((r) => new Date(r.reminder_date) < new Date()).length;
  const soonCount = upcoming.filter((r) => {
    const d = new Date(r.reminder_date);
    return d > new Date() && d < new Date(Date.now() + 24 * 60 * 60 * 1000);
  }).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-500" />
          Reminders
        </h2>
        <p className="text-xs text-muted-foreground">
          Schedule medication reminders, appointments, and health check-ins.
        </p>
      </div>

      {/* Stats row */}
      {allReminders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/40 border-border/60 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{upcoming.length}</p>
              <p className="text-[10px] text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {overdueCount + soonCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Due soon / overdue</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completed.length}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Reminder */}
      <CreateReminderForm onCreated={() => setActiveTab("upcoming")} />

      {/* Tab switcher */}
      {allReminders.length > 0 && (
        <div className="flex items-center border border-border/60 rounded-xl overflow-hidden bg-card/30 p-1 gap-1">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === "upcoming"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <ListTodo size={13} />
            Upcoming
            {upcoming.length > 0 && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === "upcoming"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {upcoming.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === "completed"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <CheckCircle2 size={13} />
            Completed
            {completed.length > 0 && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === "completed"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {completed.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* List */}
      {allReminders.length === 0 ? (
        <EmptyState
          icon={<Bell size={44} className="text-muted-foreground/50" />}
          title="No reminders yet"
          description="Create your first reminder above to track medications, appointments, or health check-ins."
        />
      ) : displayedList.length === 0 ? (
        <EmptyState
          icon={
            activeTab === "upcoming" ? (
              <BellOff size={44} className="text-muted-foreground/50" />
            ) : (
              <CheckCircle2 size={44} className="text-muted-foreground/50" />
            )
          }
          title={activeTab === "upcoming" ? "All caught up!" : "No completed reminders"}
          description={
            activeTab === "upcoming"
              ? "You have no upcoming reminders. Create one above to stay on track with your health."
              : "Mark reminders as done to see them here."
          }
        />
      ) : (
        <div className="space-y-3">
          {displayedList.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onToggle={handleToggle}
              onDelete={handleDelete}
              isTogglingId={togglingId}
              isDeletingId={deletingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
