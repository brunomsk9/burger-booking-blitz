
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useFranchises } from '@/hooks/useFranchises';
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
}

const ReservationFormFields: React.FC<ReservationFormFieldsProps> = ({
  formData,
  onFormDataChange
}) => {
  const { franchises, loading: franchisesLoading, error } = useFranchises();

  console.log('🔍 ReservationFormFields - Franchises state:', {
    franchises,
    loading: franchisesLoading,
    error,
    count: franchises?.length || 0
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="franchise_name" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Franquia
            {franchisesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </Label>
          {error && (
            <p className="text-red-500 text-sm mb-2">
              Erro ao carregar franquias: {error.message}
            </p>
          )}
          <Select 
            value={formData.franchise_name} 
            onValueChange={(value) => onFormDataChange({ franchise_name: value })}
            disabled={franchisesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                franchisesLoading 
                  ? "Carregando franquias..." 
                  : franchises.length === 0 
                    ? "Nenhuma franquia disponível" 
                    : "Selecione a franquia"
              } />
            </SelectTrigger>
            <SelectContent>
              {franchises.map(franchise => (
                <SelectItem key={franchise.id} value={franchise.displayName || franchise.name}>
                  {franchise.displayName || franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {franchises.length === 0 && !franchisesLoading && (
            <p className="text-sm text-gray-500 mt-1">
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
