
export interface Reservation {
  id: string;
  franchiseName: string;
  customerName: string;
  phone: string;
  dateTime: Date;
  people: number;
  birthday: boolean;
  characters: string[];
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer' | 'editor';
  createdAt: Date;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  franchiseName?: string;
  status?: string;
}

export const CHARACTERS = [
  'Ronald McDonald',
  'Hambúrguer',
  'Batata Frita',
  'Milkshake',
  'Chef Burger',
  'Pickle Rick',
  'King Burger'
];

export const FRANCHISES = [
  'Burger Central - Shopping',
  'Burger Central - Centro',
  'Burger Central - Zona Norte',
  'Burger Central - Zona Sul'
];
