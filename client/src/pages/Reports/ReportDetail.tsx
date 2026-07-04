import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FileText,
  Calendar,
  MessageSquare,
  Trash2,
  ChevronLeft,
  Activity,
  Download,
  AlertTriangle,
  Stethoscope,
  ExternalLink
} from "lucide-react";
import { reportApi } from "../../api/reportApi";
import { chatApi } from "../../api/chatApi";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { MedicalDisclaimer } from "../../components/common/MedicalDisclaimer";

// Simple Markdown parser for AI Explanations
function parseMarkdown(text: string = "") {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-foreground mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-foreground mt-6 mb-3 border-b border-border pb-1">
          {line.substring(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-foreground/90 mt-3 mb-1">
          {line.substring(5)}
        </h4>
      );
      continue;
    }
    if (line.startsWith("* ") || line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-xs text-muted-foreground leading-relaxed mb-1">
          {line.substring(2)}
        </li>
      );
      continue;
    }
    if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-4 border-t border-border" />);
      continue;
    }
    if (line.trim() !== "") {
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-muted-foreground mb-3">
          {line}
        </p>
      );
    }
  }
  return elements;
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("explanation");

  // Fetch report details
  const {
    data: reportResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["reportDetail", reportId],
    queryFn: () => reportApi.getReportDetails(reportId!),
    enabled: !!reportId,
  });

  // Start chat session mutation
  const startChatMutation = useMutation({
    mutationFn: () => chatApi.startChat(reportId, `Consultation for ${reportResponse?.data?.file_type?.toUpperCase() || "Report"}`),
    onSuccess: (res) => {
      toast.success("AI consultation session started!");
      if (res.data?.id) {
        navigate(`/chat/${res.data.id}`);
      }
    },
    onError: () => {
      toast.error("Failed to start chat session.");
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: () => reportApi.deleteReport(reportId!),
    onSuccess: () => {
      toast.success("Report deleted successfully.");
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to delete report.");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete this report and its Cloudinary assets?")) {
      deleteReportMutation.mutate();
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (error || !reportResponse?.data) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState message="Could not retrieve this medical report. It may have been deleted." onRetry={refetch} />
      </div>
    );
  }

  const report = reportResponse.data;
  const isImage = report.file_type === "image";
  const fileUrl = report.file_url || report.image_url;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Back & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="text-emerald-500 h-5 w-5" />
              Report Analysis Details
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              <Calendar size={12} />
              <span>Uploaded on {new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => startChatMutation.mutate()}
            disabled={startChatMutation.isPending}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md border-0 text-xs gap-1.5"
          >
            <MessageSquare size={13} />
            {startChatMutation.isPending ? "Starting Chat..." : "Consult AI About Report"}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={deleteReportMutation.isPending}
            className="border-red-500/25 text-red-500 hover:bg-red-500/10 text-xs gap-1.5"
          >
            <Trash2 size={13} />
            Delete Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main tabs view (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="explanation" className="rounded-lg text-xs">AI Explanations</TabsTrigger>
              <TabsTrigger value="extracted" className="rounded-lg text-xs">Extracted Text</TabsTrigger>
              <TabsTrigger value="document" className="rounded-lg text-xs">Original Document</TabsTrigger>
            </TabsList>

            {/* TAB: AI EXPLANATIONS */}
            <TabsContent value="explanation">
              <Card className="bg-card/40 border-border/80 shadow-md relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500" />
                    Interactive Translation Summary
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Clinical markers explained in simple terms by the RAG Medical Agent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 prose max-w-none text-muted-foreground">
                  {report.ai_summary ? (
                    parseMarkdown(report.ai_summary)
                  ) : (
                    <div className="text-center py-8 text-xs">
                      No AI summary analysis generated.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: EXTRACTED TEXT */}
            <TabsContent value="extracted">
              <Card className="bg-card/40 border-border/80 shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Raw Document Extraction (OCR)</CardTitle>
                  <CardDescription className="text-[10px]">
                    OCR read-out of scanned diagnostic lines.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-xl bg-zinc-950 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-[400px] border border-border/50">
                    {report.extracted_text || "No text could be extracted from this document."}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: ORIGINAL DOCUMENT */}
            <TabsContent value="document">
              <Card className="bg-card/40 border-border/80 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold">Document Viewer</CardTitle>
                    <CardDescription className="text-[10px]">
                      Scanned visual asset.
                    </CardDescription>
                  </div>
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Open Full Link <ExternalLink size={12} />
                    </a>
                  )}
                </CardHeader>
                <CardContent className="flex items-center justify-center p-4">
                  {fileUrl ? (
                    isImage ? (
                      <div className="border border-border/50 rounded-xl overflow-hidden shadow-md max-w-full">
                        <img
                          src={fileUrl}
                          alt="Medical Document"
                          className="max-h-[500px] object-contain max-w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl w-full text-center space-y-4">
                        <FileText size={48} className="text-muted-foreground" />
                        <div>
                          <span className="text-xs font-bold text-foreground block">PDF Document Uploaded</span>
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            PDF rendering is not natively supported inside browser sandbox.
                          </span>
                        </div>
                        <Button asChild size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <Download size={14} /> Download PDF File
                          </a>
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No source file URL linked.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          {/* Specialist card */}
          <Card className="bg-card/40 border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Stethoscope size={14} className="text-emerald-500" />
                Specialist Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-muted-foreground">
              <p>
                Based on laboratory parameters found in this document:
              </p>
              <div className="p-3 border border-border/40 rounded-xl bg-muted/10 space-y-2">
                <span className="font-bold text-foreground text-xs block">Suggested specialty:</span>
                <p className="text-[11px] leading-relaxed">
                  We recommend consulting a primary physician or checking the symptom tracker catalog to route abnormal readings.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate("/specialists")}
                  className="w-full text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 p-0 h-8"
                >
                  Browse Specialty Catalog
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Info Card */}
          <Card className="bg-card/40 border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-emerald-500" />
                AI Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] leading-relaxed text-muted-foreground space-y-2">
              <p>
                Our AI agents run clinical classifications using retrieval-augmented generation (RAG) mapped directly from certified medical directories.
              </p>
              <p>
                To ask deep follow-up questions (e.g. "What does a high bilirubin count mean?"), click the <strong>Consult AI About Report</strong> button above to link this report to your active chat.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}
