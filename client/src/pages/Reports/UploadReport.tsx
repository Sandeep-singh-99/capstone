import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, AlertCircle, Trash2 } from "lucide-react";
import { reportApi } from "../../api/reportApi";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { MedicalDisclaimer } from "../../components/common/MedicalDisclaimer";

export default function UploadReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file format. Only PDF and PNG/JPG images are supported.");
      return false;
    }
    // 10MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum supported size is 10MB.");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    try {
      const response = await reportApi.uploadReport(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Cap progress at 90% until server finishes analysis
        setProgress(Math.min(percentCompleted * 0.9, 90));
      });
      
      setProgress(100);
      toast.success("Medical report uploaded and analyzed successfully!");
      
      const reportId = response.data?.report?.id;
      if (reportId) {
        navigate(`/reports/${reportId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "MediGuide analysis pipeline encountered an error.";
      toast.error(msg);
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Upload Diagnostic Report</h2>
        <p className="text-xs text-muted-foreground">
          Select or drag and drop an image or PDF of your laboratory test or clinical chart to run AI summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Upload Form Container */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-card/40 border-border/80 shadow-md relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UploadCloud size={16} className="text-emerald-500" />
                Upload Documents
              </CardTitle>
              <CardDescription className="text-[10px]">
                Files are analyzed privately and securely under HIPAA cryptographic standards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[220px] select-none ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-border/80 hover:border-emerald-500/40 bg-muted/10 hover:bg-muted/20"
                } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  disabled={isUploading}
                />
                
                <UploadCloud size={40} className="text-muted-foreground/80 mb-3 animate-pulse" />
                <span className="text-xs font-bold text-foreground mb-1">
                  Drag and drop file here, or browse
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Supports PDF, PNG, JPG, or JPEG up to 10MB
                </span>
              </div>

              {/* Selected File Details */}
              {file && (
                <div className="p-3 border border-border/50 rounded-xl bg-muted/10 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-8 w-8 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-foreground truncate block">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleRemoveFile}
                      className="text-muted-foreground hover:text-red-500 h-8 w-8 hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                    <span>Extracting clinical details...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  disabled={isUploading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUploadSubmit}
                  disabled={!file || isUploading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-md border-0 text-xs px-4"
                >
                  {isUploading ? "Analyzing with AI..." : "Confirm & Analyze"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Info Box */}
        <div className="space-y-4">
          <Card className="bg-card/40 border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertCircle size={14} className="text-emerald-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[11px] leading-relaxed text-muted-foreground">
              <p>
                <strong>1. Text Parsing & OCR:</strong> Our Vision LLM scans your report for laboratory parameters (like cholesterol, glucose, white cells).
              </p>
              <p>
                <strong>2. Medical Knowledge Agent:</strong> Cross-references items with medical literature to retrieve simple terminology descriptions.
              </p>
              <p>
                <strong>3. Specialty Mapping:</strong> Detects abnormal markers and flags which medical specialist focuses on those issues.
              </p>
              <p>
                <strong>4. Timeline Update:</strong> Saves a secure audit milestone in your health timeline.
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
