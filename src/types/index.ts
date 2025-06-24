
export interface Reservation {
  id: string;
  franchiseName: string;
  customerName: string;
  phone: string;
  dateTime: Date;
  people: number;
  birthday: boolean;
  birthdayPersonName?: string;
  characters: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const FRANCHISES = [
  'Herois Burguer - Shopping',
  'Herois Burguer - Centro',
  'Herois Burguer - Zona Norte',
  'Herois Burguer - Zona Sul',
  'Herois Burguer - Zona Oeste'
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  franchiseName?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | '';
}
