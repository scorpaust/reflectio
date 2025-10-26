"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log("🏠 [DashboardLayout] Render:", {
    hasUser: !!user,
    userId: user?.id,
    isLoading,
  });

  useEffect(() => {
    console.log("🏠 [DashboardLayout] useEffect:", {
      hasUser: !!user,
      userId: user?.id,
      isLoading,
    });

    // Add small delay to allow auth to settle after login
    const timer = setTimeout(() => {
      console.log("🏠 [DashboardLayout] Timer triggered:", {
        hasUser: !!user,
        userId: user?.id,
        isLoading,
        willRedirect: !isLoading && !user,
      });

      if (!isLoading && !user) {
        console.log("🔒 [DashboardLayout] No user found, redirecting to login");
        router.push(ROUTES.LOGIN);
      }
    }, 500); // Wait 500ms before redirecting

    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
