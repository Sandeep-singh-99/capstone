import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Stethoscope,
  Sparkles,
  Plus,
  X,
  Search,
  User,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { specialistApi } from "../../api/specialistApi";
import type { SpecialistResponse, RecommendSpecialistResponse } from "../../api/specialistApi";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

// ─── Schema ─────────────────────────────────────────────────────────────────
const symptomSchema = z.object({
  symptomInput: z.string().optional(),
});
type SymptomFormValues = z.infer<typeof symptomSchema>;

// ─── Suggested Symptoms ──────────────────────────────────────────────────────
const SUGGESTED_SYMPTOMS = [
  "Chest pain", "Shortness of breath", "Headache", "Fever", "Fatigue",
  "Dizziness", "Nausea", "Joint pain", "Back pain", "Skin rash",
  "Blurred vision", "Memory loss", "Anxiety", "Insomnia", "Weight loss",
  "Swollen lymph nodes", "Irregular heartbeat", "Abdominal pain",
];

// ─── Specialty color palette ─────────────────────────────────────────────────
const SPECIALIST_COLORS = [
  "emerald", "teal", "blue", "violet", "rose", "amber", "cyan", "fuchsia",
];
const CARD_COLORS: Record<string, string> = {
  emerald: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50",
  teal:    "border-teal-500/20 bg-teal-500/5 hover:border-teal-500/50",
  blue:    "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50",
  violet:  "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/50",
  rose:    "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/50",
  amber:   "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50",
  cyan:    "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/50",
  fuchsia: "border-fuchsia-500/20 bg-fuchsia-500/5 hover:border-fuchsia-500/50",
};
const ICON_COLORS: Record<string, string> = {
  emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  teal:    "text-teal-500 bg-teal-500/10 border-teal-500/20",
  blue:    "text-blue-500 bg-blue-500/10 border-blue-500/20",
  violet:  "text-violet-500 bg-violet-500/10 border-violet-500/20",
  rose:    "text-rose-500 bg-rose-500/10 border-rose-500/20",
  amber:   "text-amber-500 bg-amber-500/10 border-amber-500/20",
  cyan:    "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  fuchsia: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20",
};

// ─── Specialist Card ─────────────────────────────────────────────────────────
function SpecialistCard({
  specialist,
  colorKey,
  highlighted = false,
}: {
  specialist: SpecialistResponse;
  colorKey: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={`border transition-all duration-200 shadow-sm hover:shadow-md ${CARD_COLORS[colorKey]} ${
        highlighted ? "ring-2 ring-emerald-500/40 shadow-emerald-500/10" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${ICON_COLORS[colorKey]}`}
          >
            <Stethoscope size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-bold text-foreground">
                {specialist.name}
              </CardTitle>
              {highlighted && (
                <Badge className="bg-emerald-500 text-white text-[9px] px-2 py-0 rounded-full font-semibold">
                  Recommended
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {specialist.description}
        </p>
        {specialist.symptoms && specialist.symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialist.symptoms.slice(0, 5).map((s, i) => (
              <span
                key={i}
                className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-background border border-border/60 text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {specialist.symptoms.length > 5 && (
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-background border border-border/60 text-muted-foreground">
                +{specialist.symptoms.length - 5} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recommendation Result ───────────────────────────────────────────────────
function RecommendationResult({
  result,
}: {
  result: RecommendSpecialistResponse;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
        <Sparkles className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">AI Recommendation</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
            {result.recommendation_text}
          </p>
        </div>
      </div>

      {result.specialist && (
        <SpecialistCard
          specialist={result.specialist}
          colorKey="emerald"
          highlighted
        />
      )}

      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This recommendation is generated by AI based on your reported symptoms. Always consult a licensed healthcare provider for medical diagnosis and treatment.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SpecialistsPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [recommendation, setRecommendation] = useState<RecommendSpecialistResponse | null>(null);

  const { register, watch, setValue } = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: { symptomInput: "" },
  });

  const symptomInputValue = watch("symptomInput") ?? "";

  // Load specialist catalog
  const { data: catalogResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["specialists"],
    queryFn: specialistApi.listAllSpecialties,
  });

  // Recommend mutation
  const recommendMutation = useMutation({
    mutationFn: (s: string[]) => specialistApi.recommendSpecialty(s),
    onSuccess: (res) => {
      setRecommendation(res.data ?? null);
      toast.success("Specialist recommendation ready!");
    },
    onError: () => {
      toast.error("Failed to generate recommendation. Please try again.");
    },
  });

  const addSymptom = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (symptoms.length >= 10) {
      toast.warning("You can add up to 10 symptoms.");
      return;
    }
    if (symptoms.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.info("Symptom already added.");
      return;
    }
    setSymptoms((prev) => [...prev, trimmed]);
    setValue("symptomInput", "");
  };

  const removeSymptom = (s: string) => {
    setSymptoms((prev) => prev.filter((x) => x !== s));
    setRecommendation(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSymptom(symptomInputValue);
    }
  };

  const onSubmit = () => {
    if (symptoms.length === 0) {
      toast.warning("Please add at least one symptom.");
      return;
    }
    setRecommendation(null);
    recommendMutation.mutate(symptoms);
  };

  const allSpecialists = catalogResponse?.data ?? [];
  const filteredCatalog = catalogSearch
    ? allSpecialists.filter(
        (s) =>
          s.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          s.description.toLowerCase().includes(catalogSearch.toLowerCase())
      )
    : allSpecialists;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <LoadingSkeleton type="card" count={6} />
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

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-teal-500" />
          Specialist Finder
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your symptoms to receive an AI-powered specialist recommendation, or browse the catalog.
        </p>
      </div>

      {/* ── Symptom Checker ── */}
      <Card className="bg-card/50 border-border/70 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles size={15} className="text-teal-500" />
            AI Symptom Checker
          </CardTitle>
          <CardDescription className="text-[11px]">
            Add up to 10 symptoms. Press Enter or comma to confirm each one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Plus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                {...register("symptomInput")}
                placeholder="Type a symptom and press Enter..."
                onKeyDown={handleKeyDown}
                className="pl-9 h-9 text-xs focus-visible:ring-teal-500"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addSymptom(symptomInputValue)}
              className="h-9 text-xs"
            >
              Add
            </Button>
          </div>

          {/* Suggested chips */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
              Quick add suggestions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SYMPTOMS.filter((s) => !symptoms.includes(s)).slice(0, 12).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSymptom(s)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-border/60 bg-background text-muted-foreground hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Added symptoms */}
          {symptoms.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Your symptoms ({symptoms.length}/10)
              </p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-400"
                  >
                    <CheckCircle2 size={11} className="text-teal-500" />
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSymptom(s)}
                      className="ml-0.5 hover:text-red-500 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={symptoms.length === 0 || recommendMutation.isPending}
            className="w-full h-10 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold shadow-md gap-2 transition-all"
          >
            {recommendMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Find My Specialist
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Recommendation Result ── */}
      {recommendation && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Recommendation</h3>
          <RecommendationResult result={recommendation} />
        </div>
      )}

      {/* ── Specialist Catalog ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-sm font-bold text-foreground">
            Specialist Catalog
            {allSpecialists.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({allSpecialists.length} specialists)
              </span>
            )}
          </h3>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search specialists..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="pl-9 h-9 text-xs focus-visible:ring-teal-500"
            />
          </div>
        </div>

        {filteredCatalog.length === 0 ? (
          <EmptyState
            icon={<User size={44} className="text-muted-foreground/50" />}
            title="No specialists found"
            description={
              catalogSearch
                ? `No specialists match "${catalogSearch}".`
                : "The specialist catalog is empty."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((specialist, idx) => (
              <SpecialistCard
                key={specialist.id}
                specialist={specialist}
                colorKey={SPECIALIST_COLORS[idx % SPECIALIST_COLORS.length]}
                highlighted={recommendation?.specialist?.id === specialist.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
