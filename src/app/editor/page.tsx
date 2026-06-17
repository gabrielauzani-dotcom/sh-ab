'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type SelectedElement = {
  selector: string;
  tagName: string;
  text: string;
  styles: Record<string, string>;
};

type PanelTab = 'inspector' | 'library';
type Modification = { targetSelector: string; type: string; value: string };

const LIBRARY_BLOCKS = [
  {
    category: '📣 Anúncios',
    items: [
      { label: 'Barra de Frete Grátis', preview: '🚚', html: `<div style="background:#3deb82;color:#000;padding:12px;text-align:center;font-weight:bold;font-family:sans-serif;font-size:14px;width:100%;">🚚 FRETE GRÁTIS em compras acima de R$199 | Cupom <strong>FRETE10</strong></div>` },
      { label: 'Barra de Urgência', preview: '⏱', html: `<div style="background:#ef4444;color:#fff;padding:12px;text-align:center;font-weight:bold;font-family:sans-serif;font-size:14px;">⏱ OFERTA EXPIRA EM: <span id="ab_countdown">09:59</span></div>` },
      { label: 'Banner 20% OFF', preview: '🔥', html: `<div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:20px 24px;border-radius:12px;font-family:sans-serif;margin:16px 0;text-align:center"><div style="font-size:28px;font-weight:900;margin-bottom:4px">🔥 20% OFF</div><div style="font-size:14px;opacity:0.9">Use o cupom <strong>DESCONTO20</strong></div></div>` },
    ],
  },
  {
    category: '🛍️ CTAs',
    items: [
      { label: 'Botão Verde de Compra', preview: '🛒', html: `<a href="#" style="display:inline-block;background:#3deb82;color:#000;padding:14px 28px;border-radius:8px;font-weight:700;font-size:16px;font-family:sans-serif;text-decoration:none;box-shadow:0 4px 14px rgba(61,235,130,0.4)">🛒 Comprar Agora</a>` },
      { label: 'Botão com Garantia', preview: '🔒', html: `<div style="font-family:sans-serif;text-align:center"><a href="#" style="display:inline-block;background:#16a34a;color:#fff;padding:16px 32px;border-radius:8px;font-weight:700;font-size:18px;text-decoration:none;margin-bottom:8px">⚡ Quero Garantir o Meu</a><div style="font-size:12px;color:#6b7280">🔒 Compra 100% segura · Garantia de 7 dias</div></div>` },
      { label: 'CTA de WhatsApp', preview: '💬', html: `<a href="https://wa.me/5511999999999" style="display:inline-flex;align-items:center;gap:10px;background:#25d366;color:#fff;padding:14px 24px;border-radius:8px;font-weight:700;font-size:15px;font-family:sans-serif;text-decoration:none">💬 Falar no WhatsApp</a>` },
    ],
  },
  {
    category: '✅ Social Proof',
    items: [
      { label: 'Selos de Confiança', preview: '🔒', html: `<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;padding:16px;font-family:sans-serif"><span>🔒 <strong>Compra Segura</strong></span><span>✅ <strong>Site Verificado</strong></span><span>🏅 <strong>Garantia 7 dias</strong></span><span>🚚 <strong>Envio Rápido</strong></span></div>` },
      { label: 'Card de Avaliação ⭐', preview: '⭐', html: `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;font-family:sans-serif;max-width:320px"><div style="color:#f59e0b;font-size:18px;margin-bottom:8px">★★★★★</div><p style="color:#374151;font-size:14px;margin:0 0 12px">"Produto incrível! Superou todas as expectativas."</p><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:50%;background:#3deb82;display:flex;align-items:center;justify-content:center;font-weight:bold">M</div><div><strong style="font-size:13px">Maria S.</strong><div style="font-size:12px;color:#9ca3af">Compra verificada ✓</div></div></div></div>` },
      { label: 'Contador de Clientes', preview: '👥', html: `<div style="text-align:center;padding:16px;font-family:sans-serif"><div style="font-size:36px;font-weight:900;color:#111">+10.000</div><div style="color:#6b7280;font-size:14px">clientes satisfeitos em todo o Brasil</div></div>` },
    ],
  },
  {
    category: '💎 Vitrines',
    items: [
      { label: 'Card de Produto', preview: '📦', html: `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:sans-serif;max-width:240px;display:inline-block"><div style="background:#f3f4f6;height:180px;display:flex;align-items:center;justify-content:center;font-size:48px">📦</div><div style="padding:16px"><h3 style="margin:0 0 4px;font-size:16px;color:#111">Nome do Produto</h3><p style="margin:0 0 12px;font-size:13px;color:#6b7280">Descrição curta do produto.</p><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:18px;font-weight:700;color:#111">R$99,90</span><a href="#" style="background:#3deb82;color:#000;padding:8px 16px;border-radius:6px;font-weight:600;font-size:13px;text-decoration:none">Comprar</a></div></div></div>` },
      { label: '3 Benefícios', preview: '✨', html: `<section style="padding:32px 16px;font-family:sans-serif"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:800px;margin:0 auto"><div style="text-align:center"><div style="font-size:40px;margin-bottom:12px">🚀</div><h4 style="margin:0 0 6px;color:#111">Entrega Rápida</h4><p style="margin:0;font-size:13px;color:#6b7280">Em até 3 dias úteis.</p></div><div style="text-align:center"><div style="font-size:40px;margin-bottom:12px">🔒</div><h4 style="margin:0 0 6px;color:#111">100% Seguro</h4><p style="margin:0;font-size:13px;color:#6b7280">Pagamento criptografado.</p></div><div style="text-align:center"><div style="font-size:40px;margin-bottom:12px">↩️</div><h4 style="margin:0 0 6px;color:#111">Troca Grátis</h4><p style="margin:0;font-size:13px;color:#6b7280">7 dias sem perguntas.</p></div></div></section>` },
    ],
  },
];

export default function Editor() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEl, setSelectedEl] = useState<SelectedElement | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>('inspector');
  const [editText, setEditText] = useState('');
  const [insertHtml, setInsertHtml] = useState('');
  const [insertPos, setInsertPos] = useState('after');
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [moveMode, setMoveMode] = useState(false);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [experimentName, setExperimentName] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Carrega dados do experimento quando há experimentId na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('experimentId');
    setExperimentId(id);
    if (id) {
      fetch(`/api/experiments`)
        .then(r => r.json())
        .then((exps: Array<{ id: string; name: string; targetUrl?: string }>) => {
          const exp = exps.find((e) => e.id === id);
          if (exp) {
            setExperimentName(exp.name);
            if (exp.targetUrl) {
              setUrl(exp.targetUrl);
              setLoading(true);
              setActiveUrl(`/api/proxy?url=${encodeURIComponent(exp.targetUrl)}`);
            }
          }
        });
    }
  }, []);

  const sendToIframe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  // Acumula modificações — CSS é mesclado, outros substituem por selector+type
  const addMod = useCallback((mod: Modification) => {
    setModifications(prev => {
      if (mod.type === 'CSS') {
        const existing = prev.find(m => m.targetSelector === mod.targetSelector && m.type === 'CSS');
        if (existing) {
          try {
            const merged = { ...JSON.parse(existing.value), ...JSON.parse(mod.value) };
            return prev.map(m => m === existing ? { ...m, value: JSON.stringify(merged) } : m);
          } catch { /* se falhar, substituir */ }
        }
      }
      const filtered = prev.filter(m => !(m.targetSelector === mod.targetSelector && m.type === mod.type));
      return [...filtered, mod];
    });
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data) return;
      const d = e.data;
      if (d.type === 'ELEMENT_SELECTED') {
        setSelectedEl(d);
        setEditText(d.text || '');
        setStyles(d.styles || {});
        setActiveTab('inspector');
      } else if (d.type === 'ELEMENT_DESELECTED') {
        setSelectedEl(null);
      } else if (d.type === 'ELEMENT_MOVED') {
        addMod({
          targetSelector: d.srcSelector,
          type: 'REORDER',
          value: JSON.stringify({ targetSelector: d.targetSelector, position: d.position }),
        });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [addMod]);

  function loadSite() {
    if (!url) return;
    setLoading(true);
    setSelectedEl(null);
    setActiveUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
    // Salva a URL no experimento para reabertura futura
    if (experimentId) {
      fetch(`/api/experiments/${experimentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      });
    }
  }

  function applyStyle(key: string, value: string) {
    setStyles(s => ({ ...s, [key]: value }));
    sendToIframe({ type: 'APPLY_STYLE', styles: { [key]: value } });
    if (selectedEl) addMod({ targetSelector: selectedEl.selector, type: 'CSS', value: JSON.stringify({ [key]: value }) });
  }

  function applyText() {
    sendToIframe({ type: 'APPLY_TEXT', text: editText });
    if (selectedEl) addMod({ targetSelector: selectedEl.selector, type: 'TEXT', value: editText });
  }

  function hideElement() {
    sendToIframe({ type: 'HIDE_ELEMENT' });
    if (selectedEl) addMod({ targetSelector: selectedEl.selector, type: 'HIDE', value: 'none' });
  }

  function insertBlock() {
    if (!insertHtml || !selectedEl) return;
    sendToIframe({ type: 'INSERT_BLOCK', html: insertHtml, position: insertPos });
    addMod({ targetSelector: selectedEl.selector, type: insertPos === 'before' ? 'INSERT_HTML_BEFORE' : 'INSERT_HTML_AFTER', value: insertHtml });
    setInsertHtml('');
  }

  function deselectElement() {
    setSelectedEl(null);
    sendToIframe({ type: 'ELEMENT_DESELECTED' });
  }

  function toggleMoveMode() {
    const next = !moveMode;
    setMoveMode(next);
    sendToIframe({ type: next ? 'ENABLE_MOVE_MODE' : 'DISABLE_MOVE_MODE' });
    if (next) setSelectedEl(null);
  }

  async function saveVariant() {
    if (!experimentId) {
      alert('Abra o editor clicando em "✏️ Editar" no Dashboard para vincular a um experimento.');
      return;
    }
    if (modifications.length === 0) {
      alert('Nenhuma alteração encontrada. Edite algum elemento e tente novamente.');
      return;
    }
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch(`/api/experiments/${experimentId}/modifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifications),
      });
      if (!res.ok) throw new Error(`Falha ao salvar: ${await res.text()}`);
      setSaveStatus('ok');
      setModifications([]);
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err) {
      setSaveStatus('error');
      console.error(err);
      alert('Erro ao salvar modificações: ' + err);
    } finally {
      setSaving(false);
    }
  }

  const hasSelection = !!selectedEl;
  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '8px', color: 'white', fontSize: '0.88rem', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>

      {/* Top Bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #262626', background: '#111', zIndex: 20, flexShrink: 0 }}>
        <Link href="/" style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>← Sair</Link>
        <div style={{ width: '1px', height: '20px', background: '#262626' }} />
        <div>
          <span style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>✏️ Editor Visual</span>
          {experimentName && <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '8px' }}>— {experimentName}</span>}
        </div>

        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadSite()}
            placeholder="https://minha-loja.myshopify.com/products/..."
            style={{ ...inp, flex: 1, minWidth: 0 }} />
          <button onClick={loadSite}
            style={{ padding: '8px 14px', borderRadius: '8px', background: '#3deb82', color: '#000', border: 'none', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
            {loading ? '⏳' : 'Carregar'}
          </button>
        </div>

        {activeUrl && (
          <button onClick={toggleMoveMode}
            style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid ${moveMode ? '#3deb82' : '#262626'}`, background: moveMode ? 'rgba(61,235,130,0.1)' : 'transparent', color: moveMode ? '#3deb82' : '#9ca3af', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {moveMode ? '✋ Mover Ativo' : '🔀 Mover'}
          </button>
        )}

        {modifications.length > 0 && (
          <span style={{ fontSize: '0.72rem', color: '#f59e0b', whiteSpace: 'nowrap', background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.25)' }}>
            {modifications.length} pendente{modifications.length > 1 ? 's' : ''}
          </span>
        )}

        <button onClick={saveVariant} disabled={saving}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s', flexShrink: 0,
            background: saveStatus === 'ok' ? '#10b981' : saveStatus === 'error' ? '#ef4444' : '#3deb82',
            color: '#000', opacity: saving ? 0.7 : 1,
          }}>
          {saveStatus === 'ok' ? '✅ Salvo!' : saveStatus === 'error' ? '❌ Erro' : saving ? 'Salvando…' : '💾 Salvar Variante B'}
        </button>
      </header>

      {/* Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Iframe */}
        <div style={{ flex: 1, position: 'relative', background: '#0d0d0d' }}>
          {activeUrl ? (
            <iframe ref={iframeRef} src={activeUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setLoading(false)}
              title="Editor" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '16px', padding: '40px' }}>
              <div style={{ fontSize: '72px', opacity: 0.25 }}>🖥️</div>
              <h2 style={{ fontWeight: '700', color: 'white', fontSize: '1.5rem', margin: 0 }}>Cole a URL da sua loja acima</h2>
              <p style={{ fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center', lineHeight: '1.6', color: '#6b7280' }}>
                Pressione Enter ou clique em Carregar para abrir a página no editor visual.
              </p>
              {!experimentId && (
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '12px 16px', fontSize: '0.8rem', color: '#f59e0b', maxWidth: '400px', textAlign: 'center' }}>
                  ⚠️ Você está sem experimento selecionado. <Link href="/" style={{ color: '#3deb82', fontWeight: '600' }}>Volte ao Dashboard</Link> e clique em "✏️ Editar" para salvar modificações.
                </div>
              )}
            </div>
          )}

          {moveMode && (
            <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(61,235,130,0.15)', border: '1px solid #3deb82', color: '#3deb82', fontSize: '0.75rem', padding: '6px 14px', borderRadius: '999px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              🔀 Arraste as seções para reordenar · Clique em "Mover" para desativar
            </div>
          )}
          {!moveMode && hasSelection && (
            <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', color: '#9ca3af', fontSize: '0.72rem', padding: '5px 12px', borderRadius: '999px', pointerEvents: 'none' }}>
              Clique novamente para desselecionar · ESC
            </div>
          )}
        </div>

        {/* Painel Direito */}
        <div style={{ width: '310px', borderLeft: '1px solid #262626', background: '#111', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #262626', flexShrink: 0 }}>
            {(['inspector', 'library'] as PanelTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: '11px', fontWeight: '600', fontSize: '0.78rem', background: 'none', cursor: 'pointer', color: activeTab === tab ? '#3deb82' : '#9ca3af', borderBottom: activeTab === tab ? '2px solid #3deb82' : '2px solid transparent', transition: 'all 0.2s' }}>
                {tab === 'inspector' ? '🔍 Inspetor' : '📦 Biblioteca'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

            {/* INSPETOR */}
            {activeTab === 'inspector' && (
              !hasSelection ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '48px', padding: '0 8px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{moveMode ? '🔀' : '👆'}</div>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                    {moveMode ? 'Arraste os elementos da página para reordená-los.' : 'Clique em qualquer elemento na página para editar.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
                  <div style={{ background: 'rgba(61,235,130,0.05)', border: '1px solid rgba(61,235,130,0.2)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <label style={lbl}>Elemento</label>
                      <code style={{ color: '#3deb82', fontSize: '0.85rem' }}>&lt;{selectedEl.tagName}&gt;</code>
                    </div>
                    <button onClick={deselectElement} style={{ background: 'transparent', border: '1px solid #262626', borderRadius: '6px', color: '#9ca3af', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem' }}>✕</button>
                  </div>

                  <div>
                    <label style={lbl}>Texto / Copy</label>
                    <textarea rows={2} value={editText} onChange={e => setEditText(e.target.value)} style={{ ...inp, resize: 'vertical' }} />
                    <button onClick={applyText} style={{ marginTop: '4px', width: '100%', padding: '7px', background: '#1e1e1e', border: '1px solid #262626', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Aplicar Texto</button>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #1e1e1e' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={lbl}>Cor do Texto</label>
                      <input type="color" defaultValue="#ffffff" onChange={e => applyStyle('color', e.target.value)} style={{ width: '100%', height: '34px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #262626', background: 'none' }} />
                    </div>
                    <div>
                      <label style={lbl}>Cor de Fundo</label>
                      <input type="color" defaultValue="#000000" onChange={e => applyStyle('backgroundColor', e.target.value)} style={{ width: '100%', height: '34px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #262626', background: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Tamanho da Fonte: <span style={{ color: '#3deb82' }}>{parseInt(styles.fontSize || '16')}px</span></label>
                    <input type="range" min={8} max={80} defaultValue={parseInt(styles.fontSize || '16')}
                      onChange={e => applyStyle('fontSize', e.target.value + 'px')}
                      style={{ width: '100%', accentColor: '#3deb82' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={lbl}>Peso</label>
                      <select onChange={e => applyStyle('fontWeight', e.target.value)} defaultValue={styles.fontWeight || '400'} style={{ ...inp }}>
                        {[['300','Light'],['400','Regular'],['500','Medium'],['600','SemiBold'],['700','Bold'],['800','ExtraBold'],['900','Black']].map(([v,l]) => (<option key={v} value={v}>{l}</option>))}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Alinhamento</label>
                      <div style={{ display: 'flex', gap: '3px', height: '36px' }}>
                        {[['left','⬅'],['center','↔'],['right','➡']].map(([a, icon]) => (
                          <button key={a} onClick={() => applyStyle('textAlign', a)}
                            style={{ flex: 1, background: styles.textAlign === a ? '#3deb82' : '#1a1a1a', color: styles.textAlign === a ? '#000' : '#fff', border: '1px solid #262626', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Fonte</label>
                    <select onChange={e => applyStyle('fontFamily', e.target.value)} style={{ ...inp }}>
                      {['inherit','sans-serif','Inter, sans-serif','Georgia, serif','monospace','Arial, sans-serif'].map(f => (<option key={f} value={f}>{f.split(',')[0]}</option>))}
                    </select>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #1e1e1e' }} />

                  <div>
                    <label style={lbl}>Inserir novo elemento (HTML)</label>
                    <select value={insertPos} onChange={e => setInsertPos(e.target.value)} style={{ ...inp, marginBottom: '5px' }}>
                      <option value="before">Antes deste elemento</option>
                      <option value="after">Depois deste elemento</option>
                    </select>
                    <textarea rows={2} value={insertHtml} onChange={e => setInsertHtml(e.target.value)}
                      placeholder="<div>Novo conteúdo...</div>"
                      style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem' }} />
                    <button onClick={insertBlock} style={{ marginTop: '4px', width: '100%', padding: '7px', background: '#1e1e1e', border: '1px solid #262626', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>
                      ➕ Inserir Elemento
                    </button>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #1e1e1e' }} />

                  <button onClick={hideElement} style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                    🗑 Ocultar / Remover elemento
                  </button>
                </div>
              )
            )}

            {/* BIBLIOTECA */}
            {activeTab === 'library' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.5' }}>
                  {hasSelection ? 'Clique para inserir antes do elemento selecionado.' : '👆 Selecione um elemento na página primeiro.'}
                </p>
                {LIBRARY_BLOCKS.map(cat => (
                  <div key={cat.category}>
                    <label style={{ ...lbl, color: 'white', marginBottom: '8px', fontSize: '0.75rem' }}>{cat.category}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {cat.items.map(item => (
                        <div key={item.label} draggable
                          onDragStart={e => { e.dataTransfer.setData('text/html', item.html); }}
                          onClick={() => {
                            setInsertHtml(item.html);
                            if (hasSelection) sendToIframe({ type: 'INSERT_BLOCK', html: item.html, position: 'before' });
                            else setActiveTab('inspector');
                          }}
                          style={{ padding: '9px 12px', background: '#1a1a1a', border: '1px solid #262626', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', alignItems: 'center', gap: '10px' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#3deb82')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = '#262626')}
                        >
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.preview}</span>
                          <div>
                            <p style={{ color: 'white', fontWeight: '600', fontSize: '0.8rem', margin: 0 }}>{item.label}</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '1px 0 0' }}>Clique ou arraste</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log de modificações pendentes */}
          {modifications.length > 0 && (
            <div style={{ borderTop: '1px solid #262626', padding: '10px 14px', flexShrink: 0, background: '#0d0d0d' }}>
              <label style={{ ...lbl, marginBottom: '6px' }}>Não salvas ({modifications.length})</label>
              <div style={{ maxHeight: '72px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {modifications.map((m, i) => (
                  <div key={i} style={{ fontSize: '0.68rem', color: '#9ca3af', display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#3deb82', flexShrink: 0 }}>{m.type}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.targetSelector}</span>
                  </div>
                ))}
              </div>
              <button onClick={saveVariant} disabled={saving}
                style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px', background: '#3deb82', color: '#000', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
                {saving ? 'Salvando…' : `💾 Salvar ${modifications.length} modificaç${modifications.length > 1 ? 'ões' : 'ão'}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
