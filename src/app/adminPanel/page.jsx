"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import './admin.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AUTH_DISABLED } from '@/lib/adminAuth';

/* ------------------------------------------------------------------ */
/* Constante                                                           */
/* ------------------------------------------------------------------ */

const CAT_TYPES = [
  { key: 'mancare', label: 'Mâncare', dbValue: 'Mancare' },
  { key: 'bar', label: 'Bar', dbValue: 'Bar' },
  { key: 'vinuri', label: 'Vinuri', dbValue: 'Vinuri' },
];

const NUTRITION_FIELDS = [
  { key: 'Energie', label: 'Energie', unit: 'kcal' },
  { key: 'Grasimi', label: 'Grăsimi', unit: 'g' },
  { key: 'Acizi grasi saturati', label: 'din care saturate', unit: 'g' },
  { key: 'Glucide', label: 'Glucide', unit: 'g' },
  { key: 'Zaharuri', label: 'din care zaharuri', unit: 'g' },
  { key: 'Fibre', label: 'Fibre', unit: 'g' },
  { key: 'Proteine', label: 'Proteine', unit: 'g' },
  { key: 'Sare', label: 'Sare', unit: 'g' },
];

const STANDARD_ALLERGENS = [
  'Gluten', 'Lapte', 'Oua', 'Peste', 'Crustacee', 'Moluste', 'Soia',
  'Alune', 'Fructe cu coaja', 'Telina', 'Mustar', 'Susan', 'Dioxid de sulf', 'Lupin',
];

const SESSION_KEY = 'zavat-admin-pass';

/* ------------------------------------------------------------------ */
/* Utilitare                                                           */
/* ------------------------------------------------------------------ */

const catTypeKey = (cat) => (cat?.tip ? cat.tip.toLowerCase().trim() : 'mancare');
const clean = (v) => (typeof v === 'string' ? v.trim() : v);
const isMancare = (cat) => catTypeKey(cat) === 'mancare';

function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'imagine';
}

function fileExt(file) {
  const m = /\.([a-z0-9]+)$/i.exec(file?.name || '');
  return m ? `.${m[1].toLowerCase()}` : '.jpg';
}

function uniqueFileName(base, ext, taken) {
  let name = `${base}${ext}`;
  let i = 2;
  while (taken.has(name.toLowerCase())) {
    name = `${base}_${i}${ext}`;
    i++;
  }
  return name;
}

function parseNutrition(str) {
  const values = {};
  if (!str || !str.trim()) return { structured: true, values };
  const parts = str.split(',');
  for (const part of parts) {
    const m = /^\s*([^:]+?)\s*:\s*([\d.]*)\s*([a-zA-Z]*)\s*$/.exec(part);
    if (!m) return { structured: false, values: {} };
    const field = NUTRITION_FIELDS.find(f => f.key.toLowerCase() === m[1].toLowerCase());
    if (!field) return { structured: false, values: {} };
    values[field.key] = m[2];
  }
  return { structured: true, values };
}

function serializeNutrition(values) {
  const filled = NUTRITION_FIELDS.filter(f => values[f.key] !== undefined && String(values[f.key]).trim() !== '');
  if (filled.length === 0) return '';
  return filled.map(f => `${f.key}: ${String(values[f.key]).trim()}${f.unit}`).join(', ');
}

function splitAllergens(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean);
}

function formatPrice(p) {
  if (p === null || p === undefined || p === '') return '—';
  const n = Number(p);
  return Number.isFinite(n) ? `${n % 1 === 0 ? n : n.toFixed(2)} lei` : String(p);
}

function safeSession(action, value) {
  try {
    if (action === 'get') return sessionStorage.getItem(SESSION_KEY);
    if (action === 'set') sessionStorage.setItem(SESSION_KEY, value);
    if (action === 'clear') sessionStorage.removeItem(SESSION_KEY);
  } catch { /* storage indisponibil */ }
  return null;
}

/* ------------------------------------------------------------------ */
/* Iconițe                                                             */
/* ------------------------------------------------------------------ */

const Icon = ({ name, size = 18 }) => {
  const paths = {
    grip: <><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    check: <path d="m5 12 5 5 9-10" />,
    alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
    logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l5-5-5-5M15 12H4" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4" /></>,
    leaf: <><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19 13 11" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'grip' ? 'currentColor' : 'none'}
      stroke={name === 'grip' ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Componente mici                                                     */
/* ------------------------------------------------------------------ */

function Thumb({ folder, file, version, size = 44, preview }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const fileName = clean(file);
  const src = preview || (fileName ? `/photos/${folder}/${encodeURIComponent(fileName)}?v=${version || 0}` : null);
  return (
    <div className="za-thumb" style={{ width: size, height: size }}>
      {src && failedSrc !== src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt="" onError={() => setFailedSrc(src)} />
        : <span className="za-thumb-empty"><Icon name="image" size={Math.round(size * 0.42)} /></span>}
    </div>
  );
}

function Toasts({ toasts }) {
  return (
    <div className="za-toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`za-toast za-toast-${t.kind}`}>
          <Icon name={t.kind === 'error' ? 'alert' : 'check'} size={16} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ dialog, onClose }) {
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, onClose]);
  if (!dialog) return null;
  return (
    <div className="za-modal-backdrop" onClick={() => onClose(false)}>
      <div className="za-modal" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="za-modal-icon"><Icon name="trash" size={22} /></div>
        <h3>{dialog.title}</h3>
        <p>{dialog.message}</p>
        <div className="za-modal-actions">
          <button className="za-btn za-btn-ghost" onClick={() => onClose(false)}>Anulează</button>
          <button className="za-btn za-btn-danger" autoFocus onClick={() => onClose(true)}>{dialog.confirmLabel || 'Șterge'}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children, wide }) {
  return (
    <label className={`za-field ${wide ? 'za-field-wide' : ''}`}>
      <span className="za-field-label">{label}{hint && <em>{hint}</em>}</span>
      {children}
    </label>
  );
}

function ImagePicker({ folder, fileName, version, preview, onPick }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const take = (file) => {
    if (file && file.type.startsWith('image/')) onPick(file);
  };

  return (
    <div
      className={`za-imagepicker ${over ? 'is-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
    >
      <Thumb folder={folder} file={fileName} version={version} preview={preview} size={112} />
      <div className="za-imagepicker-text">
        <strong><Icon name="upload" size={16} /> {preview ? 'Poză nouă selectată' : 'Schimbă poza'}</strong>
        <span>Trage o imagine aici sau dă click. Se salvează odată cu restul.</span>
        {fileName && <code>{clean(fileName)}</code>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { take(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
}

function AllergenPicker({ value, onChange, knownExtra }) {
  const selected = splitAllergens(value);
  const has = (a) => selected.some(s => s.toLowerCase() === a.toLowerCase());
  const options = [...STANDARD_ALLERGENS];
  [...knownExtra, ...selected].forEach(a => {
    if (!options.some(o => o.toLowerCase() === a.toLowerCase())) options.push(a);
  });
  const [custom, setCustom] = useState('');

  const toggle = (a) => {
    const next = has(a) ? selected.filter(s => s.toLowerCase() !== a.toLowerCase()) : [...selected, a];
    onChange(next.join(', '));
  };
  const addCustom = () => {
    const v = custom.trim();
    if (v && !has(v)) onChange([...selected, v].join(', '));
    setCustom('');
  };

  return (
    <div className="za-chips-wrap">
      <div className="za-chips">
        {options.map(a => (
          <button type="button" key={a} className={`za-chip ${has(a) ? 'is-on' : ''}`} onClick={() => toggle(a)}>
            {has(a) && <Icon name="check" size={13} />}{a}
          </button>
        ))}
      </div>
      <div className="za-inline-add">
        <input className="za-input za-input-sm" placeholder="Alt alergen…" value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} />
        <button type="button" className="za-btn za-btn-ghost za-btn-sm" onClick={addCustom} disabled={!custom.trim()}>Adaugă</button>
      </div>
    </div>
  );
}

function NutritionEditor({ value, onChange }) {
  const parsed = useMemo(() => parseNutrition(value), [value]);
  const [raw, setRaw] = useState(!parsed.structured);

  if (raw) {
    return (
      <div>
        <textarea className="za-input za-textarea" rows={3} value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Energie: 100kcal, Grasimi: 1g, …" />
        {parseNutrition(value).structured && (
          <button type="button" className="za-link" onClick={() => setRaw(false)}>Editează pe câmpuri</button>
        )}
      </div>
    );
  }

  const setField = (key, v) => {
    const cleaned = v.replace(',', '.').replace(/[^\d.]/g, '');
    onChange(serializeNutrition({ ...parsed.values, [key]: cleaned }));
  };

  return (
    <div>
      <div className="za-nutrition">
        {NUTRITION_FIELDS.map(f => (
          <div key={f.key} className={`za-nutri ${f.label.startsWith('din') ? 'is-sub' : ''}`}>
            <span>{f.label}</span>
            <div className="za-nutri-input">
              <input inputMode="decimal" value={parsed.values[f.key] ?? ''} placeholder="0"
                onChange={e => setField(f.key, e.target.value)} />
              <em>{f.unit}</em>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="za-link" onClick={() => setRaw(true)}>Editează ca text</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rânduri sortabile                                                   */
/* ------------------------------------------------------------------ */

function useSortableRow(id, disabled) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return {
    setNodeRef,
    handleProps: { ...attributes, ...listeners },
    style: { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 5 : undefined },
    isDragging,
  };
}

function CategoryRow({ cat, count, active, version, onSelect, onEdit }) {
  const { setNodeRef, handleProps, style, isDragging } = useSortableRow(cat.id);
  return (
    <div ref={setNodeRef} style={style} className={`za-cat ${active ? 'is-active' : ''} ${isDragging ? 'is-dragging' : ''}`}>
      <button className="za-grip" {...handleProps} title="Trage pentru a reordona" aria-label="Reordonează">
        <Icon name="grip" size={14} />
      </button>
      <button className="za-cat-main" onClick={onSelect}>
        <Thumb folder="categorii" file={cat.imagine_url} version={version} size={34} />
        <span className="za-cat-name">{clean(cat.nume)}</span>
        <span className="za-count">{count}</span>
      </button>
      <button className="za-icon-btn za-cat-edit" onClick={onEdit} title="Editează categoria" aria-label="Editează categoria">
        <Icon name="edit" size={15} />
      </button>
    </div>
  );
}

function ProductRow({ prod, unit, version, categoryName, dragDisabled, onOpen }) {
  const { setNodeRef, handleProps, style, isDragging } = useSortableRow(prod.id, dragDisabled);
  const allergens = splitAllergens(prod.alergeni);
  const hasNutrition = !!(prod.declaratie_nutritionala && prod.declaratie_nutritionala.trim());
  return (
    <div ref={setNodeRef} style={style} className={`za-prod ${isDragging ? 'is-dragging' : ''}`}>
      {!dragDisabled
        ? <button className="za-grip" {...handleProps} title="Trage pentru a reordona" aria-label="Reordonează"><Icon name="grip" size={14} /></button>
        : <span className="za-grip-spacer" />}
      <button className="za-prod-main" onClick={onOpen}>
        <Thumb folder="produse" file={prod.imagine_url} version={version} size={52} />
        <div className="za-prod-info">
          <div className="za-prod-title">
            <strong>{clean(prod.nume) || 'Fără nume'}</strong>
            {categoryName && <span className="za-tag">{categoryName}</span>}
          </div>
          <span className="za-prod-sub">{clean(prod.ingrediente) || <i>Fără ingrediente</i>}</span>
          <div className="za-prod-meta">
            {prod.gramaj > 0 && <span className="za-meta">{prod.gramaj} {unit}</span>}
            {allergens.slice(0, 3).map(a => <span key={a} className="za-meta za-meta-warn">{a}</span>)}
            {allergens.length > 3 && <span className="za-meta za-meta-warn">+{allergens.length - 3}</span>}
            {unit === 'g' && (
              <span className={`za-meta ${hasNutrition ? 'za-meta-ok' : 'za-meta-missing'}`}>
                <Icon name="leaf" size={12} /> {hasNutrition ? 'Nutrițional' : 'Lipsă nutrițional'}
              </span>
            )}
          </div>
        </div>
        <span className="za-price">{formatPrice(prod.pret)}</span>
        <span className="za-chevron"><Icon name="chevron" size={16} /></span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panou de editare (drawer)                                           */
/* ------------------------------------------------------------------ */

function EditorDrawer({ editor, categories, products, versions, knownAllergens, onClose, onSubmit, onDelete }) {
  const isProduct = editor.table === 'produse';
  const isNew = !editor.item.id;
  const [draft, setDraft] = useState(editor.item);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const firstInput = useRef(null);

  const dirty = !!file || JSON.stringify(draft) !== JSON.stringify(editor.item);
  const category = isProduct ? categories.find(c => c.id === draft.categorie_id) : draft;
  const unit = isProduct && !isMancare(category) ? 'ml' : 'g';

  useEffect(() => { firstInput.current?.focus(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const set = (field, value) => setDraft(d => ({ ...d, [field]: value }));

  const pickFile = (f) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const requestClose = useCallback(() => {
    if (dirty && !window.confirm('Ai modificări nesalvate. Închizi fără să salvezi?')) return;
    onClose();
  }, [dirty, onClose]);

  const submit = useCallback(async () => {
    if (saving) return;
    if (!clean(draft.nume)) { firstInput.current?.focus(); return; }
    setSaving(true);
    const ok = await onSubmit(editor.table, draft, file);
    setSaving(false);
    if (ok) onClose();
  }, [saving, draft, file, editor.table, onSubmit, onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); submit(); }
      if (e.key === 'Escape' && !document.querySelector('.za-modal')) requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submit, requestClose]);

  const title = isNew
    ? (isProduct ? 'Produs nou' : 'Categorie nouă')
    : (isProduct ? 'Editează produsul' : 'Editează categoria');

  return (
    <div className="za-drawer-backdrop" onMouseDown={requestClose}>
      <aside className="za-drawer" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <header className="za-drawer-head">
          <div>
            <span className="za-eyebrow">{isProduct ? clean(category?.nume) : CAT_TYPES.find(t => t.key === catTypeKey(draft))?.label}</span>
            <h2>{title}</h2>
          </div>
          <button className="za-icon-btn" onClick={requestClose} aria-label="Închide"><Icon name="close" /></button>
        </header>

        <form className="za-drawer-body" onSubmit={e => { e.preventDefault(); submit(); }}>
          <ImagePicker
            folder={isProduct ? 'produse' : 'categorii'}
            fileName={draft.imagine_url}
            version={versions[editor.table + ':' + clean(draft.imagine_url)]}
            preview={preview}
            onPick={pickFile}
          />

          <div className="za-grid">
            <Field label={isProduct ? 'Nume produs' : 'Nume categorie'} wide>
              <input ref={firstInput} className="za-input za-input-lg" value={draft.nume || ''}
                onChange={e => set('nume', e.target.value)} placeholder={isProduct ? 'ex: Calamar la grătar' : 'ex: Paste'} required />
            </Field>

            {isProduct ? (
              <>
                <Field label="Preț">
                  <div className="za-affix">
                    <input className="za-input" inputMode="decimal" value={draft.pret ?? ''}
                      onChange={e => set('pret', e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))} placeholder="0" />
                    <span>lei</span>
                  </div>
                </Field>
                <Field label={unit === 'g' ? 'Gramaj' : 'Cantitate'}>
                  <div className="za-affix">
                    <input className="za-input" inputMode="numeric" value={draft.gramaj ?? ''}
                      onChange={e => set('gramaj', e.target.value.replace(/[^\d]/g, ''))} placeholder="0" />
                    <span>{unit}</span>
                  </div>
                </Field>
                <Field label="Categorie" wide>
                  <select className="za-input" value={draft.categorie_id || ''} onChange={e => set('categorie_id', parseInt(e.target.value))}>
                    {CAT_TYPES.map(t => (
                      <optgroup key={t.key} label={t.label}>
                        {categories.filter(c => catTypeKey(c) === t.key).map(c => (
                          <option key={c.id} value={c.id}>{clean(c.nume)}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                <Field label="Ingrediente" wide>
                  <textarea className="za-input za-textarea" rows={3} value={draft.ingrediente || ''}
                    onChange={e => set('ingrediente', e.target.value)} placeholder="ex: calamar, lămâie, ulei de măsline" />
                </Field>
                <Field label="Alergeni" hint="click pentru a bifa" wide>
                  <AllergenPicker value={draft.alergeni} onChange={v => set('alergeni', v)} knownExtra={knownAllergens} />
                </Field>
                <Field label="Declarație nutrițională" hint="la 100 g" wide>
                  <NutritionEditor value={draft.declaratie_nutritionala} onChange={v => set('declaratie_nutritionala', v)} />
                </Field>
              </>
            ) : (
              <Field label="Secțiune" wide>
                <div className="za-segment">
                  {CAT_TYPES.map(t => (
                    <button type="button" key={t.key} className={catTypeKey(draft) === t.key ? 'is-on' : ''}
                      onClick={() => set('tip', t.dbValue)}>{t.label}</button>
                  ))}
                </div>
              </Field>
            )}

            <details className="za-advanced za-field-wide">
              <summary>Avansat</summary>
              <Field label="Nume fișier poză" hint="se generează automat dacă e gol" wide>
                <input className="za-input" value={draft.imagine_url || ''} onChange={e => set('imagine_url', e.target.value)}
                  placeholder="ex: calamar.jpg" />
              </Field>
            </details>
          </div>
          <button type="submit" hidden />
        </form>

        <footer className="za-drawer-foot">
          {!isNew && (
            <button className="za-btn za-btn-danger-ghost" onClick={() => onDelete(editor.table, draft)}>
              <Icon name="trash" size={16} /> Șterge
            </button>
          )}
          <div className="za-spacer" />
          <span className="za-kbd-hint"><kbd>⌘</kbd><kbd>S</kbd></span>
          <button className="za-btn za-btn-ghost" onClick={requestClose}>Anulează</button>
          <button className="za-btn za-btn-primary" onClick={submit} disabled={saving || !clean(draft.nume) || (!dirty && !isNew)}>
            {saving ? <span className="za-spinner" /> : <Icon name="check" size={16} />}
            {isNew ? 'Creează' : 'Salvează'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina principală                                                   */
/* ------------------------------------------------------------------ */

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeCatType, setActiveCatType] = useState('mancare');
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [versions, setVersions] = useState({});
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const searchRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ---------- notificări & confirmări ---------- */

  const toast = useCallback((message, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const confirmAsk = (opts) => new Promise(resolve => setDialog({ ...opts, resolve }));
  const closeDialog = useCallback((result) => {
    setDialog(d => { d?.resolve(result); return null; });
  }, []);

  /* ---------- date ---------- */

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meniu');
      const data = await res.json();
      const sCats = (data.categorii || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
      const sProds = (data.produse || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
      setCategories(sCats);
      setProducts(sProds);
    } catch {
      toast('Nu am putut încărca meniul. Verifică conexiunea la baza de date.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const tryLogin = useCallback((pass, silent) => {
    if (pass && pass === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setPassword(pass);
      setIsAuthenticated(true);
      safeSession('set', pass);
      fetchData();
      return true;
    }
    if (!silent) setLoginError(true);
    return false;
  }, [fetchData]);

  useEffect(() => {
    const saved = AUTH_DISABLED ? process.env.NEXT_PUBLIC_ADMIN_PASSWORD : safeSession('get');
    if (saved) tryLogin(saved, true);
  }, [tryLogin]);

  const logout = () => {
    safeSession('clear');
    setIsAuthenticated(false);
    setPassword('');
  };

  /* ---------- derivări ---------- */

  const filteredCategories = useMemo(
    () => categories.filter(c => catTypeKey(c) === activeCatType),
    [categories, activeCatType]
  );

  const countByCat = useMemo(() => {
    const m = {};
    products.forEach(p => { m[p.categorie_id] = (m[p.categorie_id] || 0) + 1; });
    return m;
  }, [products]);

  const knownAllergens = useMemo(() => {
    const set = new Map();
    products.forEach(p => splitAllergens(p.alergeni).forEach(a => {
      if (!set.has(a.toLowerCase())) set.set(a.toLowerCase(), a);
    }));
    return [...set.values()].filter(a => !STANDARD_ALLERGENS.some(s => s.toLowerCase() === a.toLowerCase()));
  }, [products]);

  useEffect(() => {
    if (!filteredCategories.length) { setSelectedCatId(null); return; }
    if (!filteredCategories.some(c => c.id === selectedCatId)) setSelectedCatId(filteredCategories[0].id);
  }, [filteredCategories, selectedCatId]);

  const selectedCat = categories.find(c => c.id === selectedCatId);
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const visibleProducts = useMemo(() => {
    if (searching) {
      return products.filter(p =>
        (p.nume || '').toLowerCase().includes(q) || (p.ingrediente || '').toLowerCase().includes(q));
    }
    return selectedCatId ? products.filter(p => p.categorie_id === selectedCatId) : [];
  }, [products, selectedCatId, searching, q]);

  /* ---------- scurtături ---------- */

  useEffect(() => {
    if (!isAuthenticated) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthenticated]);

  /* ---------- API ---------- */

  const handleUploadImage = async (file, dbFileName, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileName', dbFileName);
    formData.append('password', password);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    if (res.ok) setVersions(v => ({ ...v, [folder + ':' + dbFileName]: Date.now() }));
    return res.ok;
  };

  const prepareData = (table, draft, file) => {
    const data = {};
    Object.entries(draft).forEach(([k, v]) => { data[k] = clean(v); });
    if (table === 'produse') {
      data.pret = data.pret === '' || data.pret === null || data.pret === undefined ? null : Number(data.pret);
      data.gramaj = data.gramaj === '' || data.gramaj === null || data.gramaj === undefined ? null : Number(data.gramaj);
    }
    if (file && !data.imagine_url) {
      const list = table === 'produse' ? products : categories;
      const taken = new Set(list.filter(x => x.id !== data.id).map(x => clean(x.imagine_url || '').toLowerCase()));
      data.imagine_url = uniqueFileName(slugify(data.nume), fileExt(file), taken);
    }
    return data;
  };

  const handleSubmit = async (table, draft, file) => {
    const isNew = !draft.id;
    const data = prepareData(table, draft, file);

    try {
      let res;
      if (isNew) {
        const payload = { ...data };
        delete payload.id;
        if (table === 'produse') {
          const siblings = products.filter(p => p.categorie_id === payload.categorie_id);
          payload.ordine = siblings.reduce((m, p) => Math.max(m, p.ordine || 0), 0) + 1;
        } else {
          const siblings = categories.filter(c => catTypeKey(c) === catTypeKey(payload));
          payload.ordine = siblings.reduce((m, c) => Math.max(m, c.ordine || 0), 0) + 1;
        }
        res = await fetch('/api/admin/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, data: payload, password }),
        });
      } else {
        res = await fetch('/api/admin/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, id: data.id, data, password }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast(err.error || 'Eroare la salvare.', 'error');
        return false;
      }

      if (file && data.imagine_url) {
        const up = await handleUploadImage(file, data.imagine_url, table);
        if (!up) toast('Datele s-au salvat, dar poza nu s-a putut încărca.', 'error');
      }

      if (isNew) {
        await fetchData();
      } else if (table === 'produse') {
        setProducts(list => list.map(p => (p.id === data.id ? { ...p, ...data } : p)));
      } else {
        setCategories(list => list.map(c => (c.id === data.id ? { ...c, ...data } : c)));
        if (catTypeKey(data) !== activeCatType) setActiveCatType(catTypeKey(data));
      }

      toast(isNew ? `„${data.nume}” a fost adăugat.` : 'Modificările au fost salvate.');
      return true;
    } catch {
      toast('Eroare de rețea. Încearcă din nou.', 'error');
      return false;
    }
  };

  const handleDelete = async (table, item) => {
    const prodCount = table === 'categorii' ? (countByCat[item.id] || 0) : 0;
    const ok = await confirmAsk({
      title: `Ștergi „${clean(item.nume)}”?`,
      message: prodCount
        ? `Categoria conține ${prodCount} ${prodCount === 1 ? 'produs' : 'produse'}. Acțiunea este definitivă.`
        : 'Acțiunea este definitivă și nu poate fi anulată.',
    });
    if (!ok) return;

    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id: item.id, password }),
    });

    if (res.ok) {
      if (table === 'categorii') setCategories(prev => prev.filter(x => x.id !== item.id));
      else setProducts(prev => prev.filter(x => x.id !== item.id));
      setEditor(null);
      toast('Elementul a fost șters.');
    } else {
      toast('Eroare la ștergere.', 'error');
    }
  };

  const handleReorder = async (event, fullList, setFullList, table, filteredList) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredList.findIndex(item => item.id === active.id);
    const newIndex = filteredList.findIndex(item => item.id === over.id);
    const newSubList = arrayMove(filteredList, oldIndex, newIndex);
    const reorderPayload = newSubList.map((item, index) => ({ id: item.id, ordine: index }));

    const newFullList = fullList.map(item => {
      const moved = reorderPayload.find(x => x.id === item.id);
      return moved ? { ...item, ordine: moved.ordine } : item;
    });
    newFullList.sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
    setFullList(newFullList);

    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderPayload, table, password }),
      });
      if (!res.ok) throw new Error();
      toast('Ordinea a fost actualizată.');
    } catch {
      toast('Nu am putut salva noua ordine.', 'error');
      fetchData();
    }
  };

  const openNewProduct = () => {
    const catId = selectedCatId || filteredCategories[0]?.id;
    if (!catId) return toast('Creează mai întâi o categorie.', 'error');
    setEditor({
      table: 'produse',
      item: { nume: '', pret: '', gramaj: '', ingrediente: '', alergeni: '', declaratie_nutritionala: '', imagine_url: '', categorie_id: catId },
    });
  };

  const openNewCategory = () => {
    const t = CAT_TYPES.find(x => x.key === activeCatType);
    setEditor({ table: 'categorii', item: { nume: '', imagine_url: '', tip: t.dbValue } });
  };

  /* ---------- login ---------- */

  if (!isAuthenticated) {
    return (
      <div className="za-root za-login">
        <form className="za-login-card" onSubmit={e => { e.preventDefault(); tryLogin(password); }}>
          <div className="za-logo">Z</div>
          <h1>La Zavat</h1>
          <p>Panou de administrare al meniului</p>
          <div className={`za-login-input ${loginError ? 'has-error' : ''}`}>
            <Icon name="lock" size={17} />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setLoginError(false); }}
              placeholder="Parola"
              autoFocus
            />
          </div>
          {loginError && <span className="za-login-error">Parola nu este corectă.</span>}
          <button type="submit" className="za-btn za-btn-primary za-btn-block">Intră în panou</button>
        </form>
      </div>
    );
  }

  /* ---------- panou ---------- */

  const unitFor = (p) => (isMancare(categories.find(c => c.id === p.categorie_id)) ? 'g' : 'ml');
  const catName = (id) => clean(categories.find(c => c.id === id)?.nume);

  return (
    <div className="za-root za-app">
      <aside className="za-sidebar">
        <div className="za-brand">
          <div className="za-logo za-logo-sm">Z</div>
          <div>
            <strong>La Zavat</strong>
            <span>Administrare meniu</span>
          </div>
        </div>

        <div className="za-segment za-segment-full">
          {CAT_TYPES.map(t => (
            <button key={t.key} className={activeCatType === t.key ? 'is-on' : ''}
              onClick={() => { setActiveCatType(t.key); setQuery(''); }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="za-sidebar-head">
          <span>Categorii</span>
          <button className="za-icon-btn za-icon-btn-sm" onClick={openNewCategory} title="Categorie nouă" aria-label="Categorie nouă">
            <Icon name="plus" size={16} />
          </button>
        </div>

        <div className="za-cat-list">
          <DndContext sensors={sensors} collisionDetection={closestCenter}
            onDragEnd={(e) => handleReorder(e, categories, setCategories, 'categorii', filteredCategories)}>
            <SortableContext items={filteredCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {filteredCategories.map(cat => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  count={countByCat[cat.id] || 0}
                  active={!searching && cat.id === selectedCatId}
                  version={versions['categorii:' + clean(cat.imagine_url)]}
                  onSelect={() => { setSelectedCatId(cat.id); setQuery(''); }}
                  onEdit={() => setEditor({ table: 'categorii', item: { ...cat } })}
                />
              ))}
            </SortableContext>
          </DndContext>
          {!loading && filteredCategories.length === 0 && (
            <button className="za-empty-small" onClick={openNewCategory}>
              <Icon name="plus" size={16} /> Adaugă prima categorie
            </button>
          )}
        </div>

        <a className="za-btn za-btn-primary za-btn-sm za-nav-link" href="/adminPanel/poze">
          <Icon name="image" size={15} /> Studio poze
        </a>
        <a className="za-btn za-btn-ghost za-btn-sm za-nav-link" href="/adminPanel/import">
          <Icon name="image" size={15} /> Import poze site vechi
        </a>

        <div className="za-sidebar-foot">
          <button className="za-btn za-btn-ghost za-btn-sm" onClick={fetchData} title="Reîncarcă datele">
            <Icon name="refresh" size={15} /> Reîncarcă
          </button>
          {!AUTH_DISABLED && (
            <button className="za-btn za-btn-ghost za-btn-sm" onClick={logout}>
              <Icon name="logout" size={15} /> Ieșire
            </button>
          )}
        </div>
      </aside>

      <main className="za-main">
        <header className="za-topbar">
          <div className="za-search">
            <Icon name="search" size={17} />
            <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Caută în tot meniul…" />
            {query
              ? <button className="za-icon-btn za-icon-btn-sm" onClick={() => setQuery('')} aria-label="Șterge căutarea"><Icon name="close" size={15} /></button>
              : <span className="za-kbd-hint"><kbd>⌘</kbd><kbd>K</kbd></span>}
          </div>
          <button className="za-btn za-btn-primary" onClick={openNewProduct}>
            <Icon name="plus" size={17} /> Produs nou
          </button>
        </header>

        <section className="za-content">
          <div className="za-section-head">
            {searching ? (
              <div>
                <span className="za-eyebrow">Rezultate căutare</span>
                <h1>{visibleProducts.length} {visibleProducts.length === 1 ? 'produs găsit' : 'produse găsite'}</h1>
              </div>
            ) : selectedCat ? (
              <>
                <Thumb folder="categorii" file={selectedCat.imagine_url} version={versions['categorii:' + clean(selectedCat.imagine_url)]} size={56} />
                <div>
                  <span className="za-eyebrow">{CAT_TYPES.find(t => t.key === activeCatType)?.label} · {visibleProducts.length} produse</span>
                  <h1>{clean(selectedCat.nume)}</h1>
                </div>
                <button className="za-btn za-btn-ghost za-btn-sm za-push-right"
                  onClick={() => setEditor({ table: 'categorii', item: { ...selectedCat } })}>
                  <Icon name="edit" size={15} /> Editează categoria
                </button>
              </>
            ) : (
              <div><h1>{loading ? 'Se încarcă…' : 'Nicio categorie'}</h1></div>
            )}
          </div>

          {loading && products.length === 0 ? (
            <div className="za-skeletons">{[0, 1, 2, 3, 4].map(i => <div key={i} className="za-skeleton" />)}</div>
          ) : (
            <div className="za-prod-list">
              <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragEnd={(e) => handleReorder(e, products, setProducts, 'produse', visibleProducts)}>
                <SortableContext items={visibleProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {visibleProducts.map(prod => (
                    <ProductRow
                      key={prod.id}
                      prod={prod}
                      unit={unitFor(prod)}
                      version={versions['produse:' + clean(prod.imagine_url)]}
                      categoryName={searching ? catName(prod.categorie_id) : null}
                      dragDisabled={searching}
                      onOpen={() => setEditor({ table: 'produse', item: { ...prod } })}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {visibleProducts.length === 0 && (
                <div className="za-empty">
                  <div className="za-empty-icon"><Icon name={searching ? 'search' : 'image'} size={26} /></div>
                  <h3>{searching ? 'Nimic găsit' : 'Niciun produs aici încă'}</h3>
                  <p>{searching ? `Niciun produs nu conține „${query}”.` : 'Adaugă primul produs în această categorie.'}</p>
                  {!searching && selectedCat && (
                    <button className="za-btn za-btn-primary" onClick={openNewProduct}><Icon name="plus" size={16} /> Produs nou</button>
                  )}
                </div>
              )}
            </div>
          )}
          {!searching && visibleProducts.length > 1 && (
            <p className="za-footnote"><Icon name="grip" size={12} /> Trage de mâner pentru a schimba ordinea în meniu.</p>
          )}
        </section>
      </main>

      {editor && (
        <EditorDrawer
          key={(editor.item.id || 'new') + editor.table}
          editor={editor}
          categories={categories}
          products={products}
          versions={versions}
          knownAllergens={knownAllergens}
          onClose={() => setEditor(null)}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}

      <ConfirmDialog dialog={dialog} onClose={closeDialog} />
      <Toasts toasts={toasts} />
    </div>
  );
}
