import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Reflectio
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/help"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Ajuda
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Registar
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4 pb-3 overflow-x-auto">
          <Link
            href="/about"
            className="text-gray-600 hover:text-gray-900 whitespace-nowrap text-sm"
          >
            Sobre
          </Link>
          <Link
            href="/help"
            className="text-gray-600 hover:text-gray-900 whitespace-nowrap text-sm"
          >
            Ajuda
          </Link>
          <Link
            href="/contact"
            className="text-gray-600 hover:text-gray-900 whitespace-nowrap text-sm"
          >
            Contacto
          </Link>
        </div>
      </div>
    </header>
  );
}
