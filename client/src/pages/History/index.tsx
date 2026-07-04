import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  History,
  Search,
  Trash2,
  Calendar,
  Clock,
  Filter,
  FileText,
  Stethoscope,
  Activity,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { historyApi } from "../../api/historyApi";
import type { HealthHistoryResponse } from "../../api/historyApi";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

type FilterType = "all" | "reports" | "symptoms" | "chat";

function getEventMeta(title: string): {
  icon: React.ReactNode;
  badge: string;
  color: string;
  type: FilterType;
} {
  const t = title.toLowerCase();
  if (t.includes("upload") || t.includes("report") || t.includes("scan")) {
    return {
      icon: <FileText className="h-4 w-4" />,
      badge: "Report",
      color: "emerald",
      type: "reports",
    };
  }
  if (t.includes("symptom") || t.includes("specialist") || t.includes("recommend")) {
    return {
      icon: <Stethoscope className="h-4 w-4" />,
      badge: "Symptom Check",
      color: "teal",
      type: "symptoms",
    };
  }
  if (t.includes("chat") || t.includes("conversation") || t.includes("message")) {
    return {
      icon: <MessageSquare className="h-4 w-4" />,
      badge: "Consultation",
      color: "blue",
      type: "chat",
    };
  }
  return {
    icon: <Activity className="h-4 w-4" />,
    badge: "Activity",
    color: "violet",
    type: "all",
  };
}

const BADGE_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  teal: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
};

const ICON_CLASSES: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  teal: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
  blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
};

const DOT_CLASSES: Record<string, string> = {
  emerald: "border-emerald-500/60 bg-emerald-500/10",
  teal: "border-teal-500/60 bg-teal-500/10",
  blue: "border-blue-500/60 bg-blue-500/10",
  violet: "border-violet-500/60 bg-violet-500/10",
};

function TimelineItem({
  item,
  onDelete,
  isDeleting,
}: {
  item: HealthHistoryResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getEventMeta(item.title);
  const date = new Date(item.created_at);
  const isLong = item.description.length > 200;

  return (
    <div className="relative group/item">
      {/* Timeline dot */}
      <div
        className={`absolute -left-[2.15rem] top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background transition-all duration-200 group-hover/item:scale-110 ${DOT_CLASSES[meta.color]}`}
      >
        <span className={`${ICON_CLASSES[meta.color].split(" ")[0]}`}>{meta.icon}</span>
      </div>

      {/* Card */}
      <Card className="bg-card/50 border-border/70 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full ${BADGE_CLASSES[meta.color]}`}
              >
                {meta.badge}
              </Badge>
            </div>
            <CardTitle className="text-sm font-semibold text-foreground leading-snug">
              {item.title}
            </CardTitle>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
              <span className="h-3 w-px bg-border/80" />
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0 transition-colors"
            title="Delete record"
          >
            <Trash2 size={13} />
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          <p
            className={`text-[11px] leading-relaxed text-muted-foreground whitespace-pre-line ${
              !expanded && isLong ? "line-clamp-3" : ""
            }`}
          >
            {item.description}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
            >
              {expanded ? "Show less" : "Read more"}
              <ChevronDown
                size={11}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const { data: historyResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["healthHistory"],
    queryFn: historyApi.getHealthHistory,
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: string) => historyApi.deleteHistoryRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthHistory"] });
      toast.success("Record removed from your health timeline.");
    },
    onError: () => {
      toast.error("Failed to delete health record. Please try again.");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Remove this event from your health history?")) {
      deleteRecordMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="space-y-2 mb-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/70 rounded animate-pulse" />
        </div>
        <LoadingSkeleton type="list" count={5} />
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

  const historyList = historyResponse?.data ?? [];

  const filteredList = historyList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    const meta = getEventMeta(item.title);
    return meta.type === filterType;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All Events" },
    { key: "reports", label: "Reports" },
    { key: "symptoms", label: "Symptom Checks" },
    { key: "chat", label: "Consultations" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-500" />
          Health History
        </h2>
        <p className="text-xs text-muted-foreground">
          A chronological journal of your uploads, symptom checks, and AI consultations.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="bg-card/40 border-border/70 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs focus-visible:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-muted-foreground shrink-0" />
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all duration-150 ${
                  filterType === f.key
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                    : "bg-transparent text-muted-foreground border-border hover:border-emerald-400 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats pill */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{filteredList.length}</span>
        event{filteredList.length !== 1 ? "s" : ""} found
        {historyList.length !== filteredList.length && (
          <span className="text-muted-foreground/70">
            (of {historyList.length} total)
          </span>
        )}
      </div>

      {/* Timeline */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={<History size={44} className="text-muted-foreground/50" />}
          title="No history events found"
          description={
            searchQuery
              ? `No events match "${searchQuery}". Try a different keyword.`
              : "Your health history is empty. Upload a report or run a symptom check to get started."
          }
        />
      ) : (
        <div className="relative pl-8 border-l-2 border-border/50 space-y-5 ml-3">
          {filteredList.map((item) => (
            <TimelineItem
              key={item.id}
              item={item}
              onDelete={handleDelete}
              isDeleting={deleteRecordMutation.isPending && deleteRecordMutation.variables === item.id}
            />
          ))}
          {/* End of timeline marker */}
          <div className="relative">
            <div className="absolute -left-[2.05rem] flex h-4 w-4 items-center justify-center rounded-full bg-border/60" />
            <p className="text-[10px] text-muted-foreground/60 pl-1 pt-0.5">
              Beginning of your health journal
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
