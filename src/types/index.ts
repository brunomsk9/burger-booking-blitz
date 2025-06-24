
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

export const FRANCHISES = [
  'Burger Central - Shopping',
  'Burger Central - Centro',
  'Burger Central - Zona Norte',
  'Burger Central - Zona Sul',
  'Burger Central - Zona Oeste'
];

export const CHARACTERS = [
  'Ronald McDonald',
  'Chef Burger',
  'Hambúrguer',
  'Batata Frita',
  'Milkshake',
  'Nuggets'
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}
