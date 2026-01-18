import { createConnection } from '../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    console.log("--> Încerc conectarea la baza de date..."); 
    const db = await createConnection();
    console.log("--> Conectat! Citesc datele...");

    const [categorii] = await db.execute('SELECT * FROM categorii');
    
    const [produse] = await db.execute('SELECT * FROM produse');

    console.log(`--> Succes! Am găsit ${categorii.length} categorii și ${produse.length} produse.`);
    
    await db.end();

    return NextResponse.json({ categorii, produse });

  } catch (error) {
    console.error("!!! EROARE SERVER !!!", error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}