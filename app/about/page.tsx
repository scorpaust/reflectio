import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Target,
  Users,
  Lightbulb,
  Shield,
  Heart,
  Zap,
  BookOpen,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sobre o Reflectio
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma plataforma dedicada ao crescimento pessoal através da reflexão
              consciente e partilha de experiências significativas.
            </p>
          </div>

          {/* Missão */}
          <Card className="p-8 mb-8">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Nossa Missão
              </h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Capacitar pessoas a desenvolverem uma prática de reflexão mais
              profunda e significativa, criando um espaço seguro onde
              experiências pessoais se transformam em aprendizagem coletiva e
              crescimento mútuo.
            </p>
          </Card>

          {/* Valores */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Autenticidade
                </h3>
                <p className="text-gray-600">
                  Valorizamos a honestidade e a genuinidade em todas as
                  partilhas e interações na nossa comunidade.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Segurança
                </h3>
                <p className="text-gray-600">
                  Criamos um ambiente seguro e respeitoso onde todos se sentem
                  confortáveis para partilhar e crescer.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Crescimento
                </h3>
                <p className="text-gray-600">
                  Acreditamos no potencial de cada pessoa para evoluir através
                  da reflexão e do apoio da comunidade.
                </p>
              </Card>
            </div>
          </div>

          {/* Como Funciona */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Como Funciona o Reflectio
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start mb-4">
                  <BookOpen className="w-6 h-6 text-blue-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Partilhe Experiências
                    </h3>
                    <p className="text-gray-600">
                      Documente livros, filmes, fotos ou pensamentos que
                      marcaram o seu dia ou vida.
                    </p>
                  </div>
                </div>

                <div className="flex items-start mb-4">
                  <MessageCircle className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Reflita e Conecte
                    </h3>
                    <p className="text-gray-600">
                      Adicione reflexões às partilhas de outros membros e
                      construa conexões significativas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <TrendingUp className="w-6 h-6 text-purple-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cresça Continuamente
                    </h3>
                    <p className="text-gray-600">
                      Acompanhe o seu progresso e evolua através do sistema de
                      níveis baseado na qualidade das suas contribuições.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Funcionalidades Premium
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    Moderação avançada com IA
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    Análise de qualidade em tempo real
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    Estatísticas detalhadas de progresso
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Comunidade */}
          <Card className="p-8 mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-purple-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Nossa Comunidade
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              O Reflectio é mais do que uma plataforma - é uma comunidade de
              pessoas comprometidas com o crescimento pessoal e a reflexão
              consciente.
            </p>
            <p className="text-gray-700">
              Cada membro contribui para um ambiente de aprendizagem mútua, onde
              experiências diversas se transformam em sabedoria coletiva.
              Juntos, criamos um espaço onde a vulnerabilidade é força e a
              reflexão é poder.
            </p>
          </Card>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-gray-600 mb-6">
              Junte-se à nossa comunidade e inicie a sua jornada de crescimento
              através da reflexão consciente.
            </p>
            <div className="space-x-4">
              <a
                href="/register"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Começar Agora
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fale Connosco
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
