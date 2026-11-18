"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../admin.css';
import './poze.css';
import { AUTH_DISABLED } from '@/lib/adminAuth';

/* ------------------------------------------------------------------ */
/* Constante și utilitare                                              */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'zavat-admin-pass';
const PROGRESS_KEY = 'zavat-studio-progress';
const OUT_W = 1600; // poza finală: 4:3, ca în cardul din meniu
const OUT_H = 1200;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

const DEFAULT_EDITS = { zoom: 1, x: 0, y: 0, rot: 0, flip: false, bright: 100, contrast: 100, sat: 100, bg: 'blur' };

const clean = (v) => (typeof v === 'string' ? v.trim() : v);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugify = (t) => norm(t).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'imagine';
const tokens = (s) => norm(s).replace(/\.[a-z0-9]+$/, '').split(/[^a-z]+/).filter(t => t.length >= 3);
const photoKey = (p) => `${p.source}:${p.name}:${p.size}`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function store(action, key, value) {
  try {
    if (action === 'get') return JSON.parse(localStorage.getItem(key) || 'null');
    if (action === 'set') localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage indisponibil */ }
  return null;
}

// Scara minimă la care poza (rotită) acoperă complet cadrul W×H.
function coverScale(iw, ih, W, H, rad) {
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return Math.max((W * c + H * s) / iw, (W * s + H * c) / ih);
}

// Desenează poza cu toate ajustările într-un cadru W×H (același cod pentru ecran, preview și export).
function drawPhoto(ctx, img, W, H, e) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const adjust = `brightness(${e.bright}%) contrast(${e.contrast}%) saturate(${e.sat}%)`;
  const canFilter = 'filter' in ctx;
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // fundal (se vede doar când poza e micșorată sub cadru)
  if (e.bg === 'blur') {
    const s = Math.max(W / iw, H / ih) * 1.15;
    if (canFilter) ctx.filter = `blur(${Math.round(W / 30)}px) ${adjust} brightness(80%)`;
    ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
  } else {
    ctx.fillStyle = e.bg === 'white' ? '#ffffff' : '#f3ece2';
    ctx.fillRect(0, 0, W, H);
  }

  if (canFilter) ctx.filter = adjust;
  ctx.translate(W / 2 + e.x * W, H / 2 + e.y * H);
  const rad = (e.rot * Math.PI) / 180;
  ctx.rotate(rad);
  if (e.flip) ctx.scale(-1, 1);
  const s = coverScale(iw, ih, W, H, rad) * e.zoom;
  ctx.drawImage(img, (-iw * s) / 2, (-ih * s) / 2, iw * s, ih * s);
  ctx.restore();
}

// Canvas care se redimensionează singur și redesenează când se schimbă ceva.
function PhotoCanvas({ img, edits, className, canvasRef }) {
  const local = useRef(null);
  const ref = canvasRef || local;
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !img || !size.w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = Math.round(size.w * dpr);
    el.height = Math.round(size.h * dpr);
    drawPhoto(el.getContext('2d'), img, el.width, el.height, edits);
  }, [img, edits, size, ref]);

  return <canvas ref={ref} className={className} />;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ------------------------------------------------------------------ */
/* Căutare produs (inline, cu sugestii)                                */
/* ------------------------------------------------------------------ */

function ProductSearch({ products, catName, valueId, suggestions, savedIds, onPick }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && e.target.tagName !== 'INPUT') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const list = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return products.slice(0, 60);
    return products.filter(p => {
      const hay = norm(`${p.nume} ${catName.get(p.categorie_id) || ''}`);
      return terms.every(t => hay.includes(t));
    }).slice(0, 60);
  }, [q, products, catName]);

  const choose = (p) => {
    onPick(p.id);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="pz-search">
      <div className="pz-search-box">
        <span aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          value={q}
          placeholder={valueId ? 'Schimbă produsul…  ( / )' : 'Caută produsul pentru poza asta…  ( / )'}
          onChange={e => { setQ(e.target.value); setOpen(true); setHi(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, list.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
            if (e.key === 'Enter' && list[hi]) { e.preventDefault(); e.stopPropagation(); choose(list[hi]); }
            if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); }
          }}
        />
      </div>
      {open && (
        <div className="pz-search-list" onMouseDown={e => e.preventDefault()}>
          {list.map((p, i) => (
            <button key={p.id} className={`pz-search-row ${i === hi ? 'is-hi' : ''} ${p.id === valueId ? 'is-current' : ''}`}
              onMouseEnter={() => setHi(i)} onClick={() => choose(p)}>
              <b>{clean(p.nume)}</b>
              <span>{catName.get(p.categorie_id)}{savedIds.has(p.id) ? ' · poză salvată acum' : ''}</span>
            </button>
          ))}
          {list.length === 0 && <p className="pz-search-empty">Niciun produs nu conține „{q}”.</p>}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="pz-suggest">
          <span>Sugestii:</span>
          {suggestions.map(p => (
            <button key={p.id} className={`pz-chip ${p.id === valueId ? 'is-on' : ''}`} onClick={() => onPick(p.id)}>
              {clean(p.nume)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina                                                              */
/* ------------------------------------------------------------------ */

export default function StudioPoze() {
  const [password, setPassword] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [placeholders, setPlaceholders] = useState(null);
  const [hasOldSite, setHasOldSite] = useState(false);

  const [photos, setPhotos] = useState([]); // {name,size,url,source,suggestedId}
  const [idx, setIdx] = useState(0);
  const [meta, setMeta] = useState({}); // key -> {productId, state, edits}
  const [img, setImg] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [bust, setBust] = useState({}); // productId -> timestamp (cache-busting după salvare)
  const [panel, setPanel] = useState('frame'); // 'frame' | 'color'

  const frameRef = useRef(null);
  const fileInput = useRef(null);
  const folderInput = useRef(null);
  const drag = useRef(null);

  /* ---------- încărcare date ---------- */

  useEffect(() => {
    let pass = null;
    if (AUTH_DISABLED) pass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    else { try { pass = sessionStorage.getItem(SESSION_KEY); } catch { /* */ } }
    setPassword(pass && pass === process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? pass : '');

    fetch('/api/meniu').then(r => r.json()).then(data => {
      setProducts((data.produse || []).slice().sort((a, b) => (a.categorie_id - b.categorie_id) || ((a.ordine || 0) - (b.ordine || 0))));
      setCategories((data.categorii || []).slice().sort((a, b) => (a.ordine || 0) - (b.ordine || 0)));
    });
    fetch('/api/admin/placeholders').then(r => r.json()).then(list => setPlaceholders(new Set(list))).catch(() => setPlaceholders(new Set()));
    fetch('/_import/potriviri.json').then(r => (r.ok ? setHasOldSite(true) : null)).catch(() => {});
  }, []);

  const catById = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const catName = useMemo(() => new Map(categories.map(c => [c.id, clean(c.nume)])), [categories]);
  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const orderedProducts = useMemo(() => {
    const order = new Map(categories.map((c, i) => [c.id, i]));
    return products.slice().sort((a, b) => ((order.get(a.categorie_id) ?? 99) - (order.get(b.categorie_id) ?? 99)) || ((a.ordine || 0) - (b.ordine || 0)));
  }, [products, categories]);

  /* ---------- adăugare poze ---------- */

  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);

  const addFiles = useCallback((fileList) => {
    const files = [...fileList].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif|avif|gif)$/i.test(f.name));
    if (!files.length) return;
    files.sort((a, b) => a.name.localeCompare(b.name, 'ro', { numeric: true }));
    const saved = store('get', PROGRESS_KEY) || {};
    const prev = photosRef.current;
    const known = new Set(prev.map(photoKey));
    const added = files
      .filter(f => !known.has(photoKey({ source: 'local', name: f.name, size: f.size })))
      .map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f), source: 'local' }));
    if (!added.length) return;
    setMeta(m => {
      const n = { ...m };
      added.forEach(p => { const k = photoKey(p); if (!n[k]) n[k] = saved[k] ? { ...saved[k] } : {}; });
      return n;
    });
    if (!prev.length) {
      // pornește de la prima poză încă nesalvată
      const first = added.findIndex(p => !saved[photoKey(p)]?.state);
      setIdx(Math.max(first, 0));
    }
    photosRef.current = [...prev, ...added];
    setPhotos(photosRef.current);
  }, []);

  const addOldSite = async () => {
    const raw = await fetch('/_import/potriviri.json').then(r => r.json());
    const saved = store('get', PROGRESS_KEY) || {};
    const added = raw.map(m => ({ name: m.file, size: 0, url: `/_import/${m.file}`, source: 'vechi', suggestedId: m.suggestedId, oldName: m.oldName }));
    setMeta(m => {
      const n = { ...m };
      added.forEach(p => { const k = photoKey(p); if (!n[k]) n[k] = saved[k] ? { ...saved[k] } : { productId: p.suggestedId || null }; });
      return n;
    });
    setPhotos(prev => (prev.length ? [...prev, ...added.filter(a => !prev.some(p => photoKey(p) === photoKey(a)))] : added));
  };

  useEffect(() => {
    const onDragOver = (e) => { e.preventDefault(); setDropping(true); };
    const onDragLeave = (e) => { if (!e.relatedTarget) setDropping(false); };
    const onDrop = (e) => { e.preventDefault(); setDropping(false); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [addFiles]);

  /* ---------- poza curentă ---------- */

  const photo = photos[idx] || null;
  const key = photo ? photoKey(photo) : null;
  const cur = (key && meta[key]) || {};
  const edits = cur.edits || DEFAULT_EDITS;
  const product = cur.productId ? productById.get(cur.productId) : null;
  const category = product ? catById.get(product.categorie_id) : null;

  useEffect(() => {
    if (!photo) { setImg(null); return undefined; }
    let alive = true;
    setImgError(false);
    loadImage(photo.url).then(i => { if (alive) setImg(i); }).catch(() => { if (alive) { setImg(null); setImgError(true); } });
    return () => { alive = false; };
  }, [photo]);

  const persist = (next) => {
    const saved = {};
    Object.entries(next).forEach(([k, v]) => { if (v.productId || v.state) saved[k] = { productId: v.productId || null, state: v.state || null }; });
    store('set', PROGRESS_KEY, { ...(store('get', PROGRESS_KEY) || {}), ...saved });
    return next;
  };
  const patchCur = useCallback((patch) => {
    if (!key) return;
    setMeta(m => persist({ ...m, [key]: { ...m[key], ...patch } }));
  }, [key]);
  const setEdits = useCallback((fn) => {
    if (!key) return;
    setMeta(m => {
      const prev = m[key]?.edits || DEFAULT_EDITS;
      const next = typeof fn === 'function' ? fn(prev) : { ...prev, ...fn };
      return { ...m, [key]: { ...m[key], edits: next } };
    });
  }, [key]);

  /* ---------- sugestii produs ---------- */

  const suggestions = useMemo(() => {
    if (!photo || !products.length) return [];
    if (photo.suggestedId) {
      const p = productById.get(photo.suggestedId);
      return p ? [p] : [];
    }
    const t = tokens(photo.name);
    if (!t.length) return [];
    return products
      .map(p => {
        const pt = tokens(p.nume);
        const hits = pt.filter(w => t.some(x => x.startsWith(w.slice(0, 4)) || w.startsWith(x.slice(0, 4)))).length;
        return { p, score: pt.length ? hits / pt.length + hits * 0.1 : 0 };
      })
      .filter(s => s.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(s => s.p);
  }, [photo, products, productById]);

  const savedIds = useMemo(() => new Set(Object.values(meta).filter(m => m.state === 'saved').map(m => m.productId)), [meta]);

  /* ---------- interacțiuni pe cadru ---------- */

  const onPointerDown = (e) => {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ex: edits.x, ey: edits.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const r = frameRef.current.getBoundingClientRect();
    const d = drag.current;
    setEdits({ x: d.ex + (e.clientX - d.x) / r.width, y: d.ey + (e.clientY - d.y) / r.height });
  };
  const onPointerUp = () => { drag.current = null; };

  // zoom cu rotița / pinch pe trackpad, spre cursor
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setEdits(prev => {
        const z = clamp(prev.zoom * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)), 0.3, 5);
        const k = z / prev.zoom;
        return { ...prev, zoom: z, x: px - (px - prev.x) * k, y: py - (py - prev.y) * k };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setEdits, img]);

  const rotate90 = (dir) => setEdits(p => ({ ...p, rot: Math.round((p.rot + dir * 90) / 90) * 90 % 360, x: 0, y: 0 }));
  const fitWhole = () => {
    if (!img) return;
    const rad = (edits.rot * Math.PI) / 180;
    const cover = coverScale(img.naturalWidth, img.naturalHeight, 4, 3, rad);
    const c = Math.abs(Math.cos(rad)); const s = Math.abs(Math.sin(rad));
    const bw = img.naturalWidth * c + img.naturalHeight * s;
    const bh = img.naturalWidth * s + img.naturalHeight * c;
    const contain = Math.min(4 / bw, 3 / bh);
    setEdits(p => ({ ...p, zoom: contain / cover, x: 0, y: 0 }));
  };

  /* ---------- navigare și salvare ---------- */

  const flash = (text, kind = 'ok') => {
    setToast({ text, kind, id: Date.now() });
    setTimeout(() => setToast(t => (t && Date.now() - t.id > 2400 ? null : t)), 2600);
  };

  const go = useCallback((dir) => {
    setIdx(i => clamp(i + dir, 0, Math.max(photos.length - 1, 0)));
  }, [photos.length]);

  const nextPending = useCallback((from, m) => {
    for (let i = from + 1; i < photos.length; i++) if (!m[photoKey(photos[i])]?.state) return i;
    for (let i = 0; i < from; i++) if (!m[photoKey(photos[i])]?.state) return i;
    return Math.min(from + 1, photos.length - 1);
  }, [photos]);

  const skip = useCallback(() => {
    if (!key) return;
    const next = { ...meta, [key]: { ...meta[key], state: 'skipped' } };
    setMeta(persist(next));
    setIdx(nextPending(idx, next));
  }, [key, meta, idx, nextPending]);

  const save = useCallback(async () => {
    if (!img || !product || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      drawPhoto(canvas.getContext('2d'), img, OUT_W, OUT_H, edits);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.86));

      let fileName = clean(product.imagine_url);
      const needsDb = !fileName || fileName !== product.imagine_url;
      if (!fileName) {
        const taken = new Set(products.map(p => clean(p.imagine_url || '').toLowerCase()).filter(Boolean));
        const base = slugify(product.nume);
        fileName = `${base}.jpg`;
        let k = 2;
        while (taken.has(fileName.toLowerCase())) fileName = `${base}_${k++}.jpg`;
      }

      const fd = new FormData();
      fd.append('file', new File([blob], fileName, { type: 'image/jpeg' }));
      fd.append('folder', 'produse');
      fd.append('fileName', fileName);
      fd.append('password', password);
      const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!up.ok) throw new Error('Nu am putut salva poza pe disc.');

      if (needsDb) {
        const res = await fetch('/api/admin/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'produse', id: product.id, data: { ...product, imagine_url: fileName }, password }),
        });
        if (!res.ok) throw new Error('Poza e salvată, dar baza de date nu s-a actualizat.');
        setProducts(list => list.map(p => (p.id === product.id ? { ...p, imagine_url: fileName } : p)));
      }

      setPlaceholders(s => { const n = new Set(s); n.delete(fileName); return n; });
      setBust(b => ({ ...b, [product.id]: Date.now() }));
      const next = { ...meta, [key]: { ...meta[key], state: 'saved', productId: product.id } };
      setMeta(persist(next));
      flash(`✓ Salvată la ${clean(product.nume)}`);
      setIdx(nextPending(idx, next));
    } catch (e) {
      flash(e.message || 'Eroare la salvare', 'err');
    } finally {
      setBusy(false);
    }
  }, [img, product, busy, edits, products, password, meta, key, idx, nextPending]);

  /* ---------- scurtături ---------- */

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (e.target.tagName === 'INPUT' && (e.target.type !== 'range' || k.startsWith('Arrow'))) return;
      if ((e.metaKey || e.ctrlKey) && k.toLowerCase() === 's') { e.preventDefault(); save(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (k === 'Enter') { if (e.target.tagName === 'BUTTON') return; e.preventDefault(); save(); }
      else if (k === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (k === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (k.toLowerCase() === 'r') rotate90(e.shiftKey ? -1 : 1);
      else if (k === '+' || k === '=') setEdits(p => ({ ...p, zoom: clamp(p.zoom * 1.1, 0.3, 5) }));
      else if (k === '-') setEdits(p => ({ ...p, zoom: clamp(p.zoom / 1.1, 0.3, 5) }));
      else if (k === '0') setEdits(DEFAULT_EDITS);
      else if (k.toLowerCase() === 'f') fitWhole();
      else if (k.toLowerCase() === 's') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ---------- render ---------- */

  if (password === null || !products.length || !placeholders) return <div className="za-root pz-center">Se încarcă…</div>;
  if (!password) {
    return (
      <div className="za-root pz-center">
        <p>Intră mai întâi în panoul de admin.</p>
        <a className="za-btn za-btn-primary" href="/adminPanel">Mergi la login</a>
      </div>
    );
  }

  const fileInputs = (
    <>
      <input ref={fileInput} type="file" accept={ACCEPT} multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
      <input ref={folderInput} type="file" multiple hidden webkitdirectory="" directory="" onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
    </>
  );

  /* ---------- ecran gol ---------- */

  if (!photos.length) {
    return (
      <div className={`za-root pz-empty ${dropping ? 'is-dropping' : ''}`}>
        {fileInputs}
        <a className="pz-back" href="/adminPanel">← Panou</a>
        <div className="pz-empty-card">
          <div className="pz-empty-icon">🖼</div>
          <h1>Studio poze</h1>
          <p>Trage aici pozele (sau un folder întreg) ori alege-le de pe calculator. Le iei pe rând: alegi produsul, încadrezi poza și o salvezi direct în meniu.</p>
          <div className="pz-empty-actions">
            <button className="za-btn za-btn-primary" onClick={() => fileInput.current.click()}>Alege poze</button>
            <button className="za-btn za-btn-ghost" onClick={() => folderInput.current.click()}>Alege un folder</button>
          </div>
          {hasOldSite && <button className="pz-link" onClick={addOldSite}>sau folosește cele 42 de poze de pe site-ul vechi</button>}
          <ul className="pz-tips">
            <li><kbd>Enter</kbd> salvează și trece la următoarea</li>
            <li><kbd>←</kbd> <kbd>→</kbd> poza anterioară / următoare · <kbd>S</kbd> sari peste</li>
            <li><kbd>/</kbd> caută produs · <kbd>R</kbd> rotește · <kbd>+</kbd> <kbd>−</kbd> zoom · <kbd>F</kbd> poza întreagă · <kbd>0</kbd> resetare</li>
          </ul>
        </div>
      </div>
    );
  }

  /* ---------- studio ---------- */

  const savedCount = photos.filter(p => meta[photoKey(p)]?.state === 'saved').length;
  const skippedCount = photos.filter(p => meta[photoKey(p)]?.state === 'skipped').length;
  const currentFile = product ? clean(product.imagine_url) : null;
  const hasReal = currentFile && !placeholders.has(currentFile);
  const currentSrc = hasReal ? `/photos/produse/${encodeURIComponent(currentFile)}?v=${bust[product.id] || 0}` : null;
  const unit = category && category.tip === 'Mancare' ? 'g' : 'ml';
  const neighbours = product ? products.filter(p => p.categorie_id === product.categorie_id && p.id !== product.id).slice(0, 1) : [];
  const zoomPct = Math.round(edits.zoom * 100);
  const edited = JSON.stringify(edits) !== JSON.stringify(DEFAULT_EDITS);

  return (
    <div className={`za-root pz ${dropping ? 'is-dropping' : ''}`}>
      {fileInputs}

      {/* ---------- bara de sus ---------- */}
      <header className="pz-top">
        <a className="pz-back" href="/adminPanel">← Panou</a>
        <div className="pz-title">
          <strong>Studio poze</strong>
          <span>{idx + 1} din {photos.length} · <b className="c-ok">{savedCount} salvate</b>{skippedCount ? ` · ${skippedCount} sărite` : ''}</span>
        </div>
        <div className="pz-progress"><i style={{ width: `${(savedCount / photos.length) * 100}%` }} /></div>
        <button className="za-btn za-btn-ghost za-btn-sm" onClick={() => fileInput.current.click()}>+ Adaugă poze</button>
      </header>

      <div className="pz-body">
        {/* ---------- lista de poze ---------- */}
        <aside className="pz-strip" aria-label="Poze">
          {photos.map((p, i) => {
            const m = meta[photoKey(p)] || {};
            const prod = m.productId ? productById.get(m.productId) : null;
            return (
              <button key={photoKey(p)} className={`pz-thumb ${i === idx ? 'is-active' : ''} ${m.state ? `is-${m.state}` : ''}`} onClick={() => setIdx(i)}>
                <img src={p.url} alt="" loading="lazy" />
                <span className="pz-thumb-label">{prod ? clean(prod.nume) : p.oldName || p.name}</span>
                {m.state === 'saved' && <span className="pz-thumb-badge ok">✓</span>}
                {m.state === 'skipped' && <span className="pz-thumb-badge skip">–</span>}
              </button>
            );
          })}
        </aside>

        {/* ---------- editor ---------- */}
        <main className="pz-main">
          <ProductSearch
            products={orderedProducts}
            catName={catName}
            valueId={cur.productId}
            suggestions={suggestions}
            savedIds={savedIds}
            onPick={(id) => patchCur({ productId: id, state: cur.state === 'skipped' ? null : cur.state })}
          />

          <div className="pz-assigned">
            {product ? (
              <>
                <span className="pz-assigned-label">Poza va merge la</span>
                <b>{clean(product.nume)}</b>
                <span className="pz-assigned-cat">{clean(category?.nume)}</span>
                {cur.state === 'saved' && <span className="pz-pill ok">salvată</span>}
              </>
            ) : (
              <span className="pz-assigned-label">Alege produsul de mai sus ca să poți salva.</span>
            )}
            <span className="pz-file">{photo.oldName || photo.name}</span>
          </div>

          <div
            ref={frameRef}
            className="pz-frame"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={() => setEdits(DEFAULT_EDITS)}
          >
            {img && <PhotoCanvas img={img} edits={edits} className="pz-canvas" />}
            {imgError && (
              <div className="pz-frame-msg">
                Poza nu poate fi deschisă în browser{/\.(heic|heif)$/i.test(photo.name) ? ' (format HEIC de iPhone — export-o ca JPG)' : ''}.
              </div>
            )}
            <div className="pz-grid" aria-hidden="true" />
            <div className="pz-frame-hint">Trage ca să muți · rotița pentru zoom · dublu-click resetează</div>
          </div>

          {/* ---------- unelte ---------- */}
          <div className="pz-tools">
            <div className="pz-tabs" role="tablist">
              <button className={panel === 'frame' ? 'is-on' : ''} onClick={() => setPanel('frame')}>Încadrare</button>
              <button className={panel === 'color' ? 'is-on' : ''} onClick={() => setPanel('color')}>Culoare</button>
            </div>

            {panel === 'frame' ? (
              <div className="pz-tool-rows">
                <label className="pz-slider">
                  <span>Zoom <b>{zoomPct}%</b></span>
                  <button className="pz-mini" onClick={() => setEdits(p => ({ ...p, zoom: clamp(p.zoom / 1.15, 0.3, 5) }))} aria-label="Micșorează">−</button>
                  <input type="range" min={0.3} max={5} step={0.01} value={edits.zoom} onChange={e => setEdits({ zoom: +e.target.value })} />
                  <button className="pz-mini" onClick={() => setEdits(p => ({ ...p, zoom: clamp(p.zoom * 1.15, 0.3, 5) }))} aria-label="Mărește">+</button>
                </label>
                <label className="pz-slider">
                  <span>Înclinare <b>{(((edits.rot + 540) % 360) - 180).toFixed(1)}°</b></span>
                  <span />
                  <input type="range" min={-180} max={180} step={0.5} value={((edits.rot + 540) % 360) - 180} onChange={e => setEdits({ rot: +e.target.value })} />
                  <span />
                </label>
                <div className="pz-buttons">
                  <button className="za-btn za-btn-ghost za-btn-sm" onClick={() => rotate90(-1)} title="Shift+R">⟲ 90°</button>
                  <button className="za-btn za-btn-ghost za-btn-sm" onClick={() => rotate90(1)} title="R">⟳ 90°</button>
                  <button className={`za-btn za-btn-ghost za-btn-sm ${edits.flip ? 'is-on' : ''}`} onClick={() => setEdits(p => ({ ...p, flip: !p.flip }))}>⇋ Oglindă</button>
                  <button className="za-btn za-btn-ghost za-btn-sm" onClick={fitWhole} title="F">⤢ Poza întreagă</button>
                  <button className="za-btn za-btn-ghost za-btn-sm" onClick={() => setEdits(p => ({ ...p, zoom: 1, x: 0, y: 0 }))}>▣ Umple cadrul</button>
                  <div className="pz-bg">
                    <span>Fundal</span>
                    {[['blur', 'Estompat'], ['cream', 'Crem'], ['white', 'Alb']].map(([v, l]) => (
                      <button key={v} className={edits.bg === v ? 'is-on' : ''} onClick={() => setEdits({ bg: v })}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pz-tool-rows">
                {[['bright', 'Luminozitate'], ['contrast', 'Contrast'], ['sat', 'Saturație']].map(([k, l]) => (
                  <label key={k} className="pz-slider">
                    <span>{l} <b>{edits[k] - 100 > 0 ? '+' : ''}{edits[k] - 100}</b></span>
                    <span />
                    <input type="range" min={50} max={150} step={1} value={edits[k]} onChange={e => setEdits({ [k]: +e.target.value })} onDoubleClick={() => setEdits({ [k]: 100 })} />
                    <span />
                  </label>
                ))}
                <div className="pz-buttons">
                  <button className="za-btn za-btn-ghost za-btn-sm" onClick={() => setEdits({ bright: 106, contrast: 108, sat: 112 })}>✦ Mai apetisant</button>
                  <button className="za-btn za-btn-ghost za-btn-sm" onClick={() => setEdits({ bright: 100, contrast: 100, sat: 100 })}>Fără ajustări</button>
                </div>
              </div>
            )}
          </div>

          {/* ---------- acțiuni ---------- */}
          <div className="pz-actions">
            <button className="za-btn za-btn-ghost" onClick={() => go(-1)} disabled={idx === 0} title="←">‹ Anterioara</button>
            <button className="za-btn za-btn-ghost" onClick={skip} title="S">Sari peste</button>
            {edited && <button className="za-btn za-btn-ghost" onClick={() => setEdits(DEFAULT_EDITS)} title="0">Resetează</button>}
            <span className="pz-spacer" />
            <button className="za-btn za-btn-ghost" onClick={() => go(1)} disabled={idx >= photos.length - 1} title="→">Următoarea ›</button>
            <button className="za-btn za-btn-primary pz-save" onClick={save} disabled={!product || !img || busy} title="Enter">
              {busy ? 'Se salvează…' : cur.state === 'saved' ? 'Salvează din nou' : 'Salvează și mergi mai departe'}
              <kbd>↵</kbd>
            </button>
          </div>
        </main>

        {/* ---------- comparație + preview telefon ---------- */}
        <aside className="pz-side">
          <div className="pz-compare">
            <figure>
              <figcaption>Acum în meniu</figcaption>
              {currentSrc ? (
                <img key={currentSrc} src={currentSrc} alt="" />
              ) : (
                <div className="pz-compare-empty">{product ? 'Fără poză' : '—'}</div>
              )}
            </figure>
            <figure className="is-new">
              <figcaption>Poza nouă</figcaption>
              {img ? <PhotoCanvas img={img} edits={edits} className="pz-compare-canvas" /> : <div className="pz-compare-empty">—</div>}
            </figure>
          </div>

          <div className="pz-phone-label">Așa va arăta pe telefon</div>
          <div className="pz-phone">
            <div className="pz-phone-notch" />
            <div className="pz-phone-screen">
              <div className="products-list">
                <div className="sticky-bar pz-phone-bar">
                  <span className="back-btn" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <h2>{category ? clean(category.nume) : 'Categorie'}</h2>
                  <span className="header-spacer" />
                </div>

                <div className="product-card">
                  <div className="product-img-wrapper">
                    {img && <PhotoCanvas img={img} edits={edits} className="pz-phone-canvas" />}
                    {product?.gramaj > 0 && <span className="weight-chip">{product.gramaj} {unit}</span>}
                  </div>
                  <div className="product-info">
                    <div className="product-title-price">
                      <h3>{product ? product.nume : 'NUMELE PRODUSULUI'}</h3>
                      <span className="price">{product ? Math.floor(product.pret) : '00'} <small>lei</small></span>
                    </div>
                    {product?.ingrediente && <p className="ingredients">{product.ingrediente}</p>}
                  </div>
                </div>

                {neighbours.map(n => {
                  const f = clean(n.imagine_url);
                  const real = f && !placeholders.has(f);
                  return (
                    <div key={n.id} className={`product-card pz-ghost ${real ? '' : 'no-photo'}`}>
                      {real && (
                        <div className="product-img-wrapper">
                          <img src={`/photos/produse/${encodeURIComponent(f)}?v=${bust[n.id] || 0}`} alt="" />
                        </div>
                      )}
                      <div className="product-info">
                        <div className="product-title-price">
                          <h3>{n.nume}</h3>
                          <span className="price">{Math.floor(n.pret)} <small>lei</small></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {dropping && <div className="pz-drop">Lasă pozele aici</div>}
      {toast && <div key={toast.id} className={`pz-toast ${toast.kind}`}>{toast.text}</div>}
    </div>
  );
}
