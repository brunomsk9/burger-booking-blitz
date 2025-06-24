
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { Franchise } from '@/hooks/useFranchises';

interface FranchiseSelectorProps {
  franchises: Franchise[];
  selectedFranchise: string;
  onFranchiseChange: (franchise: string) => void;
}

const FranchiseSelector: React.FC<FranchiseSelectorProps> = ({
  franchises,
  selectedFranchise,
  onFranchiseChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 size={20} />
          Selecionar Franquia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="franchise-select">Franquia</Label>
          <select
            id="franchise-select"
            value={selectedFranchise}
            onChange={(e) => onFranchiseChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {franchises.map((franchise) => (
              <option key={franchise.id} value={franchise.displayName}>
                {franchise.displayName}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FranchiseSelector;
