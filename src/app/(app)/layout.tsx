"use client";

import { SidebarProvider, useSidebar } from '@/components/layout/sidebar';
import { Sidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  return (
    <div className={cn(
      "flex flex-col sm:gap-4 sm:py-4 flex-1 transition-all duration-300 ease-in-out", 
      !isMobile && (isCollapsed ? "sm:pl-14" : "sm:pl-60")
    )}>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
        {children}
      </main>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar />
        <AppContent>
          {children}
        </AppContent>
      </div>
    </SidebarProvider>
  );
}
