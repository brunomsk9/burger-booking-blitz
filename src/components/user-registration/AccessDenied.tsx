
import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <ShieldAlert size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
      <p className="text-gray-600">Você não tem permissão para cadastrar usuários.</p>
    </div>
  );
};

export default AccessDenied;
