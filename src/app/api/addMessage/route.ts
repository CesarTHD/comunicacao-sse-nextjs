import { NextRequest, NextResponse } from 'next/server';
import { addMessageToQueue } from '../sse/route';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { utmSource, message } = data;

  if (utmSource && message) {
    addMessageToQueue(utmSource, message);
    return NextResponse.json({ status: 'Message added to queue' });
  } else {
    return NextResponse.json({ status: 'Missing utmSource or message' }, { status: 400 });
  }
}
