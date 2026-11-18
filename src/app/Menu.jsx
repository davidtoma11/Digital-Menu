"use client";
/* eslint-disable @next/next/no-img-element */
import { memo, useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo, useSyncExternalStore } from 'react';
import PLACEHOLDERS from '@/lib/placeholders.json';
import IMAGES from '@/lib/images.json';
import { kindOf, unitFor, clean, parseNutrition, splitAllergens } from '@/lib/menuFormat';
import { LANGS, UI, fold, allergenName, productText, categoryName, searchHaystack } from '@/lib/i18n';

const TYPE_KEYS = ['mancare', 'bar', 'vinuri'];

const PHONE = '+40766526791';
const PHONE_LABEL = '+40 766 526 791';
const WIFI = 'caracatita';
const MAPS_URL = 'https://www.google.com/maps/place/La+Zavat/@44.438217,26.1218274,17.25z/data=!4m6!3m5!1s0x40b1ff2e132cb559:0xd32fd1b99cffd568!8m2!3d44.4379606!4d26.1233078!16s%2Fg%2F1hc4v9zc_';
const OPEN_H = 12;
const CLOSE_H = 22;
const LANG_KEY = 'zavat-lang';

const PLACEHOLDER_SET = new Set(PLACEHOLDERS);
const realPhoto = (url) => {
  const file = clean(url);
  return file && !PLACEHOLDER_SET.has(file) ? file : null;
};

/** URL-ul variantei optimizate (dacă există) + previzualizarea estompată. */
function photoSrc(folder, file, kind) {
  const e = IMAGES[`${folder}/${file}`];
  if (e && e[kind]) {
    const base = file.replace(/\.(jpe?g|png|webp)$/i, '');
    return { src: `/photos/v/${folder}/${encodeURIComponent(base)}-${kind}.webp?v=${e.v}`, blur: e.b };
  }
  return { src: `/photos/${folder}/${encodeURIComponent(file)}`, blur: null };
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sortMenu(raw) {
  if (!raw) return null;
  const byOrder = (a, b) => (a.ordine || 0) - (b.ordine || 0);
  return {
    categories: [...(raw.categorii || [])].sort(byOrder),
    products: [...(raw.produse || [])].sort(byOrder),
  };
}

/* ---------------- limba ---------------- */

// Aleasă anterior; altfel după telefon (română dacă e printre limbile lui, greacă, apoi engleză).
let currentLang = null;
const langListeners = new Set();
const langStore = {
  subscribe(cb) { langListeners.add(cb); return () => langListeners.delete(cb); },
  server: () => 'ro',
  get() {
    if (currentLang) return currentLang;
    let l = null;
    try { l = localStorage.getItem(LANG_KEY); } catch { /* fără stocare */ }
    if (!LANGS.some((x) => x.key === l)) {
      const list = (navigator.languages || [navigator.language || '']).map((x) => x.toLowerCase());
      if (list.some((x) => x.startsWith('ro'))) l = 'ro';
      else if (list[0]?.startsWith('el')) l = 'el';
      else l = 'en';
    }
    currentLang = l;
    return l;
  },
  set(l) {
    currentLang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch { /* fără stocare */ }
    langListeners.forEach((cb) => cb());
  },
};

/* ---------------- iconițe ---------------- */

const Icon = {
  phone: <path d="M6.6 3.5h2.6l1.4 4-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6A2 2 0 0 1 18.4 20 15.5 15.5 0 0 1 4 5.6a2 2 0 0 1 2-2.1Z" />,
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0 1 19 0" />
      <path d="M5.8 12.4a9.2 9.2 0 0 1 12.4 0" />
      <path d="M9.2 15.8a4.4 4.4 0 0 1 5.6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="4.6" r="2" />
      <path d="M12 6.6V20.5M8.2 10h7.6" />
      <path d="M4.8 13.2c.4 4.3 3.4 7 7.2 7.3 3.8-.3 6.8-3 7.2-7.3" />
      <path d="M3.4 14.6 4.8 13.2l1.4 1.4M17.8 14.6l1.4-1.4 1.4 1.4" />
    </>
  ),
  facebook: <path d="M14.5 8.5H17V5h-2.5C11.9 5 10 6.9 10 9.5V11H8v3.5h2V21h3.5v-6.5H16l.5-3.5h-3V9.5c0-.6.4-1 1-1Z" fill="currentColor" stroke="none" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: <path d="M15.5 3c.3 2.3 1.8 4 4 4.3v3.1c-1.4 0-2.8-.4-4-1.2v6c0 3.1-2.5 5.3-5.4 5.3S5 18.2 5 15.2c0-3.2 2.8-5.6 6-5.2v3.2c-1.4-.3-2.8.6-2.8 2 0 1.2 1 2.1 2.1 2.1 1.3 0 2.2-1 2.2-2.3V3h3Z" fill="currentColor" stroke="none" />,
};

function Svg({ name, size = 20, stroke = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Icon[name]}
    </svg>
  );
}

/* ---------------- steaguri (rotunde, pentru alegerea limbii) ---------------- */

const FLAGS = {
  ro: (
    <>
      <rect width="8" height="24" fill="#002B7F" />
      <rect x="8" width="8" height="24" fill="#FCD116" />
      <rect x="16" width="8" height="24" fill="#CE1126" />
    </>
  ),
  en: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#fff" strokeWidth="4.8" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="8" />
      <path d="M12 0v24M0 12h24" stroke="#C8102E" strokeWidth="4.8" />
    </>
  ),
  el: (
    <>
      <rect width="24" height="24" fill="#fff" />
      {[0, 2, 4, 6, 8].map((i) => <rect key={i} y={i * (24 / 9)} width="24" height={24 / 9} fill="#0D5EAF" />)}
      <rect width={(24 / 9) * 5} height={(24 / 9) * 5} fill="#0D5EAF" />
      <rect x={(24 / 9) * 2} width={24 / 9} height={(24 / 9) * 5} fill="#fff" />
      <rect y={(24 / 9) * 2} width={(24 / 9) * 5} height={24 / 9} fill="#fff" />
    </>
  ),
};

function Flag({ lang }) {
  return (
    <svg className="flag" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {FLAGS[lang]}
    </svg>
  );
}

/* ---------------- poză: previzualizare estompată -> poză clară ---------------- */

function Photo({ folder, file, kind = 'l', alt = '', eager = false, imgRef }) {
  const { src, blur } = photoSrc(folder, file, kind);
  const [state, setState] = useState('loading');
  const ref = useCallback((node) => {
    if (imgRef) imgRef.current = node;
    if (node && node.complete && node.naturalWidth) setState('loaded');
  }, [imgRef]);
  if (state === 'error') return null;
  return (
    <span className="photo" style={blur ? { '--blur': `url(${blur})` } : undefined}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={`fade-img ${state === 'loaded' ? 'is-loaded' : ''}`}
        onLoad={() => setState('loaded')}
        onError={() => setState('error')}
      />
    </span>
  );
}

/* ---------------- program: deschis / închis ---------------- */

function useOpenStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const tick = () => {
      const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
      const [h, m] = t.split(':').map(Number);
      const mins = h * 60 + m;
      const open = mins >= OPEN_H * 60 && mins < CLOSE_H * 60;
      setStatus({ open, soon: open && mins >= CLOSE_H * 60 - 45 });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/* ---------------- fișa produsului ---------------- */

const CLOSE_MS = 280;

function ProductSheet({ item, open, lang, onClose, onClosed }) {
  const t = UI[lang];
  const { product, category, photo } = item;
  const kind = kindOf(category);
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);

  const { name, desc } = productText(product, lang, kind);
  const nutrition = parseNutrition(product.declaratie_nutritionala, t.nutri, LANGS.find((l) => l.key === lang)?.locale);
  const allergens = splitAllergens(product.alergeni);
  const weight = product.gramaj > 0 ? `${product.gramaj} ${unitFor(category)}` : null;
  const thumbSrc = photo ? photoSrc('produse', photo, 't').src : null;

  // Blocăm derularea paginii din spate în același cadru în care apare fișa (nu în timpul animației).
  useIsoLayoutEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Demontare după animația de închidere.
  useEffect(() => {
    if (open) return;
    const id = setTimeout(onClosed, CLOSE_MS + 40);
    return () => clearTimeout(id);
  }, [open, onClosed]);

  // Tragere în jos pentru închidere — de oriunde din fișă, când e derulată sus.
  // Mișcăm direct elementul (fără re-randare React), ca să urmărească degetul fără întârziere.
  useEffect(() => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet) return;
    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let v = 0;
    let dy = 0;
    let tracking = false;
    let dragging = false;

    const setPos = (y) => {
      sheet.style.transform = `translate3d(0, ${y}px, 0)`;
      if (backdrop) backdrop.style.opacity = String(Math.max(0, 1 - y / (sheet.offsetHeight || 600)));
    };
    const start = (y) => {
      startY = lastY = y;
      lastT = performance.now();
      v = 0;
      dy = 0;
      tracking = true;
      dragging = false;
    };
    const move = (y, e) => {
      if (!tracking) return;
      const now = performance.now();
      v = (y - lastY) / Math.max(1, now - lastT);
      lastY = y;
      lastT = now;
      dy = y - startY;
      if (!dragging) {
        if (sheet.scrollTop <= 0 && dy > 6) {
          dragging = true;
          startY = y; // fără salt la începutul tragerii
          dy = 0;
          sheet.style.transition = 'none';
          if (backdrop) backdrop.style.transition = 'none';
        } else if (dy < -6 || sheet.scrollTop > 0) {
          tracking = false; // derulare normală a fișei
          return;
        } else {
          return;
        }
      }
      if (e?.cancelable) e.preventDefault();
      setPos(Math.max(0, dy));
    };
    const end = () => {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;
      const ease = 'cubic-bezier(0.32, 0.72, 0, 1)';
      if (dy > 110 || v > 0.45) {
        // continuăm mișcarea din locul unde a rămas degetul
        const ms = Math.max(160, Math.min(CLOSE_MS, ((sheet.offsetHeight - dy) / Math.max(v, 1.2))));
        sheet.style.transition = `transform ${ms}ms ${ease}`;
        sheet.style.transform = 'translate3d(0, 100%, 0)';
        if (backdrop) {
          backdrop.style.transition = `opacity ${ms}ms ease`;
          backdrop.style.opacity = '0';
        }
        onClose();
      } else {
        sheet.style.transition = `transform 380ms ${ease}`;
        sheet.style.transform = '';
        if (backdrop) {
          backdrop.style.transition = 'opacity 300ms ease';
          backdrop.style.opacity = '';
        }
      }
    };

    const onTouchStart = (e) => start(e.touches[0].clientY);
    const onTouchMove = (e) => move(e.touches[0].clientY, e);
    const onMouseDown = (e) => {
      if (e.button !== 0 || !e.target.closest('.sheet-grab')) return;
      start(e.clientY);
      const mm = (ev) => move(ev.clientY, ev);
      const mu = () => { end(); window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
    };
    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', end);
    sheet.addEventListener('touchcancel', end);
    sheet.addEventListener('mousedown', onMouseDown);
    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', end);
      sheet.removeEventListener('touchcancel', end);
      sheet.removeEventListener('mousedown', onMouseDown);
    };
  }, [onClose]);

  return (
    <div className={`sheet-layer ${open ? 'is-open' : ''}`}>
      <div ref={backdropRef} className="sheet-backdrop" onClick={onClose} />
      <div ref={sheetRef} className="sheet" role="dialog" aria-modal="true" aria-label={name}>
        <div className={`sheet-grab ${photo ? 'has-photo' : ''}`}>
          <span className="sheet-handle" />
          {photo && (
            <div className="sheet-photo" style={thumbSrc ? { backgroundImage: `url(${thumbSrc})` } : undefined}>
              <Photo folder="produse" file={photo} kind="l" alt={name} eager />
            </div>
          )}
        </div>
        <button className="sheet-close" onClick={onClose} aria-label={t.close}>
          <Svg name="close" size={18} />
        </button>

        <div className="sheet-body">
          <p className="eyebrow">{categoryName(category, lang)}</p>
          <h2 className="sheet-title">{name}</h2>
          <div className="sheet-meta">
            <span className="sheet-price">{Math.floor(product.pret)} <small>lei</small></span>
            {weight && <span className="sheet-weight">{weight}</span>}
          </div>
          {desc && <p className="sheet-desc">{desc}</p>}

          {allergens.length > 0 && (
            <div className="sheet-block">
              <h3>{t.allergens}</h3>
              <ul className="allergen-list">
                {allergens.map((a) => <li key={a}>{allergenName(a, lang)}</li>)}
              </ul>
            </div>
          )}

          {kind === 'mancare' && (
            <div className="sheet-block">
              <h3>{t.nutrition} <span>{t.per100}</span></h3>
              {nutrition.length > 0 ? (
                <dl className="nutri">
                  {nutrition.map((n) => (
                    <div key={n.key} className={`${n.sub ? 'is-sub' : ''} ${n.main ? 'is-main' : ''}`}>
                      <dt>{n.label}</dt>
                      <dd>{n.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="sheet-note">{t.unavailable}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- un rând din meniu ---------------- */

// memo: rândurile nu se redesenează când se deschide/închide fișa (animație fluidă).
const Dish = memo(function Dish({ product, category, lang, eager, onOpen, showCategory }) {
  const kind = kindOf(category);
  const photo = realPhoto(product.imagine_url);
  const weight = product.gramaj > 0 ? `${product.gramaj} ${unitFor(category)}` : null;
  const { name, desc } = productText(product, lang, kind);
  const tappable = kind === 'mancare' || photo || desc;
  const inner = (
    <>
      <div className="dish-text">
        {showCategory && <p className="dish-cat">{categoryName(category, lang)}</p>}
        <h3 className="dish-name">{name}</h3>
        {desc && <p className="dish-desc">{desc}</p>}
        <div className="dish-meta">
          <span className="dish-price">{Math.floor(product.pret)} <small>lei</small></span>
          {weight && <span className="dish-weight">{weight}</span>}
        </div>
      </div>
      {photo && (
        <div className="dish-thumb">
          <Photo folder="produse" file={photo} kind="t" eager={eager} />
        </div>
      )}
    </>
  );
  return (
    <li>
      {tappable ? (
        <button
          className="dish"
          aria-haspopup="dialog"
          onClick={() => onOpen(product, category, photo)}
        >
          {inner}
        </button>
      ) : (
        <div className="dish">{inner}</div>
      )}
    </li>
  );
});

/* ---------------- meniul ---------------- */

export default function Menu({ initial }) {
  const [data, setData] = useState(() => sortMenu(initial));
  const lang = useSyncExternalStore(langStore.subscribe, langStore.get, langStore.server);
  const [activeType, setActiveType] = useState('mancare');
  const [activeCat, setActiveCat] = useState(null);
  const [stuck, setStuck] = useState(false);
  const [sheet, setSheet] = useState(null); // { product, category, photo }
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [pill, setPill] = useState(null);
  const status = useOpenStatus();
  const t = UI[lang];
  const hasData = Boolean(data);

  const navRef = useRef(null);
  const sentinelRef = useRef(null);
  const chipsRef = useRef(null);
  const searchRef = useRef(null);
  const scrollLock = useRef(false);

  // Dacă serverul n-a putut citi meniul, îl cerem din browser.
  useEffect(() => {
    if (data) return;
    fetch('/api/meniu')
      .then((r) => r.json())
      .then((raw) => setData(sortMenu(raw.error ? { categorii: [], produse: [] } : raw)))
      .catch(() => setData({ categories: [], products: [] }));
  }, [data]);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const categories = useMemo(() => data?.categories || [], [data]);
  const products = useMemo(() => data?.products || [], [data]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const sections = useMemo(() => categories
    .filter((c) => kindOf(c) === activeType)
    .map((c) => ({ category: c, products: products.filter((p) => p.categorie_id === c.id) }))
    .filter((s) => s.products.length > 0), [categories, products, activeType]);

  const sectionKey = sections.map((s) => s.category.id).join(',');

  // Căutare în toate limbile, fără diacritice.
  const haystacks = useMemo(() => new Map(products.map((p) => [p.id, searchHaystack(p, kindOf(catById.get(p.categorie_id)))])), [products, catById]);
  const q = fold(query);
  const results = useMemo(() => {
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = products.filter((p) => catById.has(p.categorie_id) && terms.every((term) => haystacks.get(p.id)?.includes(term)));
    // întâi produsele care au cuvântul în nume, apoi cele care îl au doar în descriere
    const inName = (p) => (terms.every((term) => fold(productText(p, lang, kindOf(catById.get(p.categorie_id))).name).includes(term)) ? 0 : 1);
    return hits.map((p, i) => [inName(p), i, p]).sort((x, y) => x[0] - y[0] || x[1] - y[1]).map((x) => x[2]);
  }, [q, products, haystacks, catById, lang]);

  useIsoLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const set = () => document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [hasData]);

  useEffect(() => {
    const s = sentinelRef.current;
    if (!s) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    io.observe(s);
    return () => io.disconnect();
  }, [hasData]);

  // Scrollspy: categoria în care te afli se aprinde în bară.
  useEffect(() => {
    if (!data || q) return;
    let raf = 0;
    let idle = 0;
    const ids = sectionKey ? sectionKey.split(',') : [];
    const update = () => {
      if (scrollLock.current) {
        clearTimeout(idle);
        idle = setTimeout(() => { scrollLock.current = false; update(); }, 160);
        return;
      }
      const navH = navRef.current?.offsetHeight || 0;
      let current = ids[0] || null;
      for (const id of ids) {
        const el = document.getElementById(`cat-${id}`);
        if (el && el.getBoundingClientRect().top - navH - 32 <= 0) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      setActiveCat((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [data, sectionKey, q]);

  // Pastila categoriei active alunecă sub chip, iar chip-ul se centrează.
  useIsoLayoutEffect(() => {
    const box = chipsRef.current;
    if (!box) return;
    const place = () => {
      const chip = box.querySelector(`[data-id="${activeCat}"]`);
      if (!chip) { setPill(null); return; }
      setPill({ x: chip.offsetLeft, w: chip.offsetWidth });
      const target = chip.offsetLeft - (box.clientWidth - chip.offsetWidth) / 2;
      box.scrollTo({ left: Math.max(0, target), behavior: reducedMotion() ? 'auto' : 'smooth' });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => ro.disconnect();
  }, [activeCat, sectionKey, lang, searching]);

  // Butonul „înapoi” al telefonului închide fișa produsului.
  useEffect(() => {
    const onPop = () => setSheetOpen(false);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const menuTop = () => {
    const s = sentinelRef.current;
    return s ? s.getBoundingClientRect().top + window.scrollY : 0;
  };
  const scrollToMenu = () => {
    const top = menuTop();
    if (window.scrollY > top) window.scrollTo({ top });
  };

  const switchType = (key) => {
    if (key === activeType) return;
    setActiveType(key);
    setActiveCat(null);
    scrollToMenu();
  };

  const goToCategory = (id) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    setActiveCat(String(id));
    scrollLock.current = true;
    const navH = navRef.current?.offsetHeight || 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH + 1, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const openSearch = () => {
    setSearching(true);
    const top = menuTop();
    if (window.scrollY < top) window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
    requestAnimationFrame(() => searchRef.current?.focus());
  };
  const closeSearch = () => {
    setSearching(false);
    setQuery('');
  };

  const closedSheet = useCallback(() => setSheet(null), []);

  const openProduct = useCallback((product, category, photo) => {
    window.history.pushState({ sheet: product.id }, '');
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); // închide tastatura căutării
    setSheet({ product, category, photo });
    requestAnimationFrame(() => requestAnimationFrame(() => setSheetOpen(true)));
  }, []);

  const closeProduct = useCallback(() => {
    if (window.history.state?.sheet) window.history.back();
    else setSheetOpen(false);
  }, []);

  const copyWifi = async () => {
    try {
      await navigator.clipboard.writeText(WIFI);
      setToast(t.wifiCopied);
    } catch {
      setToast(t.wifiPass(WIFI));
    }
  };

  if (!data) {
    return (
      <div className="loading-screen">
        <img src="/photos/header/logo.png" alt="" className="loading-logo" />
      </div>
    );
  }

  const typeIndex = TYPE_KEYS.indexOf(activeType);
  const coverPhoto = photoSrc('cover', 'cover1.jpg', 'l');
  const statusText = status
    ? status.open
      ? (status.soon ? t.soon : t.open)(`${CLOSE_H}:00`)
      : t.closed(`${OPEN_H}:00`)
    : t.hours(`${OPEN_H}:00`, `${CLOSE_H}:00`);

  return (
    <div className="page">
      <div className="app" lang={lang}>
        {/* ---------- prezentare ---------- */}
        <header className="hero">
          <div className="hero-media" aria-hidden="true" style={coverPhoto.blur ? { '--blur': `url(${coverPhoto.blur})` } : undefined}>
            <img src={coverPhoto.src} alt="" fetchPriority="high" />
          </div>

          <div className="lang-switch" role="group" aria-label={t.language}>
            {LANGS.map((l) => (
              <button
                key={l.key}
                lang={l.key}
                className={l.key === lang ? 'active' : ''}
                aria-pressed={l.key === lang}
                aria-label={l.name}
                onClick={() => langStore.set(l.key)}
              >
                <Flag lang={l.key} />
              </button>
            ))}
          </div>

          <div className="hero-body">
            <img src="/photos/header/logo.png" alt="Taverna La Zavat" className="hero-logo" />
            <h1 className="hero-title">Taverna La Zavat</h1>
            <p className="hero-sub">{t.sub}</p>

            <p className={`status ${status ? (status.open ? 'is-open' : 'is-closed') : ''}`}>
              <i aria-hidden="true" />
              {statusText}
            </p>

            <div className="actions">
              <a className="action" href={`tel:${PHONE}`} aria-label={`${t.call} ${PHONE_LABEL}`}>
                <Svg name="phone" />
                <span>{t.call}</span>
              </a>
              <button className="action" onClick={copyWifi} aria-label={t.wifiPass(WIFI)}>
                <Svg name="wifi" />
                <span>{t.wifi}</span>
                <small>{WIFI}</small>
              </button>
              <a className="action" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                <Svg name="pin" />
                <span>{t.map}</span>
              </a>
            </div>

            <div className="socials">
              <a href="https://www.facebook.com/taverna.lazavat" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Svg name="facebook" size={19} /></a>
              <a href="https://www.instagram.com/la_zavat/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Svg name="instagram" size={19} /></a>
              <a href="https://www.tiktok.com/@tavernalazavat" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><Svg name="tiktok" size={19} /></a>
            </div>
          </div>
        </header>

        <div className="ornament" aria-hidden="true"><Svg name="anchor" size={22} stroke={1.4} /></div>

        {/* ---------- bara fixă ---------- */}
        <div ref={sentinelRef} className="nav-sentinel" aria-hidden="true" />
        <nav ref={navRef} className={`menu-nav ${stuck ? 'is-stuck' : ''} ${searching ? 'is-searching' : ''}`} aria-label="Meniu">
          <div className="nav-row">
            {searching ? (
              <div className="search-field">
                <Svg name="search" size={18} />
                <input
                  ref={searchRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={t.searchPh}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); scrollToMenu(); }}
                  onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); if (e.key === 'Enter') e.currentTarget.blur(); }}
                  aria-label={t.search}
                />
                {query && (
                  <button className="search-clear" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label={t.close}>
                    <Svg name="close" size={14} stroke={2.2} />
                  </button>
                )}
              </div>
            ) : (
              <div className="seg" style={{ '--i': typeIndex }} role="tablist">
                <span className="seg-pill" aria-hidden="true" />
                {TYPE_KEYS.map((key) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={activeType === key}
                    className={`seg-btn ${activeType === key ? 'active' : ''}`}
                    onClick={() => switchType(key)}
                  >
                    {t.types[key]}
                  </button>
                ))}
              </div>
            )}
            {searching ? (
              <button className="search-cancel" onClick={closeSearch}>{t.cancel}</button>
            ) : (
              <button className="search-btn" onClick={openSearch} aria-label={t.search}>
                <Svg name="search" size={20} />
              </button>
            )}
          </div>

          {!searching && (
            <div className="chips" ref={chipsRef}>
              {pill && <span className="chip-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden="true" />}
              {sections.map(({ category }) => (
                <button
                  key={category.id}
                  data-id={category.id}
                  className={`chip ${String(category.id) === String(activeCat) ? 'active' : ''}`}
                  onClick={() => goToCategory(category.id)}
                >
                  {categoryName(category, lang)}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* ---------- rezultate căutare sau meniul ---------- */}
        {q ? (
          <main className="menu results" key="results">
            {results.length > 0 ? (
              <ul className="dishes">
                {results.map((p) => (
                  <Dish key={p.id} product={p} category={catById.get(p.categorie_id)} lang={lang} onOpen={openProduct} showCategory />
                ))}
              </ul>
            ) : (
              <p className="empty-message">{t.noResults(query.trim())}</p>
            )}
          </main>
        ) : (
          <main className="menu" key={activeType}>
            {sections.map(({ category, products: list }, si) => (
              <section key={category.id} id={`cat-${category.id}`} className="section" aria-labelledby={`h-${category.id}`}>
                <div className="section-banner">
                  <Photo folder="categorii" file={clean(category.imagine_url)} kind="l" eager={si < 2} />
                  <h2 id={`h-${category.id}`}>{categoryName(category, lang)}</h2>
                </div>
                <ul className="dishes">
                  {list.map((p, i) => (
                    <Dish key={p.id} product={p} category={category} lang={lang} eager={si === 0 && i < 4} onOpen={openProduct} />
                  ))}
                </ul>
                {si < sections.length - 1 && <div className="rope" aria-hidden="true" />}
              </section>
            ))}
            {sections.length === 0 && <p className="empty-message">{t.empty}</p>}
            <div className="ornament end" aria-hidden="true"><Svg name="anchor" size={22} stroke={1.4} /></div>
          </main>
        )}
      </div>

      {sheet && (
        <ProductSheet item={sheet} open={sheetOpen} lang={lang} onClose={closeProduct} onClosed={closedSheet} />
      )}

      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
