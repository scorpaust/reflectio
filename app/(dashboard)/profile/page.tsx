import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <User className="w-16 h-16 text-purple-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Seu Perfil</h3>
      <p className="text-gray-600">🚧 Página de perfil em construção</p>
    </div>
  );
}
