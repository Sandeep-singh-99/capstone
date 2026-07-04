import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = <FolderOpen size={48} className="text-muted-foreground/60 animate-bounce" />,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-2xl border border-dashed border-border/80 bg-card/10 backdrop-blur-md space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50 border border-border/40 shadow-inner">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <Button
          size="sm"
          onClick={onAction}
          className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-md gap-2"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
export default EmptyState;
