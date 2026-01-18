import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let db;
  try {
    const body = await request.json();
    const { table, id, data, password } = body; 
    

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Parola incorecta!" }, { status: 401 });
    }

    db = await createConnection();

  
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    await db.execute(query, [...values, id]);

    await db.end();
    return NextResponse.json({ success: true });

  } catch (error) {
    if (db) await db.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}