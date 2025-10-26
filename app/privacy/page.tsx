import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Shield, Eye, Lock, Database, Mail, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString("pt-PT")}
            </p>
          </div>

          <Card className="p-8 mb-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Compromisso com a Privacidade
              </h2>
            </div>
            <p className="text-gray-700">
              No Reflectio, a sua privacidade é fundamental. Esta política
              explica como recolhemos, usamos e protegemos as suas informações
              pessoais quando utiliza a nossa plataforma.
            </p>
          </Card>

          <div className="space-y-6">
            {/* Informações que Recolhemos */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Informações que Recolhemos
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Informações de Conta
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Nome completo e nome de utilizador</li>
                    <li>Endereço de email</li>
                    <li>Foto de perfil (opcional)</li>
                    <li>Biografia (opcional)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Conteúdo e Atividade
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Posts, reflexões e comentários que publica</li>
                    <li>Interações com outros utilizadores</li>
                    <li>Estatísticas de utilização da plataforma</li>
                    <li>Dados de progresso e níveis</li>
                    <li>Tipo de subscrição (gratuita ou Premium)</li>
                    <li>Preferências de conteúdo e visibilidade</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Informações Técnicas
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Endereço IP e localização aproximada</li>
                    <li>Tipo de dispositivo e navegador</li>
                    <li>Dados de utilização e navegação</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Como Usamos as Informações */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Eye className="w-5 h-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Como Usamos as Suas Informações
                </h3>
              </div>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Fornecer e melhorar os nossos serviços</li>
                <li>Personalizar a sua experiência na plataforma</li>
                <li>Facilitar conexões com outros utilizadores</li>
                <li>Enviar notificações importantes sobre a conta</li>
                <li>Analisar tendências de utilização para melhorias</li>
                <li>Garantir a segurança e prevenir fraudes</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </Card>

            {/* Partilha de Informações */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <UserCheck className="w-5 h-5 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Partilha de Informações
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                Não vendemos as suas informações pessoais. Podemos partilhar
                informações apenas nas seguintes situações:
              </p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Com o seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Para proteger direitos, propriedade ou segurança</li>
                <li>
                  Com prestadores de serviços que nos ajudam a operar a
                  plataforma
                </li>
                <li>Em caso de fusão, aquisição ou venda de ativos</li>
              </ul>
            </Card>

            {/* Segurança */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Lock className="w-5 h-5 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Segurança dos Dados
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais
                para proteger as suas informações:
              </p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encriptação de dados em trânsito e em repouso</li>
                <li>Autenticação segura e controlo de acesso</li>
                <li>Monitorização contínua de segurança</li>
                <li>Auditorias regulares de segurança</li>
                <li>Formação da equipa em práticas de privacidade</li>
              </ul>
            </Card>

            {/* Direitos do Utilizador */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <UserCheck className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Os Seus Direitos
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                Tem os seguintes direitos relativamente aos seus dados pessoais:
              </p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <strong>Acesso:</strong> Solicitar uma cópia dos seus dados
                </li>
                <li>
                  <strong>Retificação:</strong> Corrigir dados incorretos ou
                  incompletos
                </li>
                <li>
                  <strong>Eliminação:</strong> Solicitar a eliminação dos seus
                  dados
                </li>
                <li>
                  <strong>Portabilidade:</strong> Receber os seus dados em
                  formato estruturado
                </li>
                <li>
                  <strong>Oposição:</strong> Opor-se ao processamento dos seus
                  dados
                </li>
                <li>
                  <strong>Limitação:</strong> Solicitar a limitação do
                  processamento
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                Para exercer estes direitos, contacte-nos através de{" "}
                <a href="/contact" className="text-blue-600 hover:underline">
                  suporte@reflectio.app
                </a>
              </p>
            </Card>

            {/* Cookies */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cookies e Tecnologias Similares
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                Utilizamos cookies para melhorar a sua experiência:
              </p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <strong>Essenciais:</strong> Necessários para o funcionamento
                  básico
                </li>
                <li>
                  <strong>Funcionais:</strong> Lembram as suas preferências
                </li>
                <li>
                  <strong>Analíticos:</strong> Ajudam-nos a entender como usa o
                  site
                </li>
                <li>
                  <strong>Marketing:</strong> Personalizam anúncios (com
                  consentimento)
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                Pode gerir as suas preferências de cookies nas configurações do
                seu navegador.
              </p>
            </Card>

            {/* Contacto */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacte-nos
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                Se tiver questões sobre esta política de privacidade ou sobre
                como tratamos os seus dados, contacte-nos:
              </p>

              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Formulário:</strong>{" "}
                  <a href="/contact" className="text-blue-600 hover:underline">
                    Página de Contacto
                  </a>
                </p>
              </div>
            </Card>

            {/* Diferenças entre Utilizadores */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <UserCheck className="w-5 h-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Utilizadores Gratuitos vs Premium
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Utilizadores Gratuitos
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Podem criar posts públicos</li>
                    <li>
                      Podem criar reflexões sobre qualquer post não-premium
                    </li>
                    <li>Podem conectar-se com outros utilizadores</li>
                    <li>Não têm acesso a conteúdo marcado como Premium</li>
                    <li>Dados processados com moderação básica</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Utilizadores Premium
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Acesso completo a todos os conteúdos da plataforma</li>
                    <li>Podem criar e ver conteúdo Premium</li>
                    <li>Dados processados com moderação avançada por IA</li>
                    <li>Análise detalhada de qualidade de conteúdo</li>
                    <li>Estatísticas de utilização mais detalhadas</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Alterações */}
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Alterações a Esta Política
              </h3>
              <p className="text-gray-700">
                Podemos atualizar esta política periodicamente. Notificaremos
                sobre alterações significativas através de email ou aviso na
                plataforma. A utilização continuada dos nossos serviços após
                alterações constitui aceitação da nova política.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
