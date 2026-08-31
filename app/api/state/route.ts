import { NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

const KEY = 'challenge/state.json';
const empty = { Marcos: Array(7).fill(null), Belén: Array(7).fill(null) };

export async function GET() {
  try {
    const { blobs } = await list({ prefix: KEY });
    if (!blobs[0]) return NextResponse.json(empty);
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(empty);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await put(KEY, JSON.stringify(body), { access: 'public', addRandomSuffix: false, contentType: 'application/json', allowOverwrite: true });
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }
}
