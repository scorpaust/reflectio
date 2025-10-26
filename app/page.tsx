import Link from "next/link";
import { Sparkles, Book, Users, Award, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Reflectio
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {/* Navigation Links */}
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
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button>Começar Gratuitamente</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ A Rede Social que Incentiva o Pensamento Profundo
            </span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
            Cresça através da
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {" "}
              Reflexão Cultural
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partilhe livros, filmes, pensamentos filosóficos e reflexões
            fundamentadas. Conecte-se com pensadores do seu nível e evolua
            intelectualmente através de diálogos construtivos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" className="px-8">
                Começar Jornada Gratuita
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="ghost">
                Saber Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          O que torna o Reflectio único
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Conteúdo Cultural
            </h4>
            <p className="text-gray-600">
              Partilhe críticas de livros, filmes, pensamentos filosóficos e
              obras artísticas.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Sistema de Níveis
            </h4>
            <p className="text-gray-600">
              Evolua de Iniciante a Sábio através da qualidade das suas
              reflexões.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Conexões Significativas
            </h4>
            <p className="text-gray-600">
              Conecte-se com pensadores do seu nível ou inferior para diálogos
              profundos.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Sem Toxicidade
            </h4>
            <p className="text-gray-600">
              Moderação inteligente filtra ódio e incentiva argumentação
              construtiva.
            </p>
          </div>
        </div>
      </section>

      {/* Levels Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Evolua através da Reflexão
          </h3>
          <p className="text-center text-gray-700 mb-8 max-w-2xl mx-auto">
            Cada reflexão fundamentada aumenta seu nível intelectual na
            plataforma
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "🌱 Iniciante",
              "💭 Reflexivo",
              "🧠 Pensador",
              "📜 Filósofo",
              "✨ Sábio",
            ].map((level, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl px-6 py-3 shadow-sm"
              >
                <span className="font-semibold text-gray-800">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para iniciar sua jornada reflexiva?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a uma comunidade que valoriza profundidade sobre
            superficialidade
          </p>
          <Link href={ROUTES.REGISTER}>
            <Button size="lg" variant="secondary" className="px-8">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Reflectio</span>
            </div>

            <p className="text-gray-600 text-sm">
              © 2025 Reflectio. Todos os direitos reservados.
            </p>

            <div className="flex flex-wrap gap-6 text-sm justify-center md:justify-end">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                Sobre
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900">
                Ajuda
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900"
              >
                Contacto
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900"
              >
                Privacidade
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
