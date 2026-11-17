import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Plus, Send } from 'lucide-react';
import { createEmptyDraft } from '../data/seed';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { ProductEntryForm } from '../components/products/ProductEntryForm';
import { ProductPreview } from '../components/products/ProductPreview';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { isDraftValid, validateDraft } from '../utils/validation';
import type { FieldErrors, ProductDraft } from '../types';
import './AddProducts.css';

type Step = 'edit' | 'preview';

export function AddProducts() {
  const { products, addProducts } = useInventory();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<ProductDraft[]>([createEmptyDraft(0)]);
  const [touchedMap, setTouchedMap] = useState<Record<string, Record<string, boolean>>>({});
  const [errorsMap, setErrorsMap] = useState<Record<string, FieldErrors>>({});
  const [step, setStep] = useState<Step>('edit');
  const [discardOpen, setDiscardOpen] = useState(false);

  const existingSkus = useMemo(() => products.map((p) => p.sku), [products]);

  const siblingSkusFor = (tempId: string) =>
    drafts.filter((d) => d.tempId !== tempId).map((d) => d.sku).filter(Boolean);

  const updateDraft = (tempId: string, field: keyof ProductDraft, value: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d)),
    );
    setErrorsMap((prev) => {
      const draft = drafts.find((d) => d.tempId === tempId);
      if (!draft) return prev;
      const nextDraft = { ...draft, [field]: value };
      const errs = validateDraft(nextDraft, existingSkus, siblingSkusFor(tempId));
      return { ...prev, [tempId]: errs };
    });
  };

  const touchField = (tempId: string, field: string) => {
    setTouchedMap((prev) => ({
      ...prev,
      [tempId]: { ...prev[tempId], [field]: true },
    }));
    const draft = drafts.find((d) => d.tempId === tempId);
    if (draft) {
      setErrorsMap((prev) => ({
        ...prev,
        [tempId]: validateDraft(draft, existingSkus, siblingSkusFor(tempId)),
      }));
    }
  };

  const addAnother = () => {
    const next = createEmptyDraft(drafts.length);
    setDrafts((prev) => [...prev, next]);
    pushToast({ type: 'info', title: 'Item slot added', message: 'Fill in the new product details.' });
  };

  const removeDraft = (tempId: string) => {
    if (drafts.length <= 1) return;
    setDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
    setTouchedMap((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });
    setErrorsMap((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });
    pushToast({ type: 'warning', title: 'Item removed', message: 'That draft was discarded.' });
  };

  const validateAll = () => {
    const nextErrors: Record<string, FieldErrors> = {};
    const nextTouched: Record<string, Record<string, boolean>> = {};
    let ok = true;

    const skuCounts = new Map<string, number>();
    drafts.forEach((d) => {
      const sku = d.sku.trim().toLowerCase();
      if (sku) skuCounts.set(sku, (skuCounts.get(sku) ?? 0) + 1);
    });

    drafts.forEach((d) => {
      const siblings = drafts
        .filter((x) => x.tempId !== d.tempId)
        .map((x) => x.sku)
        .filter(Boolean);
      const errs = validateDraft(d, existingSkus, siblings);
      const skuKey = d.sku.trim().toLowerCase();
      if (skuKey && (skuCounts.get(skuKey) ?? 0) > 1) {
        errs.sku = 'Duplicate SKU in this batch';
      }
      nextErrors[d.tempId] = errs;
      nextTouched[d.tempId] = {
        name: true,
        sku: true,
        category: true,
        price: true,
        cost: true,
        stock: true,
        reorderLevel: true,
        description: true,
      };
      if (Object.keys(errs).length) ok = false;
    });

    setErrorsMap(nextErrors);
    setTouchedMap(nextTouched);
    return ok;
  };

  const goPreview = () => {
    if (!validateAll()) {
      pushToast({
        type: 'error',
        title: 'Validation failed',
        message: 'Fix highlighted fields before previewing.',
      });
      return;
    }
    setStep('preview');
    pushToast({ type: 'success', title: 'Ready to review', message: 'Check the summary before submitting.' });
  };

  const submitAll = () => {
    if (!validateAll()) {
      setStep('edit');
      pushToast({ type: 'error', title: 'Cannot submit', message: 'Some entries are invalid.' });
      return;
    }
    const created = addProducts(drafts);
    pushToast({
      type: 'success',
      title: `${created.length} product${created.length === 1 ? '' : 's'} published`,
      message: 'Inventory updated successfully.',
    });
    navigate('/products');
  };

  const readiness = useMemo(() => {
    if (!drafts.length) return 0;
    const validCount = drafts.filter((d) =>
      isDraftValid(
        d,
        existingSkus,
        drafts.filter((x) => x.tempId !== d.tempId).map((x) => x.sku).filter(Boolean),
      ),
    ).length;
    return Math.round((validCount / drafts.length) * 100);
  }, [drafts, existingSkus]);

  return (
    <div className="add-page">
      <div className="add-page__header">
        <div>
          <h1>{step === 'edit' ? 'Add products' : 'Preview & submit'}</h1>
          <p>
            {step === 'edit'
              ? 'Create one or many listings. Live validation runs as you type.'
              : 'Confirm every entry before publishing to inventory.'}
          </p>
        </div>
        <div className="add-page__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setDiscardOpen(true)}>
            Discard
          </button>
          {step === 'preview' ? (
            <button type="button" className="btn btn--ghost" onClick={() => setStep('edit')}>
              <ArrowLeft size={16} />
              Back to edit
            </button>
          ) : null}
          {step === 'edit' ? (
            <button type="button" className="btn btn--primary" onClick={goPreview}>
              <Check size={16} />
              Preview all
            </button>
          ) : (
            <button type="button" className="btn btn--accent" onClick={submitAll}>
              <Send size={16} />
              Submit {drafts.length} product{drafts.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      </div>

      <div className="add-page__layout">
        <div className="add-page__main">
          <AnimatePresence mode="wait">
            {step === 'edit' ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="add-page__stack"
              >
                {drafts.map((draft, index) => (
                  <ProductEntryForm
                    key={draft.tempId}
                    draft={draft}
                    index={index}
                    errors={errorsMap[draft.tempId] ?? {}}
                    touched={touchedMap[draft.tempId] ?? {}}
                    existingSkus={existingSkus}
                    siblingSkus={siblingSkusFor(draft.tempId)}
                    onChange={updateDraft}
                    onTouch={touchField}
                    onRemove={removeDraft}
                    canRemove={drafts.length > 1}
                  />
                ))}

                <button type="button" className="add-more" onClick={addAnother}>
                  <span className="add-more__icon">
                    <Plus size={20} />
                  </span>
                  <div>
                    <strong>Add another product</strong>
                    <span>Batch create multiple items before submission</span>
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <ProductPreview drafts={drafts} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="add-page__side panel panel--solid">
          <ProgressRing value={readiness} size={96} stroke={7} label="Readiness" />
          <ul className="readiness-list">
            <li className={drafts.every((d) => d.name.trim().length >= 3) ? 'is-done' : ''}>
              <span /> Names filled
            </li>
            <li className={drafts.every((d) => d.sku.trim().length >= 4) ? 'is-done' : ''}>
              <span /> SKUs assigned
            </li>
            <li className={drafts.every((d) => d.category) ? 'is-done' : ''}>
              <span /> Categories set
            </li>
            <li className={drafts.every((d) => Number(d.price) > 0) ? 'is-done' : ''}>
              <span /> Pricing ready
            </li>
            <li className={drafts.every((d) => d.description.trim().length >= 20) ? 'is-done' : ''}>
              <span /> Descriptions
            </li>
          </ul>
          <p className="readiness-note">
            {readiness === 100
              ? 'All set — preview and submit when ready.'
              : `Needs work · ${100 - readiness}% remaining across the batch.`}
          </p>
        </aside>
      </div>

      <ConfirmModal
        open={discardOpen}
        variant="delete"
        title="Discard drafts?"
        message="Unsaved product entries will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setDiscardOpen(false);
          navigate('/products');
          pushToast({ type: 'info', title: 'Drafts discarded' });
        }}
        onCancel={() => setDiscardOpen(false)}
      />
    </div>
  );
}
