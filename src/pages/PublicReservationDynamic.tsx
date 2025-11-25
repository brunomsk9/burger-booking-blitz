import { useParams, Navigate } from 'react-router-dom';
import PublicReservation from '@/components/PublicReservation';
import { useFranchises } from '@/hooks/useFranchises';
import { Loader2 } from 'lucide-react';

const PublicReservationDynamic = () => {
  const { franchiseName } = useParams<{ franchiseName: string }>();
  const { franchises, loading } = useFranchises();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Decodificar o nome da franquia da URL e procurar no banco
  const decodedFranchiseName = decodeURIComponent(franchiseName || '');
  const franchise = franchises.find(
    f => f.displayName?.toLowerCase() === decodedFranchiseName.toLowerCase() ||
         f.name.toLowerCase() === decodedFranchiseName.toLowerCase()
  );

  if (!franchise) {
    return <Navigate to="/reserva" replace />;
  }

  return <PublicReservation preselectedFranchise={franchise.displayName || franchise.name} />;
};

export default PublicReservationDynamic;
