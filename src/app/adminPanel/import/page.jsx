"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../admin.css';
import './import.css';
import { AUTH_DISABLED } from '@/lib/adminAuth';

const SESSION_KEY = 'zavat-admin-pass';
const PROGRESS_KEY = 'zavat-import-progress';
const SWIPE_THRESHOLD = 110;

const clean = (v) => (typeof v === 'string' ? v.trim() : v);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugify = (t) => norm(t).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'imagine';

function store(action, key, value) {
  try {
    if (action === 'get') return JSON.parse(localStorage.getItem(key) || 'null');
    if (action === 'set') localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage indisponibil */ }
  return null;
}

const STATUS = {
  sigur: { label: 'Potrivire sigură', cls: 's-sigur' },
  probabil: { label: 'De verificat', cls: 's-probabil' },
  fara: { label: 'Fără potrivire', cls: 's-fara' },
};

/* ------------------------------------------------------------------ */
/* Căutare produs                                                      */
/* ------------------------------------------------------------------ */

function ProductPicker({ products, categories, usage, currentId, onPick, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const catName = useMemo(() => new Map(categories.map(c => [c.id, clean(c.nume)])), [categories]);
  const list = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    return products.filter(p => {
      const hay = norm(`${p.nume} ${catName.get(p.categorie_id) || ''}`);
      return terms.every(t => hay.includes(t));
    });
  }, [q, products, catName]);

  return (
    <div className="za-modal-backdrop" onMouseDown={onClose}>
      <div className="za-pick" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="za-pick-search">
          <span>⌕</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Caută produsul…"
            onKeyDown={e => {
              if (e.key === 'Enter' && list[0]) onPick(list[0].id);
              if (e.key === 'Escape') onClose();
            }} />
          <button className="za-icon-btn za-icon-btn-sm" onClick={onClose} aria-label="Închide">✕</button>
        </div>
        <div className="za-pick-list">
          <button className="za-pick-row is-none" onClick={() => onPick(null)}>
            <span className="za-pick-name">Niciun produs</span>
            <span className="za-pick-cat">poza nu se folosește</span>
          </button>
          {list.map(p => (
            <button key={p.id} className={`za-pick-row ${p.id === currentId ? 'is-current' : ''}`} onClick={() => onPick(p.id)}>
              <span className="za-pick-name">{clean(p.nume)}</span>
              <span className="za-pick-cat">
                {catName.get(p.categorie_id)}
                {usage[p.id] && p.id !== currentId ? <em> · are deja o poză aleasă</em> : null}
              </span>
            </button>
          ))}
          {list.length === 0 && <p className="za-pick-empty">Niciun produs nu conține „{q}”.</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina                                                              */
/* ------------------------------------------------------------------ */

export default function ImportPoze() {
  const [password, setPassword] = useState(null);
  const [matches, setMatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // { [file]: { productId, state: 'pending'|'ok'|'skip'|'done' } }
  const [decisions, setDecisions] = useState({});
  const [history, setHistory] = useState([]);
  const [picker, setPicker] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState(null); // 'left' | 'right'
  const [applying, setApplying] = useState(null);
  const [log, setLog] = useState([]);
  const start = useRef(null);

  useEffect(() => {
    let pass = null;
    if (AUTH_DISABLED) pass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    else { try { pass = sessionStorage.getItem(SESSION_KEY); } catch { /* */ } }
    setPassword(pass && pass === process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? pass : '');

    Promise.all([
      fetch('/_import/potriviri.json').then(r => r.json()),
      fetch('/api/meniu').then(r => r.json()),
    ]).then(([raw, data]) => {
      const order = { fara: 0, probabil: 1, sigur: 2 };
      const m = raw.slice().sort((a, b) => order[a.status] - order[b.status]);
      setMatches(m);
      setProducts((data.produse || []).slice().sort((a, b) => (a.ordine || 0) - (b.ordine || 0)));
      setCategories((data.categorii || []).slice().sort((a, b) => (a.ordine || 0) - (b.ordine || 0)));
      const saved = store('get', PROGRESS_KEY) || {};
      const init = {};
      m.forEach(x => { init[x.file] = saved[x.file] || { productId: x.suggestedId, state: 'pending' }; });
      setDecisions(init);
    });
  }, []);

  const decisionsRef = useRef(decisions);
  const historyRef = useRef(history);
  useEffect(() => { decisionsRef.current = decisions; }, [decisions]);
  useEffect(() => { historyRef.current = history; }, [history]);

  const save = (next) => { store('set', PROGRESS_KEY, next); return next; };
  const setDecision = useCallback((file, patch, remember = true) => {
    if (remember) setHistory(h => [...h, { file, prev: decisionsRef.current[file] }]);
    setDecisions(d => save({ ...d, [file]: { ...d[file], ...patch } }));
  }, []);

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const catById = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const usage = useMemo(() => {
    const u = {};
    Object.values(decisions).forEach(d => {
      if (d.productId && (d.state === 'ok' || d.state === 'done')) u[d.productId] = (u[d.productId] || 0) + 1;
    });
    return u;
  }, [decisions]);

  const queue = matches.filter(m => decisions[m.file]?.state === 'pending');
  const current = queue[0];
  const next = queue[1];
  const decided = matches.length - queue.length;
  const confirmed = matches.filter(m => decisions[m.file]?.state === 'ok');
  const skipped = matches.filter(m => decisions[m.file]?.state === 'skip');
  const done = matches.filter(m => decisions[m.file]?.state === 'done');

  const cur = current ? decisions[current.file] : null;
  const curProd = cur?.productId ? productById.get(cur.productId) : null;

  /* ---------- acțiuni ---------- */

  const decide = useCallback((dir) => {
    if (!current || leaving) return;
    if (dir === 'right' && !decisions[current.file]?.productId) { setPicker(true); return; }
    setLeaving(dir);
    setTimeout(() => {
      setDecision(current.file, { state: dir === 'right' ? 'ok' : 'skip' });
      setLeaving(null);
      setDrag({ x: 0, y: 0, active: false });
    }, 260);
  }, [current, leaving, decisions, setDecision]);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.length) return;
    const last = h[h.length - 1];
    setHistory(h.slice(0, -1));
    setDecisions(d => save({ ...d, [last.file]: last.prev }));
  }, []);

  const pick = (id) => {
    setPicker(false);
    if (!current) return;
    setDecision(current.file, { productId: id }, true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (picker || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') decide('right');
      if (e.key === 'ArrowLeft') decide('left');
      if (e.key === 'ArrowUp') { e.preventDefault(); if (current) setPicker(true); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      if (e.key === 'Backspace') undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide, undo, picker, current]);

  /* ---------- swipe ---------- */

  const onPointerDown = (e) => {
    if (leaving || e.target.closest('button')) return;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.3, active: true });
  };
  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    if (drag.x > SWIPE_THRESHOLD) decide('right');
    else if (drag.x < -SWIPE_THRESHOLD) decide('left');
    else setDrag({ x: 0, y: 0, active: false });
  };

  /* ---------- aplicare ---------- */

  const apply = async () => {
    const todo = confirmed;
    if (!todo.length) return;
    const taken = new Set(products.map(p => clean(p.imagine_url || '').toLowerCase()).filter(Boolean));
    setLog([]);
    for (let i = 0; i < todo.length; i++) {
      const m = todo[i];
      const prod = productById.get(decisions[m.file].productId);
      setApplying({ done: i, total: todo.length });
      try {
        let fileName = clean(prod.imagine_url);
        const needsDbUpdate = !fileName || fileName !== prod.imagine_url;
        if (!fileName) {
          const base = slugify(prod.nume);
          fileName = `${base}.jpg`;
          let k = 2;
          while (taken.has(fileName.toLowerCase())) fileName = `${base}_${k++}.jpg`;
          taken.add(fileName.toLowerCase());
        }
        const blob = await fetch(`/_import/${m.file}`).then(r => r.blob());
        const fd = new FormData();
        fd.append('file', new File([blob], fileName, { type: 'image/jpeg' }));
        fd.append('folder', 'produse');
        fd.append('fileName', fileName);
        fd.append('password', password);
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (!up.ok) throw new Error('upload');
        if (needsDbUpdate) {
          const res = await fetch('/api/admin/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'produse', id: prod.id, data: { ...prod, imagine_url: fileName }, password }),
          });
          if (!res.ok) throw new Error('db');
          setProducts(list => list.map(p => (p.id === prod.id ? { ...p, imagine_url: fileName } : p)));
        }
        setDecision(m.file, { state: 'done' }, false);
        setLog(l => [...l, { ok: true, text: clean(prod.nume) }]);
      } catch (e) {
        setLog(l => [...l, { ok: false, text: `${clean(prod.nume)} — ${e.message === 'db' ? 'eroare la baza de date' : 'eroare la încărcarea pozei'}` }]);
      }
    }
    setApplying(null);
    setHistory([]);
  };

  const resetSkipped = () => {
    setDecisions(d => {
      const n = { ...d };
      skipped.forEach(m => { n[m.file] = { ...n[m.file], state: 'pending' }; });
      return save(n);
    });
  };

  /* ---------- render ---------- */

  if (password === null || !matches.length) return <div className="za-root za-imp-center">Se încarcă…</div>;
  if (!password) {
    return (
      <div className="za-root za-imp-center">
        <p>Intră mai întâi în panoul de admin.</p>
        <a className="za-btn za-btn-primary" href="/adminPanel">Mergi la login</a>
      </div>
    );
  }

  const pct = Math.round((decided / matches.length) * 100);
  const rot = drag.x / 18;
  const likeOpacity = Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);
  const cardStyle = leaving
    ? { transform: `translate(${leaving === 'right' ? 900 : -900}px, ${drag.y}px) rotate(${leaving === 'right' ? 28 : -28}deg)`, transition: 'transform .26s ease-in', }
    : { transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`, transition: drag.active ? 'none' : 'transform .35s cubic-bezier(.22,1,.36,1)' };

  const prodLine = (p) => {
    if (!p) return null;
    const cat = catById.get(p.categorie_id);
    return [clean(cat?.nume), p.gramaj ? `${p.gramaj} g` : null, p.pret ? `${p.pret} lei` : null].filter(Boolean).join(' · ');
  };

  return (
    <div className="za-root za-swipe">
      <header className="za-swipe-top">
        <a className="za-swipe-back" href="/adminPanel">← Panou</a>
        <div className="za-swipe-progress">
          <div className="za-swipe-progress-text">
            <strong>Import poze</strong>
            <span>{Math.min(decided + 1, matches.length)} din {matches.length}</span>
          </div>
          <div className="za-swipe-bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
        <button className="za-btn za-btn-ghost za-btn-sm" onClick={undo} disabled={!history.length || !!applying} title="Anulează (⌫)">
          ↶ Înapoi
        </button>
      </header>

      {current ? (
        <main className="za-swipe-stage">
          <div className="za-swipe-deck">
            {next && (
              <div className="za-swipe-card is-behind" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/_import/${next.file}`} alt="" draggable={false} />
              </div>
            )}

            <div
              key={current.file}
              className="za-swipe-card"
              style={cardStyle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="za-swipe-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/_import/${current.file}`} alt="" draggable={false} />
                <span className="za-stamp za-stamp-yes" style={{ opacity: leaving === 'right' ? 1 : likeOpacity }}>CONFIRM</span>
                <span className="za-stamp za-stamp-no" style={{ opacity: leaving === 'left' ? 1 : nopeOpacity }}>IGNOR</span>
                <div className="za-swipe-photo-cap">
                  <span>Poza de pe site-ul vechi</span>
                  <b>{current.oldName}</b>
                </div>
              </div>

              <div className="za-swipe-info">
                <div className="za-swipe-match-label">
                  {cur.productId === current.suggestedId
                    ? <span className={`za-imp-badge ${STATUS[current.status].cls}`}>{STATUS[current.status].label}</span>
                    : <span className="za-imp-badge s-manual">Ales de tine</span>}
                  <span className="za-swipe-arrow">se potrivește cu</span>
                </div>
                {curProd ? (
                  <>
                    <h2>{clean(curProd.nume)}</h2>
                    <p className="za-swipe-sub">{prodLine(curProd)}</p>
                    {usage[curProd.id] > 0 && <p className="za-imp-warn">⚠ Produsul are deja altă poză confirmată.</p>}
                  </>
                ) : (
                  <>
                    <h2 className="is-empty">Niciun produs</h2>
                    <p className="za-swipe-sub">{current.note || 'Alege produsul corect sau ignoră poza.'}</p>
                  </>
                )}
                <button className="za-swipe-change" onClick={() => setPicker(true)}>
                  {curProd ? 'Nu e corect? Alege alt produs' : 'Alege produsul'} <kbd>↑</kbd>
                </button>
              </div>
            </div>
          </div>

          <div className="za-swipe-actions">
            <button className="za-round za-round-no" onClick={() => decide('left')} aria-label="Ignoră">
              ✕<span>Ignoră</span>
            </button>
            <button className="za-round za-round-edit" onClick={() => setPicker(true)} aria-label="Alt produs">
              ⇄<span>Alt produs</span>
            </button>
            <button className="za-round za-round-yes" onClick={() => decide('right')} aria-label="Confirmă">
              ✓<span>Confirmă</span>
            </button>
          </div>
          <p className="za-swipe-hint">Glisează cardul sau folosește tastele <kbd>←</kbd> <kbd>→</kbd> · <kbd>↑</kbd> alt produs · <kbd>⌫</kbd> înapoi</p>
        </main>
      ) : (
        <main className="za-swipe-done">
          <div className="za-swipe-done-head">
            <div className="za-swipe-trophy">{done.length && !confirmed.length ? '✓' : '🎉'}</div>
            <h1>{done.length && !confirmed.length ? 'Pozele au fost aplicate' : 'Ai trecut prin toate pozele'}</h1>
            <p>
              <b className="c-ok">{confirmed.length} de aplicat</b>
              {done.length > 0 && <> · <b className="c-done">{done.length} aplicate</b></>}
              {' '}· <b className="c-skip">{skipped.length} ignorate</b>
            </p>
            <div className="za-swipe-done-actions">
              {skipped.length > 0 && !applying && (
                <button className="za-btn za-btn-ghost" onClick={resetSkipped}>Revezi cele ignorate</button>
              )}
              <button className="za-btn za-btn-primary" onClick={apply} disabled={!confirmed.length || !!applying}>
                {applying ? `Se aplică ${applying.done + 1} din ${applying.total}…` : `Aplică ${confirmed.length} poze`}
              </button>
            </div>
          </div>

          {log.length > 0 && (
            <div className="za-imp-log">
              {log.map((l, i) => <div key={i} className={l.ok ? 'ok' : 'err'}>{l.ok ? '✓' : '✕'} {l.text}</div>)}
            </div>
          )}

          <div className="za-swipe-summary">
            {[...confirmed, ...done].map(m => {
              const d = decisions[m.file];
              const p = productById.get(d.productId);
              return (
                <div key={m.file} className={`za-sum-item ${d.state === 'done' ? 'is-done' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/_import/${m.file}`} alt="" />
                  <div>
                    <b>{clean(p?.nume)}</b>
                    <span>{d.state === 'done' ? '✓ aplicată' : prodLine(p)}</span>
                  </div>
                  {d.state === 'ok' && !applying && (
                    <button className="za-icon-btn za-icon-btn-sm" title="Trimite înapoi la verificare"
                      onClick={() => setDecision(m.file, { state: 'pending' })}>↶</button>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {picker && current && (
        <ProductPicker
          products={products}
          categories={categories}
          usage={usage}
          currentId={cur?.productId}
          onPick={pick}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}
