
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FranchiseSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const FranchiseSearch: React.FC<FranchiseSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar por nome, empresa, gerente ou email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};

export default FranchiseSearch;
