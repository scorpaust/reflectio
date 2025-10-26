"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
  userName: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  userName,
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"warning" | "confirmation">("warning");

  const expectedConfirmation = "ELIMINAR CONTA";
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;

    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      console.error("Erro ao eliminar conta:", error);
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setStep("warning");
    setConfirmationText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Eliminar Conta</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Fechar modal"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "warning" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">
                      ⚠️ Esta ação é irreversível!
                    </h3>
                    <p className="text-red-700 text-sm">
                      Ao eliminar a sua conta, perderá permanentemente:
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Todos os seus posts e reflexões</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Todas as suas conexões com outros utilizadores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>O seu progresso e pontuação de qualidade</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>A sua subscrição Premium (se ativa)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Todo o histórico da sua conta</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Alternativas
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Se apenas quer fazer uma pausa, pode simplesmente fazer
                      logout. Se tem problemas com a conta, contacte o nosso
                      suporte.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Conta a eliminar:
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>Nome:</strong> {userName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Confirmação Final
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Para confirmar que pretende eliminar permanentemente a sua
                  conta, escreva exatamente:
                </p>
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <code className="text-red-600 font-mono font-bold">
                    {expectedConfirmation}
                  </code>
                </div>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Escreva a confirmação aqui..."
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  disabled={isDeleting}
                  className={`text-center font-mono ${
                    confirmationText && !isConfirmationValid
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }`}
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-red-500 text-xs mt-1 text-center">
                    Texto não corresponde. Escreva exatamente:{" "}
                    {expectedConfirmation}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          {step === "warning" && (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => setStep("confirmation")}
                disabled={isDeleting}
                className="flex-1"
              >
                Continuar
              </Button>
            </>
          )}

          {step === "confirmation" && (
            <>
              <Button
                variant="secondary"
                onClick={() => setStep("warning")}
                disabled={isDeleting}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
                disabled={!isConfirmationValid || isDeleting}
                className="flex-1"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Conta
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
