'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Stats = {
  sessionsA: number; sessionsB: number; totalSessions: number;
  viewsA: number; viewsB: number;
  clicksA: number; clicksB: number;
  crA: number; crB: number;
  lift: number;
  winner: 'A' | 'B' | null;
  timeline: Array<{ date: string; viewsA: number; viewsB: number; clicksA: number; clicksB: number }>;
};

type Experiment = {
  id: string; name: string; status: string; trafficDistribution: number;
  targetUrl: string; urlCondition: string; goalSelector: string;
  site: { domain: string; name: string };
  modifications: Array<{ id: string; type: string; targetSelector: string }>;
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: '140px' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: accent ? 'var(--primary)' : 'white' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>}
    </div>
  );
}

function VariantBlock({
  variant, sessions, views, clicks, cr, isWinner,
}: {
  variant: 'A' | 'B'; sessions: number; views: number; clicks: number; cr: number; isWinner: boolean;
}) {
  const color = isWinner ? 'var(--primary)' : variant === 'A' ? '#60a5fa' : '#f472b6';
  const barMax = Math.max(views, 1);
  return (
    <div className="card" style={{ flex: 1, border: isWinner ? '1px solid rgba(61,235,130,0.4)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color, fontSize: '1rem' }}>
            {variant}
          </div>
          <div>
            <p style={{ fontWeight: '700', color: 'white', fontSize: '0.95rem' }}>Variante {variant}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{variant === 'A' ? 'Controle (original)' : 'Teste (modificado)'}</p>
          </div>
        </div>
        {isWinner && (
          <span style={{ background: 'rgba(61,235,130,0.1)', color: 'var(--primary)', border: '1px solid rgba(61,235,130,0.3)', borderRadius: '999px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700' }}>
            🏆 Vencedor
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          { l: 'Sessões', v: sessions },
          { l: 'Visualizações', v: views },
          { l: 'Conversões', v: clicks },
        ].map(({ l, v }) => (
          <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{l}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>{v.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Taxa de conversão */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taxa de conversão</span>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color }}>{cr.toFixed(1)}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((clicks / barMax) * 100 * 3, 100)}%`, background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  );
}

function Timeline({ data }: { data: Stats['timeline'] }) {
  if (data.length === 0) return null;
  const maxViews = Math.max(...data.map(d => d.viewsA + d.viewsB), 1);
  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Visualizações por dia</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
        {data.map(d => {
          const hA = ((d.viewsA / maxViews) * 80);
          const hB = ((d.viewsB / maxViews) * 80);
          const label = d.date.slice(5); // MM-DD
          return (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }} title={`${d.date}\nA: ${d.viewsA} views, ${d.clicksA} cliques\nB: ${d.viewsB} views, ${d.clicksB} cliques`}>
              <div style={{ width: '100%', display: 'flex', gap: '1px', alignItems: 'flex-end', height: '70px' }}>
                <div style={{ flex: 1, height: `${hA}px`, background: '#60a5fa', borderRadius: '2px 2px 0 0', minHeight: hA > 0 ? '2px' : '0' }} />
                <div style={{ flex: 1, height: `${hB}px`, background: 'var(--primary)', borderRadius: '2px 2px 0 0', minHeight: hB > 0 ? '2px' : '0' }} />
              </div>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#60a5fa', borderRadius: '2px' }} /><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Variante A</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }} /><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Variante B</span></div>
      </div>
    </div>
  );
}

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const [exp, setExp] = useState<Experiment | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch('/api/experiments').then(r => r.json()),
      fetch(`/api/experiments/${id}/stats`).then(r => r.json()),
    ]).then(([exps, s]) => {
      const found = exps.find((e: Experiment) => e.id === id);
      setExp(found ?? null);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [id]);

  const statusColor = exp?.status === 'RUNNING' ? 'var(--primary)' : exp?.status === 'PAUSED' ? '#fbbf24' : '#9ca3af';
  const statusLabel = exp?.status === 'RUNNING' ? 'RODANDO' : exp?.status === 'PAUSED' ? 'PAUSADO' : 'RASCUNHO';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar glass">
        <div style={{ padding: '0 0 32px 0' }}>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>A/B Platform</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Standalone + Shopify Ready</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/" style={{ color: 'white', fontWeight: '600', padding: '10px 12px', background: 'rgba(61,235,130,0.1)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>🧪 Experimentos</Link>
          <Link href="/editor" style={{ color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px' }}>✏️ Editor Visual</Link>
          <Link href="/install" style={{ color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px' }}>⚡ Instalar no Site</Link>
        </nav>
      </aside>

      <main className="main-content">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Experimentos</Link>
          <span>/</span>
          <span style={{ color: 'white' }}>{exp?.name ?? '...'}</span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        ) : !exp ? (
          <p style={{ color: 'var(--text-muted)' }}>Experimento não encontrado. <Link href="/" style={{ color: 'var(--primary)' }}>Voltar</Link></p>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>{exp.name}</h2>
                  <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}33`, borderRadius: '999px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700' }}>
                    {statusLabel}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  🌐 {exp.site?.domain}
                  {exp.urlCondition && <> · 📍 páginas com <code style={{ color: 'var(--primary)', background: 'rgba(61,235,130,0.08)', padding: '1px 6px', borderRadius: '4px' }}>{exp.urlCondition}</code></>}
                  {exp.goalSelector && <> · 🎯 <code style={{ color: '#f472b6', background: 'rgba(244,114,182,0.08)', padding: '1px 6px', borderRadius: '4px' }}>{exp.goalSelector}</code></>}
                </p>
              </div>
              <Link href={`/editor?experimentId=${exp.id}`} className="btn-outline" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                ✏️ Editar Variante B
              </Link>
            </div>

            {/* Totais */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <StatCard label="Total de Sessões" value={stats?.totalSessions.toLocaleString() ?? '0'} sub={`${exp.trafficDistribution}% para Variante B`} />
              <StatCard label="Total de Eventos" value={((stats?.viewsA ?? 0) + (stats?.viewsB ?? 0) + (stats?.clicksA ?? 0) + (stats?.clicksB ?? 0)).toLocaleString()} />
              <StatCard label="Modificações Ativas" value={exp.modifications.length} sub="na Variante B" />
              {stats && stats.winner && (
                <StatCard
                  label="Lift da Variante B"
                  value={`${stats.lift > 0 ? '+' : ''}${stats.lift.toFixed(1)}%`}
                  sub={`vs Variante A (${stats.crA.toFixed(1)}% → ${stats.crB.toFixed(1)}%)`}
                  accent={stats.lift > 0}
                />
              )}
            </div>

            {/* A vs B */}
            {stats && (stats.viewsA + stats.viewsB) > 0 ? (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <VariantBlock variant="A" sessions={stats.sessionsA} views={stats.viewsA} clicks={stats.clicksA} cr={stats.crA} isWinner={stats.winner === 'A'} />
                <VariantBlock variant="B" sessions={stats.sessionsB} views={stats.viewsB} clicks={stats.clicksB} cr={stats.crB} isWinner={stats.winner === 'B'} />
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
                <p style={{ color: 'white', fontWeight: '600', marginBottom: '6px' }}>Sem dados ainda</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {exp.status === 'RUNNING'
                    ? 'O experimento está ativo. Aguardando primeiras visitas.'
                    : 'Ative o experimento para começar a coletar dados.'}
                </p>
              </div>
            )}

            {/* Timeline */}
            {stats && stats.timeline.length > 0 && <Timeline data={stats.timeline} />}

            {/* Modificações */}
            {exp.modifications.length > 0 && (
              <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Modificações da Variante B ({exp.modifications.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {exp.modifications.map(mod => (
                    <div key={mod.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.72rem', background: 'rgba(61,235,130,0.08)', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>{mod.type}</span>
                      <code style={{ fontSize: '0.78rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.targetSelector}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
