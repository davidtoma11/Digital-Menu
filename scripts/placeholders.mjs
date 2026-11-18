// Găsește pozele „placeholder” din public/photos/produse (același fișier copiat
// la multe produse) și scrie lista în src/lib/placeholders.json.
// Produsele cu poză placeholder sunt afișate în meniu fără imagine.
// Rulează automat înainte de `npm run dev` și `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = path.join(process.cwd(), 'public/photos/produse');
const out = path.join(process.cwd(), 'src/lib/placeholders.json');
const MIN_COPIES = 3; // un fișier identic la cel puțin 3 produse = placeholder

const byHash = new Map();
for (const file of fs.readdirSync(dir)) {
  if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
  const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(dir, file))).digest('hex');
  if (!byHash.has(hash)) byHash.set(hash, []);
  byHash.get(hash).push(file);
}

const placeholders = [...byHash.values()].filter((files) => files.length >= MIN_COPIES).flat().sort();
fs.writeFileSync(out, JSON.stringify(placeholders, null, 0) + '\n');
console.log(`placeholders: ${placeholders.length} poze fără fotografie reală`);
