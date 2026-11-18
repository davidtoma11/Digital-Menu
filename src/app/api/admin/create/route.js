import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  let db;
  try {
    const body = await request.json();
    const { table, data, password } = body;

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Parola incorecta!" }, { status: 401 });
    }

    db = await createConnection();

    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    await db.execute(query, values);
    await db.end();

    revalidatePath('/'); // meniul public se reîmprospătează imediat

    return NextResponse.json({ success: true });

  } catch (error) {
    if (db) await db.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}