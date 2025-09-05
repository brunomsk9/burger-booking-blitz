
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
  'reservaja - Shopping',
  'reservaja - Centro',
  'reservaja - Zona Norte',
  'reservaja - Zona Sul',
  'reservaja - Zona Oeste'
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
