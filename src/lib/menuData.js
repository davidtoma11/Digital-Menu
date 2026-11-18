// Citirea meniului direct din baza de date, pe server (pagina vine gata randată).
import { createConnection } from './db';

export async function getMenu() {
  let db;
  try {
    db = await createConnection();
    const [categorii] = await db.execute('SELECT * FROM categorii');
    const [produse] = await db.execute('SELECT * FROM produse');
    return JSON.parse(JSON.stringify({ categorii, produse }));
  } catch (e) {
    console.error('getMenu:', e.message);
    return null; // pagina încearcă din nou din browser
  } finally {
    try { await db?.end(); } catch { /* ignorăm */ }
  }
}
