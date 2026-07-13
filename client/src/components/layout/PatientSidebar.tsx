import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Activity,
  LayoutDashboard,
  Upload,
  MessageSquare,
  History,
  Stethoscope,
  Bell,
  LogOut,
  Sun,
  Moon,
  ChevronDown
} from "lucide-react";
import { clearUser } from "../../redux/auth/authSlice";
// import { authApi } from "../../api/authApi";
import { useTheme } from "../theme-provider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAppSelector } from "@/hooks/hooks";

export function PatientSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      // await authApi.logout();
      dispatch(clearUser());
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Report", path: "/reports/upload", icon: Upload },
    { name: "AI Consultation", path: "/chat", icon: MessageSquare },
    { name: "Health History", path: "/history", icon: History },
    { name: "Specialist Catalog", path: "/specialists", icon: Stethoscope },
    { name: "Reminders", path: "/reminders", icon: Bell },
  ];

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "US";
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar shrink-0">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/10">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-sm font-bold tracking-tight text-transparent dark:from-emerald-400 dark:to-teal-300">
              MediGuide AI
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold -mt-1 tracking-wider uppercase">
              Patient Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="p-2 space-y-1">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  isActive={isActive}
                  className="w-full gap-3 cursor-pointer"
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar/50 flex flex-col gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3 h-9 px-2 hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </Button>

        {/* User Info & Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-1.5 hover:bg-muted rounded-xl cursor-pointer group transition-colors select-none w-full border border-transparent hover:border-border/40">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 flex flex-col items-start">
                  <span className="text-xs font-semibold text-foreground truncate block">
                    {user.full_name}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate block">
                    {user.email}
                  </span>
                </div>
                <ChevronDown size={12} className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              <div className="px-2 py-1.5 flex flex-col">
                <span className="text-xs font-semibold text-foreground">{user.full_name}</span>
                <span className="text-[10px] text-muted-foreground">{user.role}</span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer text-xs rounded-md text-red-500 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut size={14} />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
