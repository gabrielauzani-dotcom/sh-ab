import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/experiments - Lista todos os experimentos com stats de tracking
export async function GET() {
  const experiments = await prisma.experiment.findMany({
    include: { site: true, modifications: true },
    orderBy: { createdAt: 'desc' },
  });

  // Agrega eventos por experimento em uma única query
  const allEvents = await (prisma as any).trackEvent.groupBy({
    by: ['experimentId', 'variant', 'type'],
    _count: { id: true },
  });

  // Monta mapa de stats por experimentId
  const statsMap: Record<string, { viewsA: number; viewsB: number; clicksA: number; clicksB: number }> = {};
  for (const row of allEvents) {
    const s = statsMap[row.experimentId] ??= { viewsA: 0, viewsB: 0, clicksA: 0, clicksB: 0 };
    if (row.variant === 'A' && row.type === 'view')  s.viewsA  = row._count.id;
    if (row.variant === 'B' && row.type === 'view')  s.viewsB  = row._count.id;
    if (row.variant === 'A' && row.type === 'click') s.clicksA = row._count.id;
    if (row.variant === 'B' && row.type === 'click') s.clicksB = row._count.id;
  }

  const result = experiments.map(exp => ({
    ...exp,
    stats: statsMap[exp.id] ?? { viewsA: 0, viewsB: 0, clicksA: 0, clicksB: 0 },
  }));

  return NextResponse.json(result);
}

// POST /api/experiments - Cria um novo experimento
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, siteDomain, siteName, trafficDistribution, targetUrl, urlCondition, goalSelector } = body;

  const site = await prisma.site.upsert({
    where: { domain: siteDomain },
    create: { domain: siteDomain, name: siteName || siteDomain },
    update: {},
  });

  const experiment = await prisma.experiment.create({
    data: {
      name,
      siteId: site.id,
      trafficDistribution: trafficDistribution ?? 50,
      targetUrl: targetUrl ?? '',
      urlCondition: urlCondition ?? '',
      goalSelector: goalSelector ?? '',
      status: 'DRAFT',
    } as any,
    include: { site: true, modifications: true },
  });

  return NextResponse.json(experiment, { status: 201 });
}
