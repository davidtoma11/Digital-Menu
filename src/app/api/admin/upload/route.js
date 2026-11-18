import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'node:path';

const FOLDERS = new Set(['produse', 'categorii', 'header', 'cover']);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder');
    const rawName = formData.get('fileName');

    if (!file || !rawName || !FOLDERS.has(folder)) {
      return NextResponse.json({ error: "Lipsesc date." }, { status: 400 });
    }
    // doar numele fișierului, fără căi (../ etc.)
    const fileName = path.basename(String(rawName).trim());

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), 'public', 'photos', folder);
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    // Poza nu mai e placeholder: o scoatem din listă, ca meniul să o afișeze imediat.
    if (folder === 'produse') {
      const listPath = path.join(process.cwd(), 'src', 'lib', 'placeholders.json');
      try {
        const list = JSON.parse(await fs.readFile(listPath, 'utf8'));
        if (list.includes(fileName)) {
          await fs.writeFile(listPath, JSON.stringify(list.filter(f => f !== fileName)) + '\n');
        }
      } catch { /* lista lipsește: se regenerează la următorul dev/build */ }
    }

    // Variantele rapide (WebP + previzualizare estompată) pentru meniu.
    try {
      const { updateImage } = await import('@/lib/imageVariants.mjs');
      await updateImage(folder, fileName);
    } catch (e) {
      console.warn('Variante poză nereușite:', e.message);
    }
    revalidatePath('/');

    return NextResponse.json({ success: true, message: "Imagine actualizata!" });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Eroare la scriere fisier" }, { status: 500 });
  }
}
