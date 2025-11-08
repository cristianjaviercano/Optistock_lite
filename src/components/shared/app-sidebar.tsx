"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gamepad2, Warehouse, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Logo from '@/components/shared/logo';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/design', icon: Warehouse, label: 'Designer' },
  { href: '/simulation', icon: Gamepad2, label: 'Simulator' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden h-screen flex-col border-r bg-card sm:flex">
      <div className="flex h-16 items-center border-b px-4">
        <Logo />
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-center gap-2 p-2">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant={pathname.startsWith(item.href) ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                        "w-full justify-start gap-2 rounded-md p-2",
                        "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center"
                    )}
                    aria-label={item.label}
                  >
                    <item.icon className="size-5" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-2 p-2">
           <Tooltip>
              <TooltipTrigger asChild>
                <Button
                    onClick={logout}
                    variant='ghost'
                    className={cn(
                        "w-full justify-start gap-2 rounded-md p-2",
                        "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center"
                    )}
                    aria-label="Logout"
                  >
                    <LogOut className="size-5" />
                     <span className="truncate group-data-[collapsible=icon]:hidden">Logout</span>
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
