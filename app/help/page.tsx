"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Users,
  Settings,
  CreditCard,
  Shield,
  Mail,
  ExternalLink,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    category: "Começar",
    question: "Como criar uma conta no Reflectio?",
    answer:
      "Para criar uma conta, clique em 'Registar' na página inicial, preencha os seus dados (nome, email, palavra-passe) e confirme o seu email. Depois pode completar o seu perfil com foto e biografia.",
  },
  {
    id: "2",
    category: "Começar",
    question: "Como fazer o meu primeiro post?",
    answer:
      "No feed principal, clique no botão 'Criar Post'. Escolha o tipo de conteúdo (livro, filme, foto ou pensamento), adicione um título, descreva a sua experiência e publique. Pode também adicionar fontes para enriquecer o conteúdo.",
  },
  {
    id: "3",
    category: "Funcionalidades",
    question: "O que são reflexões e como criar uma?",
    answer:
      "Reflexões são comentários aprofundados sobre posts de outros utilizadores. Para criar uma reflexão, abra um post e clique em 'Adicionar Reflexão'. Partilhe os seus pensamentos, insights ou experiências relacionadas.",
  },
  {
    id: "4",
    category: "Funcionalidades",
    question: "Como funciona o sistema de níveis?",
    answer:
      "O sistema de níveis baseia-se na qualidade das suas contribuições. Ganha pontos por criar posts, reflexões construtivas e interações positivas. Os níveis vão de Iniciante (🌱) a Sábio (✨), cada um com benefícios específicos.",
  },
  {
    id: "5",
    category: "Funcionalidades",
    question: "Como conectar com outros utilizadores?",
    answer:
      "Pode conectar-se através da página 'Conexões', procurando utilizadores por nome ou explorando sugestões baseadas nos seus interesses. As conexões permitem acompanhar mais facilmente o conteúdo de pessoas que admira.",
  },
  {
    id: "6",
    category: "Premium",
    question: "Quais são os benefícios do Reflectio Premium?",
    answer:
      "O Premium inclui: moderação avançada com IA, análise de qualidade em tempo real, estatísticas detalhadas de progresso, suporte prioritário e acesso antecipado a novas funcionalidades.",
  },
  {
    id: "7",
    category: "Premium",
    question: "Como cancelar a minha subscrição Premium?",
    answer:
      "Vá ao seu perfil, clique em 'Gerir Subscrição' e depois 'Cancelar Subscrição'. O acesso Premium mantém-se até ao final do período pago. Pode reativar a qualquer momento.",
  },
  {
    id: "8",
    category: "Conta",
    question: "Como alterar a minha palavra-passe?",
    answer:
      "Nas configurações do perfil, clique em 'Alterar Palavra-passe'. Introduza a palavra-passe atual e a nova palavra-passe duas vezes. Por segurança, será desconectado de outros dispositivos.",
  },
  {
    id: "9",
    category: "Conta",
    question: "Como eliminar a minha conta?",
    answer:
      "Nas configurações do perfil, encontrará a opção 'Eliminar Conta'. Esta ação é irreversível e remove todos os seus dados. Recomendamos fazer download dos seus dados primeiro.",
  },
  {
    id: "10",
    category: "Privacidade",
    question: "Como controlar quem vê o meu conteúdo?",
    answer:
      "Atualmente, todos os posts são públicos na comunidade. Estamos a desenvolver controlos de privacidade mais granulares. Pode sempre editar ou eliminar os seus posts a qualquer momento.",
  },
  {
    id: "11",
    category: "Privacidade",
    question: "Como reportar conteúdo inadequado?",
    answer:
      "Em qualquer post ou reflexão, clique nos três pontos (...) e selecione 'Reportar'. Descreva o problema e a nossa equipa de moderação analisará rapidamente.",
  },
  {
    id: "12",
    category: "Técnico",
    question: "A aplicação não está a carregar. O que fazer?",
    answer:
      "Primeiro, verifique a sua ligação à internet. Depois, tente atualizar a página (Ctrl+F5). Se o problema persistir, limpe a cache do navegador ou tente noutro navegador. Contacte-nos se continuar com problemas.",
  },
];

const categories = [
  { id: "all", name: "Todas", icon: HelpCircle },
  { id: "Começar", name: "Começar", icon: BookOpen },
  { id: "Funcionalidades", name: "Funcionalidades", icon: MessageCircle },
  { id: "Premium", name: "Premium", icon: CreditCard },
  { id: "Conta", name: "Conta", icon: Users },
  { id: "Privacidade", name: "Privacidade", icon: Shield },
  { id: "Técnico", name: "Técnico", icon: Settings },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Centro de Ajuda
            </h1>
            <p className="text-gray-600">
              Encontre respostas às suas questões sobre o Reflectio
            </p>
          </div>

          {/* Search */}
          <Card className="p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Procurar na ajuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </Card>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 mb-8">
            {filteredFAQs.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os termos de pesquisa ou categoria selecionada.
                </p>
              </Card>
            ) : (
              filteredFAQs.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded mr-3">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.question}
                        </h3>
                      </div>
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {expandedItems.includes(item.id) && (
                    <div className="px-6 pb-6">
                      <div className="border-t pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Links Úteis
              </h3>
              <div className="space-y-3">
                <a
                  href="/about"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Sobre o Reflectio
                </a>
                <a
                  href="/privacy"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Política de Privacidade
                </a>
                <a
                  href="/terms"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Termos de Serviço
                </a>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Precisa de Mais Ajuda?
              </h3>
              <div className="space-y-3">
                <a
                  href="/contact"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Suporte
                </a>
                <a
                  href="mailto:suporte@reflectio.app"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  suporte@reflectio.app
                </a>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Horário de Suporte:</strong>
                  <br />
                  Segunda a Sexta: 9h00 - 18h00
                  <br />
                  Tempo de resposta: até 24h
                </p>
              </div>
            </Card>
          </div>

          {/* Contact CTA */}
          <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Não encontrou o que procurava?
            </h3>
            <p className="text-gray-600 mb-6">
              A nossa equipa de suporte está pronta para ajudar com qualquer
              questão.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contactar Suporte
            </a>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
