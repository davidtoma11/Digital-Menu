// Formatare comună pentru meniul public și previzualizarea din Studio poze.

const LOWER = new Set(['si', 'și', 'cu', 'de', 'la', 'in', 'în', 'pe', 'din', 'fara', 'fără', 'lui', 'a', 'al', 'si/sau']);
const KEEP = new Set(['AOP', 'VS', 'EDT', 'XO', 'BBQ']);

const cap = (w) => w.replace(/\p{L}/u, (c) => c.toUpperCase());

// Numele din baza de date sunt cu majuscule. Mâncarea primește „Sentence case”
// (cum se scrie în română), băuturile „Title Case” (sunt nume de mărci).
export function displayName(raw, kind = 'mancare') {
  const words = String(raw || '').trim().replace(/\s+/g, ' ').split(' ');
  return words
    .map((w, i) => {
      if (KEEP.has(w) || /\d/.test(w)) return w;
      const lower = w.toLocaleLowerCase('ro');
      if (i === 0 || words[i - 1] === '/' || words[i - 1] === '-') return cap(lower);
      if (kind === 'mancare') return lower;
      return LOWER.has(lower) ? lower : cap(lower);
    })
    .join(' ');
}

export const kindOf = (cat) => (cat?.tip || '').toLowerCase().trim();
export const unitFor = (cat) => (kindOf(cat) === 'mancare' ? 'g' : 'ml');
export const clean = (s) => String(s || '').trim();

const num = (n, locale, digits = 1) =>
  Number(n).toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 });

// "Energie: 464.13kcal, Grasimi: 37.59g, ..." -> [{key:'energie', label:'Energie', value:'464 kcal', main:true}, ...]
const KEYS = {
  energie: 'energie',
  grasimi: 'grasimi',
  'acizi grasi saturati': 'saturate',
  glucide: 'glucide',
  zaharuri: 'zaharuri',
  fibre: 'fibre',
  proteine: 'proteine',
  sare: 'sare',
};

export function parseNutrition(str, labels = {}, locale = 'ro-RO') {
  if (!str) return [];
  return String(str)
    .split(',')
    .map((part) => part.split(':').map((s) => s.trim()))
    .filter(([k, v]) => k && v)
    .map(([k, v]) => {
      const key = KEYS[k.toLowerCase()] || k.toLowerCase();
      const m = v.match(/^([\d.]+)\s*([a-zA-Z]*)$/);
      let value = v;
      if (m) {
        const unit = (m[2] || '').toLowerCase();
        value = unit === 'kcal' ? `${Math.round(Number(m[1]))} kcal` : `${num(m[1], locale)} ${unit || 'g'}`;
      }
      return { key, label: labels[key] || k, value, sub: key === 'saturate' || key === 'zaharuri', main: key === 'energie' };
    });
}

export const splitAllergens = (str) =>
  clean(str).split(/[,;]/).map((s) => s.trim()).filter(Boolean);
