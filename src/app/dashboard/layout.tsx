'use client';
import { DashboardSidebar as Sidebar } from '@/components/dashboard/sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import { FirebaseClientProvider } from '@/firebase';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <DashboardHeader />
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
