export type Theme = 'dark' | 'light';

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  description: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDraft {
  tempId: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  cost: string;
  stock: string;
  reorderLevel: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export interface Transaction {
  id: string;
  productName: string;
  type: 'sale' | 'restock' | 'adjustment';
  quantity: number;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface FieldErrors {
  [key: string]: string | undefined;
}

export interface User {
  username: string;
  displayName: string;
}
