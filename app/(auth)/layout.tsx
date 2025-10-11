import { Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <header className="p-6">
        <Link href={ROUTES.HOME} className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Reflectio
          </h1>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="p-6 text-center text-sm text-gray-600">
        © 2025 Reflectio. Todos os direitos reservados.
      </footer>
    </div>
  );
}
