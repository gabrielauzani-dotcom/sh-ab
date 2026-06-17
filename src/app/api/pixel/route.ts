import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const siteId = searchParams.get('site');

  if (!siteId) {
    return new Response('// Error: Missing site parameter', {
      headers: { 'Content-Type': 'application/javascript' },
      status: 400,
    });
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      status: 'RUNNING',
      site: { domain: { contains: siteId } },
    },
    include: { modifications: true },
  });

  if (!experiment) {
    return new Response(`console.log('[AB-Platform] Nenhum teste ativo para: ${siteId}');`, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const exp = experiment as typeof experiment & { urlCondition?: string; goalSelector?: string };
  const modsJson = JSON.stringify(exp.modifications);
  const chance = exp.trafficDistribution;
  const expId = exp.id;
  const urlCondition = exp.urlCondition ?? '';
  const goalSelector = exp.goalSelector ?? '';
  // Detecta a origem da plataforma para o endpoint de tracking
  const host = request.headers.get('host') ?? '';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const trackBase = `${proto}://${host}/api/track`;

  const pixelScript = `
(function() {
  var EXPERIMENT_ID = ${JSON.stringify(expId)};
  var CHANCE = ${chance};
  var URL_CONDITION = ${JSON.stringify(urlCondition)};
  var GOAL_SELECTOR = ${JSON.stringify(goalSelector)};
  var TRACK_URL = ${JSON.stringify(trackBase)};

  if (URL_CONDITION && window.location.pathname.indexOf(URL_CONDITION) === -1) return;

  function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
  }
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + 24*60*60*1000*days);
    document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString();
  }
  function getSessionId() {
    var sid = getCookie('ab_sid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      setCookie('ab_sid', sid, 30);
    }
    return sid;
  }
  function track(type, variant) {
    var sid = getSessionId();
    var img = new Image();
    img.src = TRACK_URL + '?exp=' + EXPERIMENT_ID + '&v=' + variant + '&t=' + type + '&sid=' + sid;
  }

  function applyModifications() {
    var mods = ${modsJson};
    mods.forEach(function(mod) {
      var el = document.querySelector(mod.targetSelector);
      if (!el) return;
      if (mod.type === 'TEXT') {
        el.innerText = mod.value;
      } else if (mod.type === 'CSS') {
        try { Object.assign(el.style, JSON.parse(mod.value)); } catch(e) {}
      } else if (mod.type === 'INSERT_HTML_BEFORE') {
        el.insertAdjacentHTML('beforebegin', mod.value);
      } else if (mod.type === 'INSERT_HTML_AFTER') {
        el.insertAdjacentHTML('afterend', mod.value);
      } else if (mod.type === 'HIDE') {
        el.style.display = 'none';
      }
    });
  }

  function attachGoalTracking(variant) {
    if (!GOAL_SELECTOR) return;
    document.querySelectorAll(GOAL_SELECTOR).forEach(function(el) {
      el.addEventListener('click', function() {
        track('click', variant);
      }, { once: true });
    });
    // Re-tenta após 2s para elementos renderizados via JS (ex: Shopify themes)
    setTimeout(function() {
      document.querySelectorAll(GOAL_SELECTOR).forEach(function(el) {
        el.addEventListener('click', function() {
          track('click', variant);
        }, { once: true });
      });
    }, 2000);
  }

  function initSplit() {
    var cookieName = 'ab_' + EXPERIMENT_ID;
    var variant = getCookie(cookieName);
    if (!variant) {
      variant = (Math.random() * 100 <= CHANCE) ? 'B' : 'A';
      setCookie(cookieName, variant, 30);
    }
    if (variant === 'B') applyModifications();
    track('view', variant);
    attachGoalTracking(variant);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplit);
  } else {
    initSplit();
  }
})();
`;

  return new Response(pixelScript, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
