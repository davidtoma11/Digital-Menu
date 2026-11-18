// Limbile meniului public: română, engleză, greacă.
import TEXT from '@/content/menuText.json';
import { displayName, clean } from '@/lib/menuFormat';

export const LANGS = [
  { key: 'ro', label: 'RO', name: 'Română', locale: 'ro-RO' },
  { key: 'en', label: 'EN', name: 'English', locale: 'en-GB' },
  { key: 'el', label: 'ΕΛ', name: 'Ελληνικά', locale: 'el-GR' },
];

export const UI = {
  ro: {
    sub: 'Bucătărie grecească & fructe de mare',
    open: (c) => `Deschis acum · până la ${c}`,
    soon: (c) => `Închidem curând · până la ${c}`,
    closed: (o) => `Închis acum · deschidem la ${o}`,
    hours: (o, c) => `Program ${o} – ${c}`,
    call: 'Sună', wifi: 'Wi-Fi', map: 'Hartă',
    wifiCopied: 'Parola Wi-Fi a fost copiată',
    wifiPass: (p) => `Parola Wi-Fi: ${p}`,
    types: { mancare: 'Mâncare', bar: 'Bar', vinuri: 'Vinuri' },
    search: 'Caută', searchPh: 'Caută un preparat sau o băutură', cancel: 'Anulează',
    noResults: (q) => `Nu am găsit nimic pentru „${q}”`,
    allergens: 'Alergeni', nutrition: 'Valori nutriționale', per100: 'la 100 g',
    unavailable: 'Informație indisponibilă momentan.',
    close: 'Închide', empty: 'Nu există produse aici momentan.', language: 'Limba',
    nutri: { energie: 'Energie', grasimi: 'Grăsimi', saturate: 'din care saturate', glucide: 'Glucide', zaharuri: 'din care zaharuri', fibre: 'Fibre', proteine: 'Proteine', sare: 'Sare' },
  },
  en: {
    sub: 'Greek cuisine & seafood',
    open: (c) => `Open now · until ${c}`,
    soon: (c) => `Closing soon · until ${c}`,
    closed: (o) => `Closed now · opens at ${o}`,
    hours: (o, c) => `Open ${o} – ${c}`,
    call: 'Call', wifi: 'Wi-Fi', map: 'Map',
    wifiCopied: 'Wi-Fi password copied',
    wifiPass: (p) => `Wi-Fi password: ${p}`,
    types: { mancare: 'Food', bar: 'Bar', vinuri: 'Wine' },
    search: 'Search', searchPh: 'Search for a dish or drink', cancel: 'Cancel',
    noResults: (q) => `Nothing found for “${q}”`,
    allergens: 'Allergens', nutrition: 'Nutrition facts', per100: 'per 100 g',
    unavailable: 'Information not available yet.',
    close: 'Close', empty: 'Nothing here yet.', language: 'Language',
    nutri: { energie: 'Energy', grasimi: 'Fat', saturate: 'of which saturates', glucide: 'Carbohydrate', zaharuri: 'of which sugars', fibre: 'Fibre', proteine: 'Protein', sare: 'Salt' },
  },
  el: {
    sub: 'Ελληνική κουζίνα & θαλασσινά',
    open: (c) => `Ανοιχτά τώρα · έως τις ${c}`,
    soon: (c) => `Κλείνουμε σύντομα · έως τις ${c}`,
    closed: (o) => `Κλειστά τώρα · ανοίγουμε στις ${o}`,
    hours: (o, c) => `Ωράριο ${o} – ${c}`,
    call: 'Κλήση', wifi: 'Wi-Fi', map: 'Χάρτης',
    wifiCopied: 'Ο κωδικός Wi-Fi αντιγράφηκε',
    wifiPass: (p) => `Κωδικός Wi-Fi: ${p}`,
    types: { mancare: 'Φαγητό', bar: 'Μπαρ', vinuri: 'Κρασιά' },
    search: 'Αναζήτηση', searchPh: 'Αναζητήστε πιάτο ή ποτό', cancel: 'Άκυρο',
    noResults: (q) => `Δεν βρέθηκε τίποτα για «${q}»`,
    allergens: 'Αλλεργιογόνα', nutrition: 'Διατροφική αξία', per100: 'ανά 100 g',
    unavailable: 'Η πληροφορία δεν είναι ακόμη διαθέσιμη.',
    close: 'Κλείσιμο', empty: 'Δεν υπάρχουν προϊόντα εδώ.', language: 'Γλώσσα',
    nutri: { energie: 'Ενέργεια', grasimi: 'Λιπαρά', saturate: 'εκ των οποίων κορεσμένα', glucide: 'Υδατάνθρακες', zaharuri: 'εκ των οποίων σάκχαρα', fibre: 'Φυτικές ίνες', proteine: 'Πρωτεΐνες', sare: 'Αλάτι' },
  },
};

// Alergenii vin din baza de date în română, fără diacritice.
const ALLERGENS = {
  lapte: ['Lapte', 'Milk', 'Γάλα'],
  gluten: ['Gluten', 'Gluten', 'Γλουτένη'],
  oua: ['Ouă', 'Eggs', 'Αυγά'],
  peste: ['Pește', 'Fish', 'Ψάρι'],
  moluste: ['Moluște', 'Molluscs', 'Μαλάκια'],
  crustacee: ['Crustacee', 'Crustaceans', 'Καρκινοειδή'],
  soia: ['Soia', 'Soy', 'Σόγια'],
  telina: ['Țelină', 'Celery', 'Σέλινο'],
  mustar: ['Muștar', 'Mustard', 'Μουστάρδα'],
  alune: ['Arahide', 'Peanuts', 'Αράπικα φιστίκια'],
  arahide: ['Arahide', 'Peanuts', 'Αράπικα φιστίκια'],
  'fructe cu coaja': ['Fructe cu coajă lemnoasă', 'Tree nuts', 'Ξηροί καρποί'],
  'fructe cu coaja (nuci)': ['Nuci', 'Walnuts', 'Καρύδια'],
  nuci: ['Nuci', 'Walnuts', 'Καρύδια'],
  susan: ['Susan', 'Sesame', 'Σουσάμι'],
  sulfiti: ['Sulfiți', 'Sulphites', 'Θειώδη'],
  lupin: ['Lupin', 'Lupin', 'Λούπινο'],
};
const LANG_INDEX = { ro: 0, en: 1, el: 2 };

/** Text fără diacritice/accente, pentru căutare și potriviri. */
export const fold = (s) =>
  String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function allergenName(raw, lang) {
  const hit = ALLERGENS[fold(raw)];
  return hit ? hit[LANG_INDEX[lang] ?? 0] : clean(raw);
}

// Textele îngrijite (src/content/menuText.json) se folosesc doar cât timp numele din
// baza de date e cel pentru care au fost scrise; dacă l-ai schimbat din admin, câștigă adminul.
export function productText(p, lang, kind) {
  const t = TEXT.products[p.id];
  const fresh = t && t.s === clean(p.nume);
  if (!fresh) return { name: displayName(p.nume, kind), desc: clean(p.ingrediente) };
  const loc = t[lang];
  const ro = t.ro || [];
  const name = (loc && loc[0]) || ro[0] || displayName(p.nume, kind);
  const desc = loc ? loc[1] || '' : ro[1] || '';
  return { name, desc };
}

export function categoryName(c, lang) {
  const t = TEXT.categories[c.id];
  if (t && t.s === clean(c.nume)) return t[lang] || t.ro;
  return clean(c.nume);
}

/** Toate textele unui produs, în toate limbile — ca să găsești „creveți” și scriind „shrimp”. */
export function searchHaystack(p, kind) {
  const t = TEXT.products[p.id];
  const parts = [p.nume, p.ingrediente];
  if (t && t.s === clean(p.nume)) {
    for (const l of ['ro', 'en', 'el']) if (t[l]) parts.push(t[l][0], t[l][1]);
  } else {
    parts.push(displayName(p.nume, kind));
  }
  return fold(parts.filter(Boolean).join(' · '));
}
