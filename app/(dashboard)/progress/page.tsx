import { Award } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <Award className="w-16 h-16 text-purple-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Seu Progresso</h3>
      <p className="text-gray-600">🚧 Sistema de progressão em construção</p>
    </div>
  );
}
