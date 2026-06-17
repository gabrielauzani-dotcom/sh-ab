import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET /api/track?exp=<experimentId>&v=<A|B>&t=<view|click>&sid=<sessionId>
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const experimentId = searchParams.get('exp');
  const variant = searchParams.get('v');
  const type = searchParams.get('t');
  const sessionId = searchParams.get('sid');

  if (experimentId && variant && type && sessionId) {
    try {
      // Para views: evita duplicata da mesma sessão no mesmo experimento
      if (type === 'view') {
        const exists = await (prisma as any).trackEvent.findFirst({
          where: { experimentId, sessionId, type: 'view' },
        });
        if (!exists) {
          await (prisma as any).trackEvent.create({
            data: { experimentId, variant, type, sessionId },
          });
        }
      } else {
        await (prisma as any).trackEvent.create({
          data: { experimentId, variant, type, sessionId },
        });
      }
    } catch {
      // Silencioso — nunca quebrar a loja do cliente por erro de tracking
    }
  }

  // Retorna pixel 1x1 transparente
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  return new Response(pixel, {
    headers: { ...CORS, 'Content-Type': 'image/gif' },
  });
}
