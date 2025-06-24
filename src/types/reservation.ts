
export interface Reservation {
  id: string;
  franchise_name: string;
  customer_name: string;
  phone: string;
  date_time: string;
  people: number;
  birthday: boolean;
  birthday_person_name?: string;
  characters?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateReservationData {
  franchise_name: string;
  customer_name: string;
  phone: string;
  date_time: string;
  people: number;
  birthday: boolean;
  birthday_person_name?: string;
  characters?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface UpdateReservationData extends Partial<CreateReservationData> {}
