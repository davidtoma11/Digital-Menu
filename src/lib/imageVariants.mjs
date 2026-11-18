// Variante optimizate pentru pozele meniului (WebP mic pentru listă, mare pentru fișă)
// + o previzualizare minusculă, estompată, care apare instant până se încarcă poza.
//
// Rezultatul: public/photos/v/<folder>/<nume>-t.webp / -l.webp și src/lib/images.json.
// Folosit de scripts/images.mjs (predev/prebuild) și de ruta de upload din admin.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const PHOTOS = path.join(ROOT, 'public', 'photos');
const OUT = path.join(PHOTOS, 'v');
const MANIFEST = path.join(ROOT, 'src', 'lib', 'images.json');
const PLACEHOLDERS = path.join(ROOT, 'src', 'lib', 'placeholders.json');

// t = listă (pătrat 96px pe ecran), l = fișă / banner
const SPECS = {
  produse: { t: { width: 360, height: 270, quality: 70 }, l: { width: 1080, height: 810, quality: 78 } },
  categorii: { l: { width: 1000, quality: 74 } },
  cover: { l: { width: 1400, quality: 76 } },
};

const IMG = /\.(jpe?g|png|webp)$/i;

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    return null;
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const exists = (p) => fs.access(p).then(() => true, () => false);
const baseOf = (file) => file.replace(IMG, '');

async function build(sharp, folder, file, buf) {
  const spec = SPECS[folder];
  const outDir = path.join(OUT, folder);
  await fs.mkdir(outDir, { recursive: true });
  const entry = {};
  for (const [kind, s] of Object.entries(spec)) {
    const img = sharp(buf).rotate();
    const resized = s.height
      ? img.resize(s.width, s.height, { fit: 'cover', withoutEnlargement: false })
      : img.resize({ width: s.width, withoutEnlargement: true });
    await resized.webp({ quality: s.quality, effort: 5 }).toFile(path.join(outDir, `${baseOf(file)}-${kind}.webp`));
    entry[kind] = 1;
  }
  const blur = await sharp(buf).rotate().resize(16, 12, { fit: 'cover' }).webp({ quality: 40 }).toBuffer();
  entry.b = `data:image/webp;base64,${blur.toString('base64')}`;
  return entry;
}

async function variantsExist(folder, file) {
  for (const kind of Object.keys(SPECS[folder])) {
    if (!(await exists(path.join(OUT, folder, `${baseOf(file)}-${kind}.webp`)))) return false;
  }
  return true;
}

/** Actualizează (sau creează) variantele unei singure poze. */
export async function updateImage(folder, file) {
  if (!SPECS[folder] || !IMG.test(file)) return false;
  const sharp = await loadSharp();
  if (!sharp) return false;
  const manifest = await readJson(MANIFEST, {});
  const buf = await fs.readFile(path.join(PHOTOS, folder, file));
  const v = crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
  manifest[`${folder}/${file}`] = { v, ...(await build(sharp, folder, file, buf)) };
  await fs.writeFile(MANIFEST, JSON.stringify(sortKeys(manifest), null, 0) + '\n');
  return true;
}

/** Sincronizează toate pozele: generează ce lipsește sau s-a schimbat, șterge ce nu mai există. */
export async function syncAll({ log = console.log } = {}) {
  const sharp = await loadSharp();
  const manifest = await readJson(MANIFEST, {});
  if (!sharp) {
    log('images: sharp indisponibil — păstrez variantele existente');
    return { changed: 0 };
  }
  const placeholders = new Set(await readJson(PLACEHOLDERS, []));
  const next = {};
  let changed = 0;

  for (const folder of Object.keys(SPECS)) {
    let files = [];
    try {
      files = (await fs.readdir(path.join(PHOTOS, folder))).filter((f) => IMG.test(f));
    } catch {
      continue;
    }
    for (const file of files) {
      if (folder === 'produse' && placeholders.has(file)) continue;
      const key = `${folder}/${file}`;
      const buf = await fs.readFile(path.join(PHOTOS, folder, file));
      const v = crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
      const old = manifest[key];
      if (old && old.v === v && old.b && (await variantsExist(folder, file))) {
        next[key] = old;
        continue;
      }
      try {
        next[key] = { v, ...(await build(sharp, folder, file, buf)) };
        changed++;
      } catch (e) {
        log(`images: nu am putut procesa ${key}: ${e.message}`);
      }
    }
  }

  const removed = Object.keys(manifest).filter((k) => !next[k]).length;
  if (changed || removed || Object.keys(manifest).length !== Object.keys(next).length) {
    await fs.writeFile(MANIFEST, JSON.stringify(sortKeys(next), null, 0) + '\n');
  }
  log(`images: ${Object.keys(next).length} poze optimizate (${changed} noi/actualizate${removed ? `, ${removed} scoase` : ''})`);
  return { changed, removed };
}

function sortKeys(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
}
