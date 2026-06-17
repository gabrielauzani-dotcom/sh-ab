import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/experiments/[id] - Atualiza status (RUNNING/PAUSED), nome, targetUrl, urlCondition
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const experiment = await prisma.experiment.update({
    where: { id },
    data: body,
    include: { site: true, modifications: true },
  });
  return NextResponse.json(experiment);
}

// DELETE /api/experiments/[id] - Deleta experimento
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.experiment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
