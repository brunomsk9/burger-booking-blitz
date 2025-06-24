
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import FranchiseEditor from './FranchiseEditor';
import FranchiseSearch from './franchise/FranchiseSearch';
import FranchiseTable from './franchise/FranchiseTable';
import { useFranchiseOperations } from '@/hooks/useFranchiseOperations';

interface Franchise {
  id: string;
  name: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  active: boolean;
  logo_url: string | null;
  created_at: string;
}

const FranchiseManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const {
    franchises,
    isLoading,
    error,
    handleToggleActive,
    handleUpdateComplete
  } = useFranchiseOperations();

  const handleEdit = (franchise: Franchise) => {
    console.log('✏️ Editing franchise:', franchise);
    setEditingFranchise(franchise);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    console.log('❌ Closing franchise editor');
    setIsEditorOpen(false);
    setEditingFranchise(null);
  };

  const filteredFranchises = franchises?.filter(franchise =>
    franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Franquias</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar franquias: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Franquias</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Franquias</CardTitle>
          <FranchiseSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <p>Carregando franquias...</p>
            </div>
          ) : (
            <FranchiseTable
              franchises={filteredFranchises || []}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
            />
          )}
        </CardContent>
      </Card>

      <FranchiseEditor
        franchise={editingFranchise}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onUpdate={handleUpdateComplete}
      />
    </div>
  );
};

export default FranchiseManager;
