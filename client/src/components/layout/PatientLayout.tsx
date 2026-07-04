import { Outlet, Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { PatientSidebar } from "./PatientSidebar";
import { Activity } from "lucide-react";
import { Button } from "../ui/button";

export function PatientLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/reports/upload")) return "Upload Report";
    if (path.startsWith("/reports/")) return "Report Details";
    if (path.startsWith("/chat")) return "AI Consultation";
    if (path.startsWith("/history")) return "Health History Timeline";
    if (path.startsWith("/specialists")) return "Clinical Specialist Recommendation";
    if (path.startsWith("/reminders")) return "Medication & Appointment Reminders";
    return "MediGuide AI";
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Responsive Patient Sidebar */}
        <PatientSidebar />

        {/* Display Frame */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          {/* Top Bar Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border" />
              <h1 className="text-sm font-bold text-foreground">
                {getPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button size="sm" variant="ghost" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1">
                  <Activity size={13} className="animate-pulse" />
                  MediGuide Home
                </Button>
              </Link>
            </div>
          </header>

          {/* Router Content Container */}
          <main className="flex-1 overflow-y-auto bg-background/50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
export default PatientLayout;
