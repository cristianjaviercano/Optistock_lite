import Link from 'next/link';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    isCollapsed?: boolean;
}

export default function Logo({ isCollapsed = false }: LogoProps) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold" aria-label="Back to dashboard">
      <Package className="h-6 w-6 text-primary shrink-0" />
      <span className={cn("text-lg font-headline", isCollapsed && "hidden")}>OptiStock</span>
    </Link>
  );
}
