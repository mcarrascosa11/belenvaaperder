import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const empty = { Marcos: Array(7).fill(null), Belén: Array(7).fill(null) };
const key = 'https://raw.githubusercontent.com/mcarrascosa11/belenvaaperder/main/data/state.json';

export async function GET() {
  try {
    const res = await fetch(key, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json(empty);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(empty);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await put('challenge/state.json', JSON.stringify(body), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }
}
