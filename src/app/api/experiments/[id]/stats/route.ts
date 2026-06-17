import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const events: Array<{ variant: string; type: string; sessionId: string; createdAt: Date }> =
    await (prisma as any).trackEvent.findMany({
      where: { experimentId: id },
      select: { variant: true, type: true, sessionId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

  // Sessões únicas por variante
  const sessionsA = new Set(events.filter(e => e.variant === 'A').map(e => e.sessionId));
  const sessionsB = new Set(events.filter(e => e.variant === 'B').map(e => e.sessionId));

  const viewsA  = events.filter(e => e.variant === 'A' && e.type === 'view').length;
  const viewsB  = events.filter(e => e.variant === 'B' && e.type === 'view').length;
  const clicksA = events.filter(e => e.variant === 'A' && e.type === 'click').length;
  const clicksB = events.filter(e => e.variant === 'B' && e.type === 'click').length;

  const crA = viewsA > 0 ? (clicksA / viewsA) * 100 : 0;
  const crB = viewsB > 0 ? (clicksB / viewsB) * 100 : 0;
  const lift = crA > 0 ? ((crB - crA) / crA) * 100 : 0;

  // Agrupa eventos por dia para timeline (últimos 14 dias)
  const timeline: Record<string, { viewsA: number; viewsB: number; clicksA: number; clicksB: number }> = {};
  for (const e of events) {
    const day = e.createdAt.toISOString().slice(0, 10);
    const slot = timeline[day] ??= { viewsA: 0, viewsB: 0, clicksA: 0, clicksB: 0 };
    if (e.variant === 'A' && e.type === 'view')  slot.viewsA++;
    if (e.variant === 'B' && e.type === 'view')  slot.viewsB++;
    if (e.variant === 'A' && e.type === 'click') slot.clicksA++;
    if (e.variant === 'B' && e.type === 'click') slot.clicksB++;
  }

  return NextResponse.json({
    sessionsA: sessionsA.size,
    sessionsB: sessionsB.size,
    totalSessions: sessionsA.size + sessionsB.size,
    viewsA,
    viewsB,
    clicksA,
    clicksB,
    crA: parseFloat(crA.toFixed(2)),
    crB: parseFloat(crB.toFixed(2)),
    lift: parseFloat(lift.toFixed(1)),
    winner: crB > crA ? 'B' : crA > crB ? 'A' : null,
    timeline: Object.entries(timeline)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, data]) => ({ date, ...data })),
  });
}
