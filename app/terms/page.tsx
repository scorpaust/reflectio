import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  FileText,
  Users,
  Shield,
  AlertTriangle,
  Scale,
  CreditCard,
  Ban,
  Mail,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Termos de Serviço
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString("pt-PT")}
            </p>
          </div>

          <Card className="p-8 mb-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Acordo de Utilização
              </h2>
            </div>
            <p className="text-gray-700">
              Ao aceder e utilizar o Reflectio, concorda em cumprir estes termos
              de serviço. Se não concordar com qualquer parte destes termos, não
              deve utilizar a nossa plataforma.
            </p>
          </Card>

          <div className="space-y-6">
            {/* Descrição do Serviço */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Descrição do Serviço
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                O Reflectio é uma plataforma digital que permite aos
                utilizadores:
              </p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Partilhar experiências pessoais através de posts</li>
                <li>
                  Criar e partilhar reflexões sobre conteúdos de outros
                  utilizadores
                </li>
                <li>Conectar-se com outros membros da comunidade</li>
                <li>
                  Acompanhar o progresso pessoal através de um sistema de níveis
                </li>
                <li>Aceder a funcionalidades premium mediante subscrição</li>
              </ul>
            </Card>

            {/* Elegibilidade e Registo */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Elegibilidade e Registo
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requisitos</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Ter pelo menos 16 anos de idade</li>
                    <li>Fornecer informações verdadeiras e atualizadas</li>
                    <li>
                      Manter a confidencialidade das credenciais de acesso
                    </li>
                    <li>
                      Ser responsável por todas as atividades na sua conta
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Conta</h4>
                  <p className="text-gray-600">
                    É responsável por manter a segurança da sua conta e por
                    todas as atividades que ocorram sob as suas credenciais.
                    Deve notificar-nos imediatamente sobre qualquer uso não
                    autorizado.
                  </p>
                </div>
              </div>
            </Card>

            {/* Conduta do Utilizador */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Conduta do Utilizador
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Comportamento Permitido
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Partilhar conteúdo original e respeitoso</li>
                    <li>Criar reflexões sobre posts de outros utilizadores</li>
                    <li>Conectar-se com outros membros da comunidade</li>
                    <li>Interagir de forma construtiva e empática</li>
                    <li>Respeitar a privacidade de outros utilizadores</li>
                    <li>
                      Contribuir para um ambiente positivo de aprendizagem
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Comportamento Proibido
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>
                      Publicar conteúdo ofensivo, discriminatório ou de ódio
                    </li>
                    <li>Assediar, intimidar ou ameaçar outros utilizadores</li>
                    <li>Partilhar informações falsas ou enganosas</li>
                    <li>Violar direitos de propriedade intelectual</li>
                    <li>Usar a plataforma para atividades ilegais</li>
                    <li>Criar múltiplas contas para contornar restrições</li>
                    <li>Fazer spam ou publicidade não autorizada</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Conteúdo e Propriedade Intelectual */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Conteúdo e Propriedade Intelectual
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Seu Conteúdo
                  </h4>
                  <p className="text-gray-600 mb-2">
                    Mantém a propriedade do conteúdo que publica, mas
                    concede-nos uma licença para:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Exibir e distribuir o seu conteúdo na plataforma</li>
                    <li>
                      Fazer cópias técnicas necessárias para o funcionamento
                    </li>
                    <li>Moderar conteúdo conforme as nossas políticas</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Nosso Conteúdo
                  </h4>
                  <p className="text-gray-600">
                    A plataforma, design, código e outros elementos são
                    propriedade do Reflectio e estão protegidos por direitos de
                    propriedade intelectual.
                  </p>
                </div>
              </div>
            </Card>

            {/* Subscrições Premium */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Subscrições Premium
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Utilizadores Gratuitos
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Podem criar e partilhar posts públicos</li>
                    <li>
                      Podem criar reflexões apenas sobre posts públicos de
                      outros utilizadores gratuitos
                    </li>
                    <li>
                      Podem aceitar ou recusar pedidos de conexão (não podem
                      solicitar)
                    </li>
                    <li>Não podem ver posts marcados como Premium</li>
                    <li>Não podem marcar os seus posts como Premium</li>
                    <li>Conteúdo sujeito a moderação obrigatória com IA</li>
                    <li>Acesso a estatísticas básicas de progresso</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Utilizadores Premium
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Acesso a todas as funcionalidades gratuitas</li>
                    <li>Podem ver e criar conteúdo Premium</li>
                    <li>
                      Podem criar reflexões sobre qualquer post (público ou
                      premium)
                    </li>
                    <li>Podem solicitar conexões com outros utilizadores</li>
                    <li>
                      Moderação inteligente com IA (aplicada quando necessário)
                    </li>
                    <li>Estatísticas detalhadas e análises de progresso</li>
                    <li>Suporte prioritário</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pagamentos</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>As subscrições são cobradas mensalmente</li>
                    <li>
                      Os preços podem ser alterados com aviso prévio de 30 dias
                    </li>
                    <li>Os pagamentos são processados através do Stripe</li>
                    <li>Não oferecemos reembolsos para períodos parciais</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Cancelamento
                  </h4>
                  <p className="text-gray-600">
                    Pode cancelar a sua subscrição a qualquer momento. O acesso
                    premium mantém-se até ao final do período pago.
                  </p>
                </div>
              </div>
            </Card>

            {/* Moderação e Suspensão */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Ban className="w-5 h-5 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Moderação e Suspensão
                </h3>
              </div>

              <p className="text-gray-700 mb-4">Reservamo-nos o direito de:</p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  Moderar, remover ou restringir conteúdo que viole estes termos
                </li>
                <li>
                  Suspender ou terminar contas que violem repetidamente as
                  regras
                </li>
                <li>
                  Investigar atividades suspeitas ou relatórios de utilizadores
                </li>
                <li>Cooperar com autoridades em investigações legais</li>
              </ul>
            </Card>

            {/* Limitação de Responsabilidade */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Limitação de Responsabilidade
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Disponibilidade
                  </h4>
                  <p className="text-gray-600">
                    Embora nos esforcemos para manter a plataforma disponível,
                    não garantimos acesso ininterrupto. Podemos realizar
                    manutenções ou enfrentar interrupções técnicas.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Conteúdo de Terceiros
                  </h4>
                  <p className="text-gray-600">
                    Não somos responsáveis pelo conteúdo publicado pelos
                    utilizadores. Cada utilizador é responsável pelas suas
                    próprias publicações e interações.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Danos</h4>
                  <p className="text-gray-600">
                    A nossa responsabilidade está limitada ao valor pago pelos
                    serviços nos últimos 12 meses. Não somos responsáveis por
                    danos indiretos ou consequenciais.
                  </p>
                </div>
              </div>
            </Card>

            {/* Lei Aplicável */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Scale className="w-5 h-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Lei Aplicável e Jurisdição
                </h3>
              </div>

              <p className="text-gray-700">
                Estes termos são regidos pela lei portuguesa. Qualquer disputa
                será resolvida nos tribunais competentes de Portugal.
              </p>
            </Card>

            {/* Alterações aos Termos */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Alterações aos Termos
                </h3>
              </div>

              <p className="text-gray-700">
                Podemos atualizar estes termos periodicamente. Alterações
                significativas serão comunicadas com 30 dias de antecedência. A
                utilização continuada após alterações constitui aceitação dos
                novos termos.
              </p>
            </Card>

            {/* Contacto */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacto
                </h3>
              </div>

              <p className="text-gray-700 mb-4">
                Para questões sobre estes termos de serviço:
              </p>

              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Suporte:</strong>{" "}
                  <a href="/contact" className="text-blue-600 hover:underline">
                    Página de Contacto
                  </a>
                </p>
              </div>
            </Card>

            {/* Aceitação */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Aceitação dos Termos
              </h3>
              <p className="text-gray-700">
                Ao utilizar o Reflectio, confirma que leu, compreendeu e
                concorda em cumprir estes termos de serviço. Se não concordar,
                deve cessar imediatamente a utilização da plataforma.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
