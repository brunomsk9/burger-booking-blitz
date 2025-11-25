import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ImageIcon, Copy, ExternalLink } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { getFranchiseDisplayName } from '@/utils/franchiseUtils';
import { toast } from '@/hooks/use-toast';

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
  webhook_url: string | null;
  slug: string | null;
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

  const handleCopyLink = (franchise: Franchise) => {
    const slug = franchise.slug || encodeURIComponent(getFranchiseDisplayName(franchise));
    const url = `${window.location.origin}/reserva/${slug}`;
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link copiado!',
        description: 'O link da página de reservas foi copiado para a área de transferência.',
      });
    });
  };

  const handleOpenLink = (franchise: Franchise) => {
    const slug = franchise.slug || encodeURIComponent(getFranchiseDisplayName(franchise));
    window.open(`/reserva/${slug}`, '_blank');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Logo</TableHead>
          <TableHead>Nome da Empresa</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Gerente</TableHead>
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
              {getFranchiseDisplayName(franchise)}
            </TableCell>
            <TableCell>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {franchise.slug || '-'}
              </code>
            </TableCell>
            <TableCell>{franchise.manager_name || '-'}</TableCell>
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
                  title="Editar franquia"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(franchise)}
                  title="Copiar link da página de reservas"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLink(franchise)}
                  title="Abrir página de reservas"
                >
                  <ExternalLink className="h-4 w-4" />
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
            <TableCell colSpan={6} className="text-center py-4">
              Nenhuma franquia encontrada.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default FranchiseTable;
