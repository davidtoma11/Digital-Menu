import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

// Lista curentă a pozelor „placeholder” (citită de pe disc, nu din bundle),
// ca Studio poze să știe ce produse au deja o poză reală.
export async function GET() {
  try {
    const file = path.join(process.cwd(), 'src', 'lib', 'placeholders.json');
    const list = JSON.parse(await fs.readFile(file, 'utf8'));
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}
