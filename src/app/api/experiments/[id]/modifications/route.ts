import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/experiments/[id]/modifications
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const mods = await prisma.modification.findMany({ where: { experimentId: id } });
  return NextResponse.json(mods);
}

// PUT /api/experiments/[id]/modifications - Substitui TODAS as modificações (delete + re-create)
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const modifications: Array<{ targetSelector: string; type: string; value: string }> = await req.json();

  await prisma.$transaction([
    prisma.modification.deleteMany({ where: { experimentId: id } }),
    ...modifications.map(mod =>
      prisma.modification.create({
        data: {
          experimentId: id,
          targetSelector: mod.targetSelector,
          type: mod.type,
          value: typeof mod.value === 'string' ? mod.value : JSON.stringify(mod.value),
        },
      })
    ),
  ]);

  const saved = await prisma.modification.findMany({ where: { experimentId: id } });
  return NextResponse.json(saved, { status: 200 });
}
