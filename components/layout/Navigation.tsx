"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, TrendingUp, User } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.FEED, label: "Feed Cultural", icon: Home },
  { href: ROUTES.CONNECTIONS, label: "Conexões", icon: Users },
  { href: ROUTES.PROGRESS, label: "Meu Progresso", icon: TrendingUp },
  { href: ROUTES.PROFILE, label: "Perfil", icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-purple-600 text-purple-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
