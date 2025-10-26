"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Paperclip,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    attachment: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > 500 * 1024) {
      alert("Ficheiro muito grande. O tamanho máximo é 500KB.");
      e.target.value = ""; // Limpar o input
      return;
    }

    setFormData((prev) => ({ ...prev, attachment: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("message", formData.message);
      if (formData.attachment) {
        formDataToSend.append("attachment", formData.attachment);
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          attachment: null,
        });
      } else {
        throw new Error("Erro ao enviar mensagem");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {isSubmitted ? (
            <Card className="text-center p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mensagem Enviada!
              </h1>
              <p className="text-gray-600 mb-6">
                Obrigado pelo seu contacto. Responderemos em breve.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="primary">
                Enviar Nova Mensagem
              </Button>
            </Card>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Contacto
                </h1>
                <p className="text-gray-600">
                  Entre em contacto connosco. Estamos aqui para ajudar.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Informações de Contacto */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Informações de Contacto
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600">
                          dinismiguelcosta@hotmail.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Telefone</p>
                        <p className="text-gray-600">+351 933 289 741</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Localização</p>
                        <p className="text-gray-600">Portugal</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Horário de Atendimento
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Segunda a Sexta: 9h00 - 18h00</p>
                      <p>Sábado: 9h00 - 13h00</p>
                      <p>Domingo: Fechado</p>
                    </div>
                  </div>
                </Card>

                {/* Formulário de Contacto */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Envie-nos uma Mensagem
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nome *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="O seu nome completo"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Telefone (opcional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+351 XXX XXX XXX"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="attachment"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Anexo (opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          id="attachment"
                          name="attachment"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <label
                          htmlFor="attachment"
                          className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
                        >
                          <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">
                            {formData.attachment
                              ? formData.attachment.name
                              : "Escolher ficheiro"}
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceites: PDF, DOC, DOCX, TXT, JPG, PNG (máx.
                        500KB)
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mensagem *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Descreva a sua questão ou sugestão..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      variant="primary"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
