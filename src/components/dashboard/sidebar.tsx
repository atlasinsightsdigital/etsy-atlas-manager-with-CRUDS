'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Landmark,
  Database,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { seedDatabase } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedDatabase();
      if (result.success) {
        toast({
          title: "Database Seeded",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Seeding Failed",
          description: result.message,
        });
      }
    });
  };

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/dashboard/capital',
      label: 'Capital',
      icon: Landmark,
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
                >
                <circle cx="12" cy="12" r="10" />
            </svg>
          <span className="text-lg font-semibold tracking-tight">Etsy Atlas</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
             <SidebarMenuItem key={item.label}>
                <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                        isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                        icon={<item.icon />}
                        tooltip={item.label}
                    >
                        {item.label}
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
        <SidebarFooter>
            <Button variant="outline" onClick={handleSeed} disabled={isPending}>
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Database className="mr-2 h-4 w-4" />
            )}
            Seed Database
            </Button>
        </SidebarFooter>
    </Sidebar>
  );
}
