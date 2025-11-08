"use client";

import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Warehouse, Gamepad2, PanelLeft, LogOut, Settings, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Logo from './logo';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/design', icon: Warehouse, label: 'Designer' },
  { href: '/simulation', icon: Gamepad2, label: 'Simulator' },
  { href: '/settings', icon: Settings, label: 'Configuraciones' },
  { href: '/tutorial', icon: BookOpen, label: 'Tutorial' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const currentPage = navItems.find(item => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <div className="group flex h-16 shrink-0 items-center justify-center text-center">
              <Logo />
            </div>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-2.5 ${pathname.startsWith(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <button
                onClick={logout}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </SheetContent>
      </Sheet>
      <h1 className="flex-1 text-xl font-semibold font-headline tracking-tight">{currentPage?.label || 'OptiStock'}</h1>
      {user && (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
            >
                <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.email} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
