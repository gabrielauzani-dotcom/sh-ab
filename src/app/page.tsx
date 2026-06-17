'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Modification = {
  id: string;
  targetSelector: string;
  type: string;
  value: string;
};

type Stats = { viewsA: number; viewsB: number; clicksA: number; clicksB: number };

type Experiment = {
  id: string;
  name: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED';
  trafficDistribution: number;
  createdAt: string;
  modifications: Modification[];
  site: { id: string; domain: string; name: string };
  stats: Stats;
};

export default function Home() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', siteDomain: '', siteName: '', trafficDistribution: 50, targetUrl: '', urlCondition: '', goalSelector: '' });
  const [saving, setSaving] = useState(false);

  async function fetchExperiments() {
    try {
      const res = await fetch('/api/experiments');
      const data = await res.json();
      setExperiments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchExperiments(); }, []);

  async function createExperiment() {
    setSaving(true);
    try {
      await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      setForm({ name: '', siteDomain: '', siteName: '', trafficDistribution: 50, targetUrl: '', urlCondition: '', goalSelector: '' });
      fetchExperiments();
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(exp: Experiment) {
    const newStatus = exp.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
    await fetch(`/api/experiments/${exp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchExperiments();
  }

  async function deleteExperiment(id: string) {
    if (!confirm('Deseja excluir este experimento?')) return;
    await fetch(`/api/experiments/${id}`, { method: 'DELETE' });
    fetchExperiments();
  }

  const running = experiments.filter(e => e.status === 'RUNNING').length;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div style={{ padding: '0 0 32px 0' }}>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>A/B Platform</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Standalone + Shopify Ready</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/" style={{ color: 'white', fontWeight: '600', padding: '10px 12px', background: 'rgba(61,235,130,0.1)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
            🧪 Experimentos
          </Link>
          <Link href="/editor" style={{ color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', transition: 'all 0.2s' }}>
            ✏️ Editor Visual
          </Link>
          <Link href="/install" style={{ color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', transition: 'all 0.2s' }}>
            ⚡ Instalar no Site
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>G</div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>Gabriel</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plano PRO</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h2 className="animate-fade-in" style={{ fontSize: '2rem', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Visão Geral</h2>
            <p style={{ color: 'var(--text-muted)' }}>Gerencie seus testes A/B e veja os resultados.</p>
          </div>
          <button className="btn-primary animate-fade-in" onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo Experimento
          </button>
        </header>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Testes Ativos</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{running}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '8px' }}>Rodando agora</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Total de Experimentos</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{experiments.length}</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Split de Tráfego</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>50 / 50</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>Padrão configurado</p>
          </div>
        </div>

        {/* Experiments List */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Experimentos</h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        ) : experiments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }}><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Nenhum experimento ainda</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Clique em "Novo Experimento" para criar o seu primeiro teste A/B.</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>Criar Agora</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {experiments.map((exp, i) => (
              <div key={exp.id} className="card animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: exp.status === 'RUNNING' ? 'rgba(61,235,130,0.1)' : 'rgba(156,163,175,0.1)', padding: '14px', borderRadius: '12px', color: exp.status === 'RUNNING' ? 'var(--primary)' : 'var(--text-muted)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white' }}>{exp.name}</h4>
                      <span className="badge" style={
                        exp.status === 'RUNNING' ? {} :
                        exp.status === 'PAUSED' ? { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)' } :
                        { background: 'rgba(156,163,175,0.1)', color: 'var(--text-muted)', borderColor: 'rgba(156,163,175,0.2)' }
                      }>
                        {exp.status === 'RUNNING' ? 'RODANDO' : exp.status === 'PAUSED' ? 'PAUSADO' : 'RASCUNHO'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      🌐 {exp.site?.domain} · {exp.modifications?.length || 0} modificação(ões) · {exp.trafficDistribution}% Variante B
                    </p>
                    {(exp.stats.viewsA + exp.stats.viewsB) > 0 && (
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {(['A', 'B'] as const).map(v => {
                          const views  = v === 'A' ? exp.stats.viewsA  : exp.stats.viewsB;
                          const clicks = v === 'A' ? exp.stats.clicksA : exp.stats.clicksB;
                          const cr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '—';
                          const isWinner = v === 'B'
                            ? exp.stats.viewsB > 0 && exp.stats.viewsA > 0 &&
                              (exp.stats.clicksB / exp.stats.viewsB) > (exp.stats.clicksA / exp.stats.viewsA)
                            : false;
                          return (
                            <div key={v} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isWinner ? 'rgba(61,235,130,0.3)' : 'var(--border)'}`, borderRadius: '6px', padding: '6px 12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: isWinner ? 'var(--primary)' : 'var(--text-muted)' }}>
                                VAR {v}{isWinner ? ' 🏆' : ''}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{views} views</span>
                              {clicks > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{clicks} cliques</span>}
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isWinner ? 'var(--primary)' : 'white' }}>{cr}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {exp.status === 'RUNNING' && (exp.stats.viewsA + exp.stats.viewsB) === 0 && (
                      <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '6px' }}>Aguardando primeiros dados de tracking…</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/experiments/${exp.id}`} className="btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    📊 Relatório
                  </Link>
                  <Link href={`/editor?experimentId=${exp.id}`} className="btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => toggleStatus(exp)}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.85rem', background: exp.status === 'RUNNING' ? '#fbbf24' : 'var(--primary)', color: '#000' }}
                  >
                    {exp.status === 'RUNNING' ? '⏸ Pausar' : '▶ Ativar'}
                  </button>
                  <button
                    onClick={() => deleteExperiment(exp.id)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.85rem', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Novo Experimento */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-in" style={{ width: '480px', padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Novo Experimento A/B</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Nome do Teste</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Cor do Botão de Compra" style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Domínio do Site (ex: minha-loja.myshopify.com)</label>
                <input type="text" value={form.siteDomain} onChange={e => setForm(f => ({ ...f, siteDomain: e.target.value }))} placeholder="minha-loja.myshopify.com" style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Nome do Site (opcional)</label>
                <input type="text" value={form.siteName} onChange={e => setForm(f => ({ ...f, siteName: e.target.value }))} placeholder="Minha Loja" style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>URL da Página para Editar</label>
                <input type="text" value={form.targetUrl} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))} placeholder="https://minha-loja.myshopify.com/products/exemplo" style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Condição de URL <span style={{ color: '#6b7280', fontWeight: 400 }}>(opcional — aplica em todas as páginas que contém o padrão)</span>
                </label>
                <input type="text" value={form.urlCondition} onChange={e => setForm(f => ({ ...f, urlCondition: e.target.value }))} placeholder="Ex: /products ou /collections/sale" style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
                <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>Deixe vazio para aplicar em todas as páginas do site.</p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Meta de Conversão
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {[
                    { label: '🛒 Add to Cart',    value: '[name="add"], .add-to-cart, #AddToCart, .btn-addtocart, [data-testid="add-to-cart"]' },
                    { label: '💳 Checkout',       value: '.btn-checkout, #checkout, [name="checkout"], .checkout-button' },
                    { label: '📝 Form Submit',    value: 'form [type="submit"], button[type="submit"]' },
                    { label: '🔗 Qualquer Link',  value: 'a[href]' },
                    { label: '📦 Comprar Agora',  value: '.buy-now, .btn-buy, [data-action="buy-now"]' },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, goalSelector: preset.value }))}
                      style={{
                        padding: '5px 10px', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s',
                        background: form.goalSelector === preset.value ? 'rgba(61,235,130,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.goalSelector === preset.value ? 'rgba(61,235,130,0.5)' : 'var(--border)'}`,
                        color: form.goalSelector === preset.value ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.goalSelector} onChange={e => setForm(f => ({ ...f, goalSelector: e.target.value }))} placeholder="Ou cole um seletor CSS customizado…" style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.875rem' }} />
                <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>Cliques nesse elemento são registrados como conversão.</p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Split de Tráfego para Variante B: <strong style={{ color: 'var(--primary)' }}>{form.trafficDistribution}%</strong></label>
                <input type="range" min={10} max={90} step={5} value={form.trafficDistribution} onChange={e => setForm(f => ({ ...f, trafficDistribution: Number(e.target.value) }))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>A: {100 - form.trafficDistribution}%</span>
                  <span>B: {form.trafficDistribution}%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1, color: '#000' }} onClick={createExperiment} disabled={saving}>
                {saving ? 'Criando...' : 'Criar Experimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
