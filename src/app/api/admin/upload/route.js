import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file'); 
    const folder = formData.get('folder'); 
    const fileName = formData.get('fileName'); 

    if (!file || !fileName) {
      return NextResponse.json({ error: "Lipsesc date." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const uploadDir = path.join(process.cwd(), 'public', 'photos', folder);
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: "Imagine actualizata!" });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Eroare la scriere fisier" }, { status: 500 });
  }
}