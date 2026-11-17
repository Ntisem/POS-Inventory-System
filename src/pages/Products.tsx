import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TextAreaField, TextField, SelectField } from '../components/ui/Field';
import { CATEGORIES } from '../data/seed';
import { formatCurrency, statusLabel, validateDraft } from '../utils/validation';
import type { FieldErrors, Product, ProductDraft } from '../types';
import './Products.css';

function productToDraft(p: Product): ProductDraft {
  return {
    tempId: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: String(p.price),
    cost: String(p.cost),
    stock: String(p.stock),
    reorderLevel: String(p.reorderLevel),
    description: p.description,
  };
}

function statusBadge(status: Product['status']) {
  if (status === 'in-stock') return 'badge badge--green';
  if (status === 'low-stock') return 'badge badge--orange';
  return 'badge badge--red';
}

export function Products() {
  const {
    products,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    updateProduct,
    updateProducts,
    deleteProducts,
  } = useInventory();
  const { pushToast } = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Product['status']>('all');
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft | null>(null);
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [updateConfirm, setUpdateConfirm] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, query, filter]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditDraft(productToDraft(p));
    setEditTouched({});
    setEditErrors({});
  };

  const onEditChange = (field: keyof ProductDraft, value: string) => {
    if (!editDraft) return;
    const next = { ...editDraft, [field]: value };
    setEditDraft(next);
    const otherSkus = products.filter((p) => p.id !== editProduct?.id).map((p) => p.sku);
    setEditErrors(validateDraft(next, otherSkus));
  };

  const requestUpdate = () => {
    if (!editDraft || !editProduct) return;
    const otherSkus = products.filter((p) => p.id !== editProduct.id).map((p) => p.sku);
    const errs = validateDraft(editDraft, otherSkus);
    setEditTouched({
      name: true,
      sku: true,
      category: true,
      price: true,
      cost: true,
      stock: true,
      reorderLevel: true,
      description: true,
    });
    setEditErrors(errs);
    if (Object.keys(errs).length) {
      pushToast({ type: 'error', title: 'Fix validation errors', message: 'Some fields need attention.' });
      return;
    }
    setUpdateConfirm(true);
  };

  const confirmUpdate = () => {
    if (!editDraft || !editProduct) return;
    updateProduct(editProduct.id, editDraft);
    setUpdateConfirm(false);
    setEditProduct(null);
    setEditDraft(null);
    pushToast({ type: 'success', title: 'Product updated', message: `${editDraft.name} saved.` });
  };

  const confirmDelete = () => {
    if (!deleteIds?.length) return;
    const count = deleteProducts(deleteIds);
    setDeleteIds(null);
    pushToast({
      type: 'success',
      title: count === 1 ? 'Product deleted' : `${count} products deleted`,
      message: 'Inventory list refreshed.',
    });
  };

  const applyBulkEdit = () => {
    if (!selectedIds.size) return;
    if (!bulkCategory && bulkStock === '') {
      pushToast({ type: 'warning', title: 'Nothing to update', message: 'Choose a category or stock value.' });
      return;
    }
    const patch: Partial<ProductDraft> = {};
    if (bulkCategory) patch.category = bulkCategory;
    if (bulkStock !== '') patch.stock = bulkStock;
    const count = updateProducts([...selectedIds], patch);
    setBulkEditOpen(false);
    setBulkCategory('');
    setBulkStock('');
    pushToast({ type: 'success', title: `Updated ${count} products`, message: 'Bulk changes applied.' });
  };

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Products</h1>
          <p>{products.length} items in catalog · select multiple to edit or delete</p>
        </div>
        <Link to="/add-products" className="btn btn--primary">
          <Plus size={16} />
          Add products
        </Link>
      </div>

      <div className="products-toolbar panel">
        <div className="products-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, SKU, category…"
          />
        </div>
        <div className="segmented">
          {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`segmented__btn${filter === f ? ' is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : statusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="products-table panel panel--solid">
        <div className="products-table__head">
          <button
            type="button"
            className={`checkbox${allVisibleSelected ? ' is-checked' : ''}`}
            onClick={() =>
              allVisibleSelected ? clearSelection() : selectAll(filtered.map((p) => p.id))
            }
            aria-label="Select all visible"
          >
            <Check size={12} strokeWidth={3} />
          </button>
          <span>Product</span>
          <span>Category</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Status</span>
          <span />
        </div>

        <div className="products-table__body">
          {filtered.length === 0 ? (
            <div className="products-empty">No products match your filters.</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className={`products-row${selectedIds.has(p.id) ? ' is-selected' : ''}`}>
                <button
                  type="button"
                  className={`checkbox${selectedIds.has(p.id) ? ' is-checked' : ''}`}
                  onClick={() => toggleSelect(p.id)}
                  aria-label={`Select ${p.name}`}
                >
                  <Check size={12} strokeWidth={3} />
                </button>
                <div className="products-row__product">
                  <strong>{p.name}</strong>
                  <span>{p.sku}</span>
                </div>
                <span>{p.category}</span>
                <span>{p.stock}</span>
                <span>{formatCurrency(p.price)}</span>
                <span className={statusBadge(p.status)}>{statusLabel(p.status)}</span>
                <div className="products-row__actions">
                  <button type="button" className="btn btn--icon btn--ghost btn--sm" onClick={() => openEdit(p)} aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn--icon btn--ghost btn--sm"
                    onClick={() => setDeleteIds([p.id])}
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button type="button" className="btn btn--icon btn--ghost btn--sm" aria-label="More">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 ? (
          <motion.div
            className="bulk-bar"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            <span>
              <strong>{selectedIds.size}</strong> selected
            </span>
            <button type="button" className="btn btn--soft btn--sm" onClick={() => setBulkEditOpen(true)}>
              <Pencil size={14} />
              Bulk edit
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => setDeleteIds([...selectedIds])}
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={clearSelection}>
              <X size={14} />
              Clear
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleteIds}
        variant="delete"
        title={deleteIds && deleteIds.length > 1 ? `Delete ${deleteIds.length} products?` : 'Delete product?'}
        message="This action cannot be undone. Selected items will be removed from inventory."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteIds(null)}
      />

      <ConfirmModal
        open={updateConfirm}
        variant="update"
        title="Save product changes?"
        message="Updated details will replace the current listing."
        confirmLabel="Update"
        cancelLabel="Cancel"
        onConfirm={confirmUpdate}
        onCancel={() => setUpdateConfirm(false)}
      />

      <AnimatePresence>
        {editProduct && editDraft ? (
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditProduct(null)}
          >
            <motion.aside
              className="edit-drawer panel panel--solid"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="edit-drawer__head">
                <div>
                  <h2>Edit product</h2>
                  <p>{editProduct.sku}</p>
                </div>
                <button type="button" className="btn btn--icon btn--ghost" onClick={() => setEditProduct(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="edit-drawer__form">
                <TextField
                  label="Product name"
                  value={editDraft.name}
                  touched={!!editTouched.name}
                  error={editErrors.name}
                  onChange={(e) => onEditChange('name', e.target.value)}
                  onBlur={() => setEditTouched((t) => ({ ...t, name: true }))}
                />
                <TextField
                  label="SKU"
                  value={editDraft.sku}
                  touched={!!editTouched.sku}
                  error={editErrors.sku}
                  onChange={(e) => onEditChange('sku', e.target.value.toUpperCase())}
                  onBlur={() => setEditTouched((t) => ({ ...t, sku: true }))}
                />
                <SelectField
                  label="Category"
                  value={editDraft.category}
                  touched={!!editTouched.category}
                  error={editErrors.category}
                  options={CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
                  onChange={(e) => onEditChange('category', e.target.value)}
                  onBlur={() => setEditTouched((t) => ({ ...t, category: true }))}
                />
                <div className="edit-drawer__row">
                  <TextField
                    label="Price"
                    type="number"
                    value={editDraft.price}
                    touched={!!editTouched.price}
                    error={editErrors.price}
                    onChange={(e) => onEditChange('price', e.target.value)}
                    onBlur={() => setEditTouched((t) => ({ ...t, price: true }))}
                  />
                  <TextField
                    label="Cost"
                    type="number"
                    value={editDraft.cost}
                    touched={!!editTouched.cost}
                    error={editErrors.cost}
                    onChange={(e) => onEditChange('cost', e.target.value)}
                    onBlur={() => setEditTouched((t) => ({ ...t, cost: true }))}
                  />
                </div>
                <div className="edit-drawer__row">
                  <TextField
                    label="Stock"
                    type="number"
                    value={editDraft.stock}
                    touched={!!editTouched.stock}
                    error={editErrors.stock}
                    onChange={(e) => onEditChange('stock', e.target.value)}
                    onBlur={() => setEditTouched((t) => ({ ...t, stock: true }))}
                  />
                  <TextField
                    label="Reorder level"
                    type="number"
                    value={editDraft.reorderLevel}
                    touched={!!editTouched.reorderLevel}
                    error={editErrors.reorderLevel}
                    onChange={(e) => onEditChange('reorderLevel', e.target.value)}
                    onBlur={() => setEditTouched((t) => ({ ...t, reorderLevel: true }))}
                  />
                </div>
                <TextAreaField
                  label="Description"
                  value={editDraft.description}
                  touched={!!editTouched.description}
                  error={editErrors.description}
                  onChange={(e) => onEditChange('description', e.target.value)}
                  onBlur={() => setEditTouched((t) => ({ ...t, description: true }))}
                />
              </div>
              <div className="edit-drawer__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setEditProduct(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn--primary" onClick={requestUpdate}>
                  Save changes
                </button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {bulkEditOpen ? (
          <motion.div
            className="confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBulkEditOpen(false)}
          >
            <motion.div
              className="confirm-modal confirm-modal--update"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-modal__icon">
                <Pencil size={22} />
              </div>
              <h2>Bulk edit {selectedIds.size} products</h2>
              <p>Apply the same category and/or stock quantity to every selected item.</p>
              <div className="bulk-edit-fields">
                <SelectField
                  label="Set category"
                  value={bulkCategory}
                  options={[
                    { value: '', label: 'No change' },
                    ...CATEGORIES.map((c) => ({ value: c.name, label: c.name })),
                  ]}
                  onChange={(e) => setBulkCategory(e.target.value)}
                />
                <TextField
                  label="Set stock qty"
                  type="number"
                  value={bulkStock}
                  hint="Leave blank to keep existing stock"
                  onChange={(e) => setBulkStock(e.target.value)}
                />
              </div>
              <div className="confirm-modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setBulkEditOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn--primary" onClick={applyBulkEdit}>
                  Apply updates
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
