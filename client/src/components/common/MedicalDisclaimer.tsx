import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-foreground leading-relaxed max-w-4xl mx-auto shadow-sm select-none">
      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <span className="font-bold text-amber-500 block mb-0.5">Medical Disclaimer</span>
        <p className="text-muted-foreground">
          MediGuide AI is an educational assistant designed to explain clinical summaries and translate diagnostic terminology. 
          It does not diagnose conditions, prescribe medications, or replace professional consultation. 
          Always verify healthcare information with your physician or qualified provider. In case of emergency, immediately contact your local emergency service.
        </p>
      </div>
    </div>
  );
}
export default MedicalDisclaimer;
