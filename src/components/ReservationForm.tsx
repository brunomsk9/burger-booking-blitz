
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFranchises } from '@/hooks/useFranchises';
import { Reservation } from '@/types/reservation';
import { Loader2 } from 'lucide-react';

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    franchise_name: string;
    customer_name: string;
    phone: string;
    date_time: string;
    people: number;
    birthday: boolean;
    birthday_person_name: string;
    characters: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    franchise_name: string;
    customer_name: string;
    phone: string;
    date_time: string;
    people: number;
    birthday: boolean;
    birthday_person_name: string;
    characters: string;
  }>>;
  editingReservation: Reservation | null;
  userFranchises?: Array<{ id: string; name: string; displayName: string }>;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingReservation,
  userFranchises,
}) => {
  const { franchises: allFranchises, loading: franchisesLoading } = useFranchises();
  
  // Se userFranchises foi passado, usar apenas elas; caso contrário, usar todas
  const franchises = userFranchises || allFranchises;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingReservation ? 'Editar Reserva' : 'Nova Reserva'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select 
                value={formData.franchise_name} 
                onValueChange={(value) => setFormData({...formData, franchise_name: value})}
                disabled={franchisesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={franchisesLoading ? "Carregando franquias..." : "Selecione a franquia"} />
                </SelectTrigger>
                <SelectContent>
                  {franchises.map(franchise => (
                    <SelectItem key={franchise.id} value={franchise.displayName || franchise.name}>
                      {franchise.displayName || franchise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                required
                placeholder="Nome completo do cliente"
              />
            </div>
            <div>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Telefone (11999888777)"
                required
              />
            </div>
            <div>
              <Input
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                required
              />
            </div>
            <div>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.people}
                onChange={(e) => setFormData({...formData, people: parseInt(e.target.value)})}
                placeholder="Número de pessoas"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="birthday"
                checked={formData.birthday}
                onCheckedChange={(checked) => setFormData({...formData, birthday: Boolean(checked)})}
              />
              <label htmlFor="birthday" className="text-sm">🎂 É aniversário?</label>
            </div>
          </div>
          
          {formData.birthday && (
            <div>
              <Input
                value={formData.birthday_person_name}
                onChange={(e) => setFormData({...formData, birthday_person_name: e.target.value})}
                placeholder="Nome do aniversariante"
              />
            </div>
          )}
          
          <div>
            <Textarea
              value={formData.characters}
              onChange={(e) => setFormData({...formData, characters: e.target.value})}
              placeholder="Personagens solicitados (Ex: Super-Homem, Batman, Mulher Maravilha...)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingReservation ? 'Atualizar' : 'Criar'} Reserva
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
