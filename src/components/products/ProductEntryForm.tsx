import { Trash2 } from 'lucide-react';
import type { FieldErrors, ProductDraft } from '../../types';
import { CATEGORIES } from '../../data/seed';
import { TextAreaField, TextField, SelectField } from '../ui/Field';
import { validateField } from '../../utils/validation';
import './ProductEntryForm.css';

interface Props {
  draft: ProductDraft;
  index: number;
  errors: FieldErrors;
  touched: Record<string, boolean>;
  existingSkus: string[];
  siblingSkus: string[];
  onChange: (tempId: string, field: keyof ProductDraft, value: string) => void;
  onTouch: (tempId: string, field: string) => void;
  onRemove?: (tempId: string) => void;
  canRemove: boolean;
}

export function ProductEntryForm({
  draft,
  index,
  errors,
  touched,
  existingSkus,
  siblingSkus,
  onChange,
  onTouch,
  onRemove,
  canRemove,
}: Props) {
  const allSkus = [...existingSkus, ...siblingSkus.filter((s) => s.toLowerCase() !== draft.sku.trim().toLowerCase())];

  const set = (field: keyof ProductDraft, value: string) => onChange(draft.tempId, field, value);

  const blur = (field: keyof ProductDraft) => {
    onTouch(draft.tempId, field);
  };

  const liveError = (field: keyof ProductDraft) => {
    if (!touched[field]) return undefined;
    return validateField(field, draft[field], draft, allSkus) ?? errors[field];
  };

  return (
    <div className="product-entry panel panel--solid">
      <div className="product-entry__head">
        <div>
          <span className="badge badge--accent">Item {index + 1}</span>
          <h3>{draft.name.trim() || 'New product'}</h3>
        </div>
        {canRemove && onRemove ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onRemove(draft.tempId)}
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 size={15} />
            Remove
          </button>
        ) : null}
      </div>

      <div className="product-entry__grid">
        <TextField
          label="Product name"
          name={`${draft.tempId}-name`}
          value={draft.name}
          touched={!!touched.name}
          error={liveError('name')}
          hint="Use title case and the product type"
          counter={`${draft.name.length} / 70`}
          maxLength={70}
          onChange={(e) => set('name', e.target.value)}
          onBlur={() => blur('name')}
        />

        <TextField
          label="SKU"
          name={`${draft.tempId}-sku`}
          value={draft.sku}
          touched={!!touched.sku}
          error={liveError('sku')}
          hint="Letters, numbers, hyphens"
          prefix="SKU"
          onChange={(e) => set('sku', e.target.value.toUpperCase())}
          onBlur={() => blur('sku')}
        />

        <SelectField
          label="Category"
          name={`${draft.tempId}-category`}
          value={draft.category}
          touched={!!touched.category}
          error={liveError('category')}
          placeholder="Select category"
          options={CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
          onChange={(e) => set('category', e.target.value)}
          onBlur={() => blur('category')}
        />

        <TextField
          label="Price (USD)"
          name={`${draft.tempId}-price`}
          type="number"
          min={0}
          step="0.01"
          value={draft.price}
          touched={!!touched.price}
          error={liveError('price')}
          onChange={(e) => set('price', e.target.value)}
          onBlur={() => blur('price')}
        />

        <TextField
          label="Cost (USD)"
          name={`${draft.tempId}-cost`}
          type="number"
          min={0}
          step="0.01"
          value={draft.cost}
          touched={!!touched.cost}
          error={liveError('cost')}
          onChange={(e) => set('cost', e.target.value)}
          onBlur={() => blur('cost')}
        />

        <TextField
          label="Stock qty"
          name={`${draft.tempId}-stock`}
          type="number"
          min={0}
          step={1}
          value={draft.stock}
          touched={!!touched.stock}
          error={liveError('stock')}
          onChange={(e) => set('stock', e.target.value)}
          onBlur={() => blur('stock')}
        />

        <TextField
          label="Reorder level"
          name={`${draft.tempId}-reorder`}
          type="number"
          min={0}
          step={1}
          value={draft.reorderLevel}
          touched={!!touched.reorderLevel}
          error={liveError('reorderLevel')}
          onChange={(e) => set('reorderLevel', e.target.value)}
          onBlur={() => blur('reorderLevel')}
        />

        <div className="product-entry__desc">
          <TextAreaField
            label="Description"
            name={`${draft.tempId}-desc`}
            value={draft.description}
            touched={!!touched.description}
            error={liveError('description')}
            hint="Materials, fit and care. 20+ characters help shoppers and search."
            counter={`${draft.description.length} chars`}
            onChange={(e) => set('description', e.target.value)}
            onBlur={() => blur('description')}
          />
        </div>
      </div>
    </div>
  );
}
