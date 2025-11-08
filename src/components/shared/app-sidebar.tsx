"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gamepad2, Warehouse, LogOut, Settings, ChevronsLeft, ChevronsRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Logo from '@/components/shared/logo';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import React from 'react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/design', icon: Warehouse, label: 'Diseñador' },
  { href: '/simulation', icon: Gamepad2, label: 'Simulador' },
  { href: '/settings', icon: Settings, label: 'Configuraciones' },
  { href: '/tutorial', icon: BookOpen, label: 'Tutorial' },
];

interface AppSidebarProps {
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function AppSidebar({ isCollapsed, setCollapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className={cn(
        "hidden sm:flex h-screen flex-col border-r bg-card fixed left-0 top-0 z-40 transition-all",
        isCollapsed ? "w-[56px]" : "w-[220px]"
    )}>
      <div className={cn(
          "flex h-16 items-center border-b px-4",
          isCollapsed ? "justify-center" : ""
      )}>
        <Logo isCollapsed={isCollapsed} />
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col gap-2 p-2 flex-1">
          {navItems.map((item) => (
             <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Button
                        asChild
                        variant={pathname.startsWith(item.href) ? 'default' : 'ghost'}
                        className={cn("w-full justify-start gap-3", isCollapsed && "justify-center")}
                        aria-label={item.label}
                    >
                         <Link href={item.href}>
                            <item.icon className="size-5 shrink-0" />
                            <span className={cn("truncate", isCollapsed && "hidden")}>{item.label}</span>
                         </Link>
                    </Button>
                </TooltipTrigger>
                 {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>
        
        <div className={cn("px-4 pb-2 text-xs text-muted-foreground", isCollapsed && "hidden")}>
            <div className="border-t pt-3 space-y-1">
                <p className="font-semibold text-foreground">Semillero de investigacion. SILOGÉ</p>
                <p>Universidad Pontificia Bolivariana Montería</p>
                <p>Facultad de Ingenieria Industrial</p>
                <p>@silogé_upb</p>
            </div>
        </div>

        <nav className="mt-auto flex flex-col gap-2 p-2 border-t">
           <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={logout}
                        variant='ghost'
                        className={cn("w-full justify-start gap-3", isCollapsed && "justify-center")}
                        aria-label="Logout"
                    >
                        <LogOut className="size-5 shrink-0" />
                        <span className={cn("truncate", isCollapsed && "hidden")}>Logout</span>
                    </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={() => setCollapsed(!isCollapsed)}
                        variant="ghost"
                        className={cn("w-full justify-start gap-3", isCollapsed && "justify-center")}
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? <ChevronsRight className="size-5 shrink-0" /> : <ChevronsLeft className="size-5 shrink-0" />}
                        <span className={cn("truncate", isCollapsed && "hidden")}>{isCollapsed ? "Expandir" : "Colapsar"}</span>
                    </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{isCollapsed ? "Expandir" : "Colapsar"}</TooltipContent>}
            </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
