
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ImageIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

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

interface FranchiseTableProps {
  franchises: Franchise[];
  onEdit: (franchise: Franchise) => void;
  onToggleActive: (franchise: Franchise) => void;
}

const FranchiseTable: React.FC<FranchiseTableProps> = ({
  franchises,
  onEdit,
  onToggleActive
}) => {
  const { isSuperAdmin } = usePermissions();

  return (
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
        {franchises.map((franchise) => (
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
                  onClick={() => onEdit(franchise)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                {isSuperAdmin() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(franchise)}
                  >
                    {franchise.active ? 'Desativar' : 'Ativar'}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {franchises.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4">
              Nenhuma franquia encontrada.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default FranchiseTable;
