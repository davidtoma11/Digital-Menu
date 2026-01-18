import { createConnection } from '@/lib/db'; 
import { NextResponse } from 'next/server';

export async function POST(request) {
  let db;
  try {
    const body = await request.json();
    const { items, table } = body; 
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    db = await createConnection();

    for (const item of items) {
      await db.execute(`UPDATE ${table} SET ordine = ? WHERE id = ?`, [item.ordine, item.id]);
    }

    await db.end();
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Eroare la reordonare:", error);
    if (db) await db.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}