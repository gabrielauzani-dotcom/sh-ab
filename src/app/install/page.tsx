'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Experiment = {
  id: string;
  name: string;
  status: string;
  site: { domain: string; name: string };
};

export default function InstallPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/experiments')
      .then(r => r.json())
      .then(data => {
        setExperiments(data);
        if (data.length > 0) setSelected(data[0]);
      });
  }, []);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seuapp.com';
  const scriptTag = selected
    ? `<!-- A/B Platform - Cole antes do </body> da sua loja -->\n<script src="${baseUrl}/api/pixel?site=${selected.site.domain}" async></script>`
    : '';

  function copy() {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar glass">
        <div style={{ padding: '0 0 32px 0' }}>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>A/B Platform</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Standalone + Shopify Ready</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px' }}>🧪 Experimentos</Link>
          <Link href="/editor" style={{ color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px' }}>✏️ Editor Visual</Link>
          <Link href="/install" style={{ color: 'white', fontWeight: '600', padding: '10px 12px', background: 'rgba(61,235,130,0.1)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>⚡ Instalar no Site</Link>
        </nav>
      </aside>

      <main className="main-content">
        <h2 style={{ fontSize: '2rem', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Instalar no Site</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
          Copie e cole o script abaixo na sua loja Shopify (ou em qualquer site). Funciona sem precisar de conta de parceiro.
        </p>

        {/* Passo 1: Selecionar experimento */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>1. Selecione o Experimento</h3>
          {experiments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum experimento criado ainda. <Link href="/" style={{ color: 'var(--primary)' }}>Criar agora →</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {experiments.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => setSelected(exp)}
                  style={{ padding: '14px 16px', borderRadius: '8px', border: `1px solid ${selected?.id === exp.id ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', background: selected?.id === exp.id ? 'rgba(61,235,130,0.05)' : 'var(--background)', transition: 'all 0.2s' }}
                >
                  <p style={{ fontWeight: '600', color: 'white', marginBottom: '2px' }}>{exp.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.site?.domain}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Passo 2: Copiar o Script */}
        {selected && (
          <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>2. Copie o Script</h3>
            <pre style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', color: '#3deb82', fontSize: '0.85rem', overflowX: 'auto', lineHeight: '1.6', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {scriptTag}
            </pre>
            <button onClick={copy} className="btn-primary" style={{ marginTop: '16px', color: '#000' }}>
              {copied ? '✅ Copiado!' : '📋 Copiar Script'}
            </button>
          </div>
        )}

        {/* Passo 3: Onde colar no Shopify */}
        {selected && (
          <div className="card animate-fade-in">
            <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>3. Como colar no Shopify</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { num: 1, title: 'Acesse o Admin da sua loja Shopify', desc: 'Vá para admin.shopify.com → sua loja' },
                { num: 2, title: 'Online Store → Themes', desc: 'No menu lateral esquerdo, clique em "Online Store" e depois em "Themes"' },
                { num: 3, title: 'Edit Code → theme.liquid', desc: 'Clique em "..." → "Edit code" → abra o arquivo "theme.liquid"' },
                { num: 4, title: 'Cole antes de </body>', desc: 'Encontre a tag </body> no final do arquivo e cole o script logo antes dela' },
                { num: 5, title: 'Salve e ative o experimento', desc: 'Clique em Save. Depois volte aqui e clique em "▶ Ativar" no painel de experimentos.' },
              ].map(step => (
                <div key={step.num} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem' }}>{step.num}</div>
                  <div>
                    <p style={{ fontWeight: '600', color: 'white', marginBottom: '2px' }}>{step.title}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
