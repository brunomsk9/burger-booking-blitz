import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useFranchises } from '@/hooks/useFranchises';
import { useFranchisesPublic } from '@/hooks/useFranchisesPublic';
import { User, Phone, MapPin, Loader2 } from 'lucide-react';

interface FormData {
  franchise_name: string;
  customer_name: string;
  phone: string;
  date: string;
  people: number;
  birthday: boolean;
  birthday_person_name: string;
  characters: string;
}

interface ReservationFormFieldsProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  disableFranchiseSelect?: boolean;
  userFranchises?: Array<{ id: string; name: string; displayName: string }>;
  usePublicView?: boolean;
}

const ReservationFormFields: React.FC<ReservationFormFieldsProps> = ({
  formData,
  onFormDataChange,
  disableFranchiseSelect = false,
  userFranchises,
  usePublicView = false
}) => {
  const { franchises: privateFranchises, loading: privateLoading, error: privateError } = useFranchises();
  const { franchises: publicFranchises, loading: publicLoading, error: publicError } = useFranchisesPublic();
  
  // Escolher qual fonte usar baseado no contexto
  const allFranchises = usePublicView ? publicFranchises : privateFranchises;
  const franchisesLoading = usePublicView ? publicLoading : privateLoading;
  const error = usePublicView ? publicError : privateError;
  
  // Se userFranchises foi passado, usar apenas elas; caso contrário, usar todas
  const franchises = userFranchises || allFranchises;

  console.log('🔍 ReservationFormFields - Current state:', {
    franchises,
    franchisesCount: franchises?.length || 0,
    loading: franchisesLoading,
    error,
    selectedValue: formData.franchise_name
  });

  const handleFranchiseChange = (value: string) => {
    console.log('🔄 Franchise selection changed to:', value);
    onFormDataChange({ franchise_name: value });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="franchise_name" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Franquia
            {franchisesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </Label>
          
          {error && (
            <p className="text-red-500 text-sm">
              Erro ao carregar franquias: {error.message}
            </p>
          )}
          
          <Select 
            value={formData.franchise_name} 
            onValueChange={handleFranchiseChange}
            disabled={franchisesLoading || disableFranchiseSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                franchisesLoading 
                  ? "Carregando franquias..." 
                  : !franchises || franchises.length === 0 
                    ? "Nenhuma franquia disponível" 
                    : "Selecione a franquia"
              } />
            </SelectTrigger>
            <SelectContent>
              {!franchisesLoading && franchises && franchises.length > 0 ? (
                franchises.map(franchise => {
                  // Usar displayName se disponível (franchises privadas), caso contrário usar name (franchises públicas)
                  const displayName = ('displayName' in franchise ? franchise.displayName : franchise.name) as string;
                  console.log('🏢 Rendering franchise option:', displayName);
                  return (
                    <SelectItem 
                      key={franchise.id} 
                      value={displayName}
                    >
                      {displayName}
                    </SelectItem>
                  );
                })
              ) : (
                !franchisesLoading && (
                  <SelectItem value="no-franchises" disabled>
                    Nenhuma franquia disponível
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          
          {!franchisesLoading && (!franchises || franchises.length === 0) && (
            <p className="text-sm text-gray-500">
              Nenhuma franquia ativa encontrada
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="customer_name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Seu Nome
          </Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => onFormDataChange({ customer_name: e.target.value })}
            required
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            WhatsApp
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFormDataChange({ phone: e.target.value })}
            placeholder="11999888777"
            required
          />
        </div>

        <div>
          <Label htmlFor="people">Número de Pessoas</Label>
          <Input
            id="people"
            type="number"
            min="1"
            max="20"
            value={formData.people}
            onChange={(e) => onFormDataChange({ people: parseInt(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Data da Reserva</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onFormDataChange({ date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="birthday"
          checked={formData.birthday}
          onCheckedChange={(checked) => onFormDataChange({ birthday: Boolean(checked) })}
        />
        <Label htmlFor="birthday" className="text-lg">🎂 É uma festa de aniversário?</Label>
      </div>

      {formData.birthday && (
        <div>
          <Label htmlFor="birthday_person_name">Nome do Aniversariante</Label>
          <Input
            id="birthday_person_name"
            value={formData.birthday_person_name}
            onChange={(e) => onFormDataChange({ birthday_person_name: e.target.value })}
            placeholder="Nome de quem está fazendo aniversário"
          />
        </div>
      )}

      <div>
        <Label htmlFor="characters">Personagens que gostaria de ver (opcional)</Label>
        <Textarea
          id="characters"
          value={formData.characters}
          onChange={(e) => onFormDataChange({ characters: e.target.value })}
          placeholder="Ex: Super-Homem, Batman, Mulher Maravilha..."
          rows={3}
        />
      </div>
    </>
  );
};

export default ReservationFormFields;
