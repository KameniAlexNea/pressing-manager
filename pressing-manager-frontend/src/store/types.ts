export type UserRole = 'admin' | 'manager';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string; // User ID of the store owner (admin)
  managers: User[]; // List of managers associated with the store
  items: string[]; // List of item IDs associated with the store
}

export interface Item {
  id: string;
  storeId: string; // ID of the store this item belongs to
  description: string;
  price: number;
  status: 'received' | 'cleaned' | 'delivered';
  date_received: string;
  date_cleaned?: string | null;
  date_delivered?: string | null;
  notes?: string | null;
  contact?: string | null;
  date_promised?: string | null;
}

export interface Invite {
  id: string;
  storeId: string; // ID of the store for which the invite is sent
  email: string; // Email of the invited manager
  status: 'pending' | 'accepted' | 'declined'; // Status of the invite
}