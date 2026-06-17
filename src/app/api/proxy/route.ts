import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new Response('<h1>Missing url parameter</h1>', { status: 400, headers: { 'Content-Type': 'text/html' } });
  }

  try {
    const targetUrl = new URL(url);

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    let html = await response.text();
    const baseTag = `<base href="${targetUrl.origin}/" target="_blank">`;

    const editorScript = `<script>
(function() {
  var selected = null;
  var moveMode = false;
  var dragSrc = null;
  var dropIndicator = null;

  function getUniqueSelector(el) {
    if (!el || el === document.body) return 'body';
    if (el.id) return '#' + el.id;
    var path = [];
    var cur = el;
    while (cur && cur !== document.body) {
      var tag = cur.tagName.toLowerCase();
      var idx = 1;
      var s = cur.previousElementSibling;
      while (s) { if (s.tagName === cur.tagName) idx++; s = s.previousElementSibling; }
      path.unshift(tag + (idx > 1 ? ':nth-of-type(' + idx + ')' : ''));
      cur = cur.parentElement;
    }
    return 'body > ' + path.join(' > ');
  }

  function highlight(el, on) {
    if (!el || el.tagName === 'HTML' || el.tagName === 'BODY') return;
    el.style.outline = on ? '3px dashed #3deb82' : '';
    el.style.outlineOffset = on ? '-2px' : '';
    el.style.cursor = on ? 'pointer' : '';
  }

  // ── SELECIONAR ──
  document.addEventListener('mouseover', function(e) {
    if (moveMode) return;
    var el = e.target;
    if (!el || el === selected || el.tagName === 'HTML' || el.tagName === 'BODY') return;
    if (el.__hovered) return;
    highlight(el, true); el.__hovered = true;
    var last = el;
    el.addEventListener('mouseout', function() {
      if (last !== selected) highlight(last, false);
      last.__hovered = false;
    }, { once: true });
  });

  document.addEventListener('click', function(e) {
    if (moveMode) return;
    e.preventDefault(); e.stopPropagation();
    var el = e.target;
    if (!el || el.tagName === 'HTML' || el.tagName === 'BODY') return;
    if (selected === el) {
      highlight(el, false); selected = null;
      window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*'); return;
    }
    if (selected) highlight(selected, false);
    selected = el; highlight(el, true);
    var cs = window.getComputedStyle(el);
    window.parent.postMessage({
      type: 'ELEMENT_SELECTED',
      selector: getUniqueSelector(el),
      tagName: el.tagName.toLowerCase(),
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.innerText.substring(0, 100) : '',
      styles: { color: cs.color, backgroundColor: cs.backgroundColor, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontFamily: cs.fontFamily, textAlign: cs.textAlign }
    }, '*');
  }, true);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (selected) { highlight(selected, false); selected = null; }
      window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*');
    }
  });

  // ── RECEBE COMANDOS ──
  window.addEventListener('message', function(e) {
    var d = e.data; if (!d) return;
    if (d.type === 'ENABLE_MOVE_MODE') { enableMoveMode(); return; }
    if (d.type === 'DISABLE_MOVE_MODE') { disableMoveMode(); return; }
    if (!selected) return;
    if (d.type === 'APPLY_STYLE') { Object.assign(selected.style, d.styles); }
    else if (d.type === 'APPLY_TEXT') { selected.innerText = d.text; }
    else if (d.type === 'HIDE_ELEMENT') {
      selected.style.display = 'none'; highlight(selected, false); selected = null;
      window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*');
    } else if (d.type === 'INSERT_BLOCK') {
      var wrap = document.createElement('div'); wrap.innerHTML = d.html;
      var node = wrap.firstChild;
      if (d.position === 'before') selected.parentNode.insertBefore(node, selected);
      else selected.parentNode.insertBefore(node, selected.nextSibling);
    }
  });

  // ── MODO MOVER ──
  function createIndicator() {
    var div = document.createElement('div');
    div.style.cssText = 'height:4px;background:#3deb82;border-radius:2px;margin:2px 0;pointer-events:none;position:relative;z-index:99999;box-shadow:0 0 10px rgba(61,235,130,0.7);';
    return div;
  }

  function getDraggables() {
    return document.querySelectorAll('body > *, section > *, main > *, article > *, header > *, footer > *, [class*="container"] > *, [class*="row"] > *, [class*="section"] > *');
  }

  function enableMoveMode() {
    moveMode = true;
    if (selected) { highlight(selected, false); selected = null; }
    dropIndicator = createIndicator();
    getDraggables().forEach(function(el) {
      if (['SCRIPT','STYLE','META','LINK','NOSCRIPT'].includes(el.tagName)) return;
      el.setAttribute('draggable', 'true');
      el.style.outline = '1px dashed rgba(61,235,130,0.3)';
      el.style.cursor = 'grab';
      el.addEventListener('dragstart', onDragStart, true);
      el.addEventListener('dragend', onDragEnd, true);
      el.addEventListener('dragover', onDragOver, true);
      el.addEventListener('drop', onDrop, true);
    });
  }

  function disableMoveMode() {
    moveMode = false;
    if (dropIndicator && dropIndicator.parentNode) dropIndicator.parentNode.removeChild(dropIndicator);
    getDraggables().forEach(function(el) {
      el.removeAttribute('draggable');
      el.style.outline = ''; el.style.cursor = '';
      el.removeEventListener('dragstart', onDragStart, true);
      el.removeEventListener('dragend', onDragEnd, true);
      el.removeEventListener('dragover', onDragOver, true);
      el.removeEventListener('drop', onDrop, true);
    });
  }

  function onDragStart(e) { dragSrc = this; this.style.opacity = '0.35'; e.dataTransfer.effectAllowed = 'move'; }
  function onDragEnd() {
    this.style.opacity = '';
    if (dropIndicator && dropIndicator.parentNode) dropIndicator.parentNode.removeChild(dropIndicator);
    dragSrc = null;
  }
  function onDragOver(e) {
    if (!dragSrc || dragSrc === this) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    var mid = this.getBoundingClientRect().top + this.getBoundingClientRect().height / 2;
    if (e.clientY < mid) this.parentNode.insertBefore(dropIndicator, this);
    else this.parentNode.insertBefore(dropIndicator, this.nextSibling);
  }
  function onDrop(e) {
    if (!dragSrc || dragSrc === this) return;
    e.preventDefault(); e.stopPropagation();
    var mid = this.getBoundingClientRect().top + this.getBoundingClientRect().height / 2;
    var before = e.clientY < mid;
    var srcSel = getUniqueSelector(dragSrc);
    var tgtSel = getUniqueSelector(this);
    if (before) this.parentNode.insertBefore(dragSrc, this);
    else this.parentNode.insertBefore(dragSrc, this.nextSibling);
    window.parent.postMessage({ type: 'ELEMENT_MOVED', srcSelector: srcSel, targetSelector: tgtSel, position: before ? 'before' : 'after' }, '*');
  }
})();
<\/script>`;

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${baseTag}${editorScript}</head>`);
    } else if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}${editorScript}`);
    } else {
      html = `${baseTag}${editorScript}` + html;
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': '',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      `<html><body style="font-family:sans-serif;background:#111;color:#fff;padding:40px;text-align:center">
        <h2>❌ Não foi possível carregar este site</h2>
        <p style="color:#9ca3af">Muitos sites bloqueiam requisições externas por segurança (CORS / firewall).</p>
        <p style="color:#ef4444;font-size:0.85rem">${msg}</p>
        <p style="color:#9ca3af;margin-top:20px">💡 <strong>Solução:</strong> Instale o script na loja e use o modo de conexão direta.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
