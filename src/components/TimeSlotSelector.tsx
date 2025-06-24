
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  selectedTime: string;
  availableSlots: TimeSlot[];
  checkingAvailability: boolean;
  franchiseName: string;
  date: string;
  onTimeChange: (time: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedTime,
  availableSlots,
  checkingAvailability,
  franchiseName,
  date,
  onTimeChange
}) => {
  const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);

  return (
    <div>
      <Label htmlFor="time" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Horário
        {checkingAvailability && <Loader2 className="h-4 w-4 animate-spin" />}
      </Label>
      <Select 
        value={selectedTime} 
        onValueChange={onTimeChange}
        disabled={!franchiseName || !date || checkingAvailability}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            !franchiseName || !date 
              ? "Selecione franquia e data primeiro" 
              : "Selecione o horário"
          } />
        </SelectTrigger>
        <SelectContent>
          {availableSlots.map(slot => (
            <SelectItem 
              key={slot.time} 
              value={slot.time}
              disabled={!slot.available}
              className={!slot.available ? 'opacity-50' : ''}
            >
              <div className="flex items-center gap-2">
                {slot.available ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {slot.time} {!slot.available && '(Ocupado)'}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedSlot && selectedSlot.available && (
        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          Horário disponível!
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelector;
