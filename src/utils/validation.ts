import type { FieldErrors, ProductDraft } from '../types';

const SKU_RE = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/i;
const NAME_MAX = 70;
const DESC_MIN = 20;

export function validateField(
  field: keyof ProductDraft,
  value: string,
  draft?: ProductDraft,
  existingSkus: string[] = [],
): string | undefined {
  const v = value.trim();

  switch (field) {
    case 'name':
      if (!v) return 'Product name is required';
      if (v.length < 3) return 'Name must be at least 3 characters';
      if (v.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer`;
      return undefined;
    case 'sku': {
      if (!v) return 'SKU is required';
      if (v.length < 4) return 'SKU must be at least 4 characters';
      if (!SKU_RE.test(v)) return 'Use letters, numbers, and hyphens only';
      const clash = existingSkus.find(
        (s) => s.toLowerCase() === v.toLowerCase() && (!draft || true),
      );
      if (clash) return 'This SKU already exists';
      return undefined;
    }
    case 'category':
      if (!v) return 'Select a category';
      return undefined;
    case 'price': {
      if (!v) return 'Price is required';
      const n = Number(v);
      if (Number.isNaN(n) || n <= 0) return 'Enter a valid price greater than 0';
      if (n > 999999) return 'Price is too high';
      return undefined;
    }
    case 'cost': {
      if (!v) return 'Cost is required';
      const n = Number(v);
      if (Number.isNaN(n) || n < 0) return 'Enter a valid cost';
      if (draft?.price && Number(draft.price) > 0 && n > Number(draft.price)) {
        return 'Cost should not exceed price';
      }
      return undefined;
    }
    case 'stock': {
      if (v === '') return 'Stock quantity is required';
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0) return 'Enter a whole number ≥ 0';
      return undefined;
    }
    case 'reorderLevel': {
      if (v === '') return 'Reorder level is required';
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0) return 'Enter a whole number ≥ 0';
      return undefined;
    }
    case 'description':
      if (!v) return 'Description is required';
      if (v.length < DESC_MIN) return `Add at least ${DESC_MIN} characters (${v.length}/${DESC_MIN})`;
      return undefined;
    default:
      return undefined;
  }
}

export function validateDraft(
  draft: ProductDraft,
  existingSkus: string[] = [],
  siblingSkus: string[] = [],
): FieldErrors {
  const errors: FieldErrors = {};
  const fields: (keyof ProductDraft)[] = [
    'name',
    'sku',
    'category',
    'price',
    'cost',
    'stock',
    'reorderLevel',
    'description',
  ];

  const allSkus = [...existingSkus, ...siblingSkus.filter((s) => s !== draft.sku)];

  for (const field of fields) {
    const err = validateField(field, draft[field], draft, allSkus);
    if (err) errors[field] = err;
  }

  return errors;
}

export function isDraftValid(draft: ProductDraft, existingSkus: string[] = [], siblingSkus: string[] = []) {
  return Object.keys(validateDraft(draft, existingSkus, siblingSkus)).length === 0;
}

export function validateLogin(username: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!username.trim()) errors.username = 'Username is required';
  else if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function formatCompact(n: number) {
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  }
  return formatCurrency(n);
}

export function statusLabel(status: string) {
  switch (status) {
    case 'in-stock':
      return 'In stock';
    case 'low-stock':
      return 'Low stock';
    case 'out-of-stock':
      return 'Out of stock';
    default:
      return status;
  }
}
