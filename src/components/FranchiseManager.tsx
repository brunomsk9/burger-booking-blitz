
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Search, Edit, ImageIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import FranchiseEditor from './FranchiseEditor';

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
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();

  const { data: franchises, isLoading, error } = useQuery({
    queryKey: ['franchises'],
    queryFn: async () => {
      console.log('Buscando franquias...');
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar franquias:', error);
        throw error;
      }

      console.log('Franquias encontradas:', data);
      return data as Franchise[];
    },
  });

  const handleToggleActive = async (franchise: Franchise) => {
    try {
      const { error } = await supabase
        .from('franchises')
        .update({ active: !franchise.active })
        .eq('id', franchise.id);

      if (error) {
        console.error('Erro ao atualizar franquia:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar status da franquia.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: `Franquia ${franchise.active ? 'desativada' : 'ativada'} com sucesso!`,
      });

      queryClient.invalidateQueries({ queryKey: ['franchises'] });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar franquia.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (franchise: Franchise) => {
    setEditingFranchise(franchise);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingFranchise(null);
  };

  const handleUpdateComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['franchises'] });
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
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, empresa, gerente ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <p>Carregando franquias...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Gerente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFranchises?.map((franchise) => (
                  <TableRow key={franchise.id}>
                    <TableCell>
                      {franchise.logo_url ? (
                        <img 
                          src={franchise.logo_url} 
                          alt="Logo" 
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {franchise.company_name || franchise.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {franchise.name}
                    </TableCell>
                    <TableCell>{franchise.manager_name || '-'}</TableCell>
                    <TableCell>{franchise.email || '-'}</TableCell>
                    <TableCell>{franchise.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={franchise.active ? 'default' : 'secondary'}>
                        {franchise.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(franchise)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {isSuperAdmin() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(franchise)}
                          >
                            {franchise.active ? 'Desativar' : 'Ativar'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFranchises?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Nenhuma franquia encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
