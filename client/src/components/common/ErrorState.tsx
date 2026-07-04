import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load clinical parameters. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-2xl border border-red-500/10 bg-red-500/5 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-md">
        <AlertTriangle size={32} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2"
        >
          <RefreshCw size={14} />
          Retry Request
        </Button>
      )}
    </div>
  );
}
export default ErrorState;
