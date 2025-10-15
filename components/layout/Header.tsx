"use client";

import { Sparkles, Crown, LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { ROUTES } from "@/lib/constants";
import { LEVELS } from "@/types/user.types";
import { getInitials } from "@/lib/utils";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const currentLevel =
    profile && profile.current_level !== null && LEVELS[profile.current_level]
      ? LEVELS[profile.current_level]
      : LEVELS[1] || {
          id: 1,
          name: "Iniciante",
          icon: "🌱",
          color: "text-gray-500",
          min_quality_score: 0,
        };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.FEED} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Reflectio
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-gray-800 text-sm">
                  {profile?.full_name}
                </p>
                <p
                  className={`text-xs ${currentLevel.color} flex items-center justify-end gap-1`}
                >
                  <span>{currentLevel.icon}</span>
                  {currentLevel.name}
                </p>
              </div>
            </div>

            {/* Premium Button */}
            {!profile?.is_premium && (
              <Button
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="w-4 h-4" />
                Premium
              </Button>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {profile ? getInitials(profile.full_name) : "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                    <p className="font-semibold text-gray-800 text-sm">
                      {profile?.full_name}
                    </p>
                    <p
                      className={`text-xs ${currentLevel.color} flex items-center gap-1 mt-1`}
                    >
                      <span>{currentLevel.icon}</span>
                      {currentLevel.name}
                    </p>
                  </div>

                  <Link
                    href={ROUTES.PROFILE}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Meu Perfil</span>
                  </Link>

                  {!profile?.is_premium && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowPremiumModal(true);
                      }}
                    >
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-gray-700">
                        Upgrade Premium
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 mt-2"
                  >
                    <LogOut className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </header>
  );
}
