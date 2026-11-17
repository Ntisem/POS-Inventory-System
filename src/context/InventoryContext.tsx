import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product, ProductDraft, Transaction } from '../types';
import { SEED_PRODUCTS, SEED_TRANSACTIONS, deriveStatus } from '../data/seed';

interface InventoryContextValue {
  products: Product[];
  transactions: Transaction[];
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addProducts: (drafts: ProductDraft[]) => Product[];
  updateProduct: (id: string, draft: ProductDraft) => Product | null;
  updateProducts: (ids: string[], patch: Partial<ProductDraft>) => number;
  deleteProducts: (ids: string[]) => number;
  getProduct: (id: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);
const STORAGE_KEY = 'pos-products';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {
    /* ignore */
  }
  return SEED_PRODUCTS;
}

function persist(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function draftToProduct(draft: ProductDraft, existing?: Product): Product {
  const stock = Number(draft.stock);
  const reorderLevel = Number(draft.reorderLevel);
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: draft.name.trim(),
    sku: draft.sku.trim().toUpperCase(),
    category: draft.category,
    price: Number(draft.price),
    cost: Number(draft.cost),
    stock,
    reorderLevel,
    description: draft.description.trim(),
    status: deriveStatus(stock, reorderLevel),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [transactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const addProducts = useCallback((drafts: ProductDraft[]) => {
    const created = drafts.map((d) => draftToProduct(d));
    setProducts((prev) => {
      const next = [...created, ...prev];
      persist(next);
      return next;
    });
    return created;
  }, []);

  const updateProduct = useCallback((id: string, draft: ProductDraft) => {
    let updated: Product | null = null;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        updated = draftToProduct(draft, p);
        return updated;
      });
      persist(next);
      return next;
    });
    return updated;
  }, []);

  const updateProducts = useCallback((ids: string[], patch: Partial<ProductDraft>) => {
    const idSet = new Set(ids);
    let count = 0;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (!idSet.has(p.id)) return p;
        count += 1;
        const draft: ProductDraft = {
          tempId: p.id,
          name: patch.name ?? p.name,
          sku: patch.sku ?? p.sku,
          category: patch.category ?? p.category,
          price: patch.price ?? String(p.price),
          cost: patch.cost ?? String(p.cost),
          stock: patch.stock ?? String(p.stock),
          reorderLevel: patch.reorderLevel ?? String(p.reorderLevel),
          description: patch.description ?? p.description,
        };
        return draftToProduct(draft, p);
      });
      persist(next);
      return next;
    });
    setSelectedIds(new Set());
    return count;
  }, []);

  const deleteProducts = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    let count = 0;
    setProducts((prev) => {
      count = prev.filter((p) => idSet.has(p.id)).length;
      const next = prev.filter((p) => !idSet.has(p.id));
      persist(next);
      return next;
    });
    setSelectedIds(new Set());
    return count;
  }, []);

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const value = useMemo(
    () => ({
      products,
      transactions,
      selectedIds,
      toggleSelect,
      selectAll,
      clearSelection,
      addProducts,
      updateProduct,
      updateProducts,
      deleteProducts,
      getProduct,
    }),
    [
      products,
      transactions,
      selectedIds,
      toggleSelect,
      selectAll,
      clearSelection,
      addProducts,
      updateProduct,
      updateProducts,
      deleteProducts,
      getProduct,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
