
"use client";

import * as React from "react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  CreditCard,
  Wallet,
  Sparkles,
  Settings,
  PanelLeft,
  ChevronLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(isMobile);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };
  
  React.useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}


const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/gastos", label: "Gastos", icon: TrendingDown },
  { href: "/ahorros", label: "Ahorros", icon: PiggyBank },
  { href: "/bancos", label: "Bancos", icon: Landmark },
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCard },
  { href: "/billeteras", label: "Billeteras", icon: Wallet },
  { href: "/asistente-ia", label: "Asistente IA", icon: Sparkles },
];

const settingsItem = { href: "/settings", label: "Ajustes", icon: Settings };

function NavContent({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar: () => void }) {
    const pathname = usePathname();
    return (
        <TooltipProvider>
            <div className={cn("flex h-full flex-col", isCollapsed ? "px-2" : "px-4")}>
                <div className={cn("flex h-14 items-center border-b border-sidebar-border", isCollapsed ? "justify-center" : "justify-between")}>
                    <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                        <Logo className="h-6 w-6" />
                         {!isCollapsed && <span>FinanceFile</span>}
                    </Link>
                </div>
                <nav className="flex flex-col gap-2 py-4 flex-grow">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Tooltip key={label} delayDuration={0}>
                            <TooltipTrigger asChild>
                            <Link
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    pathname === href && "bg-sidebar-primary text-sidebar-primary-foreground",
                                    isCollapsed && "justify-center"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {!isCollapsed && <span>{label}</span>}
                                 <span className="sr-only">{label}</span>
                            </Link>
                            </TooltipTrigger>
                            {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
                        </Tooltip>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2 pb-4">
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                        <Link
                            href={settingsItem.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                pathname === settingsItem.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            {!isCollapsed && <span>{settingsItem.label}</span>}
                            <span className="sr-only">{settingsItem.label}</span>
                        </Link>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">{settingsItem.label}</TooltipContent>}
                    </Tooltip>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isCollapsed ? "justify-center" : "justify-start"
                                )}
                                onClick={toggleSidebar}>
                                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                                {!isCollapsed && <span>Ocultar Menú</span>}
                                <span className="sr-only">Toggle Sidebar</span>
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">Expandir</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}


export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
                <NavContent isCollapsed={false} toggleSidebar={() => {}} />
            </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 font-semibold">
                <Logo className="h-6 w-6" />
                <span>FinanceFile</span>
            </div>
      </header>
    );
  }

  return (
      <aside className={cn(
          "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-sidebar text-sidebar-foreground sm:flex transition-all duration-300 ease-in-out",
          isCollapsed ? "w-14" : "w-60"
      )}>
          <NavContent isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </aside>
  );
}
