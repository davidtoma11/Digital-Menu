// Rulat automat înainte de `npm run dev` și `npm run build`.
// Creează variantele WebP + previzualizările estompate (vezi src/lib/imageVariants.mjs).
import { syncAll } from '../src/lib/imageVariants.mjs';

syncAll().catch((e) => {
  // Nu oprim build-ul: meniul folosește pozele originale dacă variantele lipsesc.
  console.warn('images: eroare, continui fără variante noi:', e.message);
});
