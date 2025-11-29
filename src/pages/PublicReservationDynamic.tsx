import { useParams, Navigate } from 'react-router-dom';
import PublicReservation from '@/components/PublicReservation';
import { useFranchisesPublic } from '@/hooks/useFranchisesPublic';
import { Loader2 } from 'lucide-react';

const PublicReservationDynamic = () => {
  const { franchiseName } = useParams<{ franchiseName: string }>();
  const { franchises, loading } = useFranchisesPublic();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Decodificar o slug da URL e procurar no banco
  const decodedSlug = decodeURIComponent(franchiseName || '');
  
  // Buscar por slug primeiro (prioridade), depois por name como fallback
  const franchise = franchises.find(
    f => f.slug?.toLowerCase() === decodedSlug.toLowerCase() ||
         f.name.toLowerCase() === decodedSlug.toLowerCase()
  );

  if (!franchise) {
    return <Navigate to="/reserva" replace />;
  }

  // Passar o name para o formulário e o slug para buscar o tema
  return (
    <PublicReservation 
      preselectedFranchise={franchise.name}
      franchiseSlug={franchise.slug || franchise.name}
    />
  );
};

export default PublicReservationDynamic;
