import Link from 'next/link';
import { Package } from 'lucide-react';

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold" aria-label="Back to dashboard">
      <Package className="h-6 w-6 text-primary" />
      <span className="text-lg font-headline">OptiStock</span>
    </Link>
  );
}
