import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_PAGES } from '@/lib/pageContent';

const DATA_FILE = path.join(process.cwd(), 'data', 'pages.json');

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return NextResponse.json({ ...DEFAULT_PAGES, ...saved });
    }
  } catch (e) {}
  return NextResponse.json(DEFAULT_PAGES);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
