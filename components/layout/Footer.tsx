import Link from "next/link";
import {
  Sparkles,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  Info,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/feed" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Reflectio
              </h2>
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Uma plataforma dedicada ao crescimento pessoal através da reflexão
              consciente e partilha de experiências significativas.
            </p>
            <p className="text-sm text-gray-500">
              © {currentYear} Reflectio. Todos os direitos reservados.
            </p>
          </div>

          {/* Links da Plataforma */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/feed"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Feed
                </Link>
              </li>
              <li>
                <Link
                  href="/connections"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Conexões
                </Link>
              </li>
              <li>
                <Link
                  href="/progress"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Progresso
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Links de Suporte */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Termos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de Separação e Links Legais */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-6 mb-4 sm:mb-0">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Termos de Serviço
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Contacto
              </Link>
            </div>

            <div className="text-sm text-gray-500">
              Feito com ❤️ em Portugal
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
