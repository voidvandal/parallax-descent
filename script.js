(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';

  // Seeded random so the generated scenery looks the same on every visit
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const R = rng(7);
  const rand = (a, b) => a + R() * (b - a);

  /* =========================================================
     SCENERY GENERATION
     ========================================================= */

  // Mountain ridgeline by midpoint displacement, drawn in real pixels.
  // The landscape is generated over a "world" at least 1400px wide and centred,
  // so peaks keep their shape on narrow phones instead of being squashed.
  function ridgePath(w, h, base, amp, rough, seed) {
    const r = rng(seed), n = 128, pts = new Array(n + 1);
    pts[0] = base + (r() - .5) * amp; pts[n] = base + (r() - .5) * amp;
    let step = n, a = amp;
    while (step > 1) {
      const half = step / 2;
      for (let i = half; i < n; i += step) pts[i] = (pts[i - half] + pts[i + half]) / 2 + (r() - .5) * a;
      a *= rough; step = half;
    }
    const world = Math.max(w, 1400), off = (world - w) / 2;
    let d = `M${-off} ${h} L${-off} ${pts[0].toFixed(1)}`;
    for (let i = 1; i <= n; i++) d += ` L${(i / n * world - off).toFixed(1)} ${pts[i].toFixed(1)}`;
    return d + ` L${world - off} ${h} Z`;
  }
  // y and amp are fractions of the viewport height, measured from the scene top
  const RIDGES = [
    { y: .50, amp: .36, rough: .52, color: '#c27a93', seed: 11, snow: true },
    { y: .58, amp: .32, rough: .5, color: '#94577f', seed: 23, snow: true },
    { y: .67, amp: .28, rough: .5, color: '#6a3f70', seed: 5 },
    { y: .77, amp: .2, rough: .55, color: '#432b5c', seed: 41 },
    { y: .89, amp: .13, rough: .55, color: '#23173a', seed: 3 },
  ];
  // ground and tree heights are fractions of the viewport height
  const TREES = [
    { color: '#5d7f80', ground: .82, min: .09, max: .16, gap: [.3, .6], seed: 9 },
    { color: '#3b5c60', ground: 1.02, min: .15, max: .24, gap: [.3, .6], seed: 19 },
    { color: '#223e44', ground: 1.27, min: .24, max: .36, gap: [.35, .7], seed: 29 },
    { color: '#0d1f24', ground: 1.6, min: .4, max: .62, gap: [.45, .9], seed: 39 },
  ];
  function pine(x, y, h) {
    const w = h * .42, tiers = 4;
    let d = '';
    for (let t = 0; t < tiers; t++) {
      const top = y - h + t * h * .2, bot = y - h * .25 + t * h * .06 - (tiers - 1 - t) * h * .13;
      const ww = w * (.45 + t * .2);
      d += `M${x.toFixed(1)} ${top.toFixed(1)} L${(x - ww / 2).toFixed(1)} ${bot.toFixed(1)} L${(x + ww / 2).toFixed(1)} ${bot.toFixed(1)}Z`;
    }
    d += `M${(x - h * .03).toFixed(1)} ${(y - h * .3).toFixed(1)} h${(h * .06).toFixed(1)} V${(y + 2).toFixed(1)} h${(-h * .06).toFixed(1)}Z`;
    return d;
  }
  function buildScenery() {
    const vh = innerHeight;
    $$('[data-ridge]').forEach(svg => {
      const c = RIDGES[+svg.dataset.ridge], w = svg.clientWidth, h = svg.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const d = ridgePath(w, h, c.y * vh, c.amp * vh, c.rough, c.seed);
      svg.innerHTML = `<path d="${d}" fill="${c.color}"/>` + (c.snow ? `<path d="${d}" fill="none" stroke="#ffe9e0" stroke-opacity=".35" stroke-width="2.5"/>` : '');
    });
    $$('[data-trees]').forEach(svg => {
      const c = TREES[+svg.dataset.trees], r = rng(c.seed), w = svg.clientWidth, h = svg.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const g = c.ground * vh;
      let d = ridgePath(w, h, g, .03 * vh, .5, c.seed + 1);
      for (let x = -30; x < w + 30;) {
        const th = (c.min + r() * (c.max - c.min)) * vh;
        d += pine(x, g + r() * .02 * vh, th);
        x += th * (c.gap[0] + r() * (c.gap[1] - c.gap[0]));
      }
      svg.innerHTML = `<path d="${d}" fill="${c.color}"/>`;
    });
    const bed = $('.seabed'), bw = bed.clientWidth, bh = bed.clientHeight;
    bed.innerHTML = `<svg viewBox="0 0 ${bw} ${bh}" preserveAspectRatio="none"><path d="${ridgePath(bw, bh, bh * .62, bh * .45, .55, 77)}" fill="#02070e"/><path d="${ridgePath(bw, bh, bh * .8, bh * .25, .6, 78)}" fill="#010306"/></svg>`;
  }
  buildScenery();
  let rebuildTimer;
  addEventListener('resize', () => { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(buildScenery, 150); });

  // Fireflies
  const ff = $('#fireflies');
  for (let i = 0; i < (touch ? 18 : 34); i++) {
    const s = document.createElement('span');
    s.className = 'firefly';
    s.style.cssText = `left:${rand(2, 98)}%;top:${rand(0, 95)}%;--t:${rand(4, 9)}s;--dx:${rand(-60, 60)}px;--dy:${rand(-50, 50)}px;animation-delay:${rand(-9, 0)}s`;
    ff.appendChild(s);
  }

  // Fish schools
  const FISH = '<svg viewBox="0 0 44 22"><path d="M2 11 C10 1 22 0 30 11 C22 22 10 21 2 11Z"/><path d="M29 11 L42 3 L39 11 L42 19Z"/><circle cx="9" cy="9" r="1.6" fill="#03131d"/></svg>';
  $$('[data-fish]').forEach(layer => {
    const n = +layer.dataset.fish, size = +layer.dataset.size, dir = +layer.dataset.x > 0 ? 'r' : 'l';
    const cx = rand(20, 60), cy = rand(10, 55);
    for (let i = 0; i < n; i++) {
      const f = document.createElement('span');
      f.className = `fish fish--${dir === 'r' ? 'l' : 'r'}`;   // svg faces left by default; flip to face travel
      f.style.cssText = `left:${cx + rand(-18, 18)}%;top:${cy + rand(-14, 14)}%;--size:${size * rand(.8, 1.2)}px;--color:${layer.dataset.color};--t:${rand(1.6, 3)}s;--b:${rand(-14, 14)}px;animation-delay:${rand(-3, 0)}s`;
      f.innerHTML = FISH;
      layer.appendChild(f);
    }
  });

  // Ambient bubbles
  const bub = $('#bubbles');
  for (let i = 0; i < (touch ? 16 : 30); i++) {
    const b = document.createElement('span');
    b.className = 'bubble';
    b.style.cssText = `left:${rand(0, 100)}%;--s:${rand(4, 16)}px;--t:${rand(10, 22)}s;--d:${rand(-22, 0)}s;--dx:${rand(-60, 60)}px`;
    bub.appendChild(b);
  }

  // Kelp forest
  const kelp = $('#kelp');
  for (let i = 0; i < (touch ? 9 : 16); i++) {
    const h = rand(260, 560), x = rand(-2, 98), w = rand(6, 14);
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'strand');
    svg.setAttribute('viewBox', `0 0 60 ${h}`);
    svg.style.cssText = `left:${x}%;height:${h}px;width:60px;--t:${rand(3, 6)}s;--a:${rand(2, 5)}deg;animation-delay:${rand(-6, 0)}s`;
    let d = `M30 ${h}`;
    for (let y = h; y > 0; y -= 60) d += ` Q${30 + (R() > .5 ? 22 : -22)} ${y - 30} 30 ${y - 60}`;
    svg.innerHTML = `<path d="${d}" stroke-width="${w}" style="stroke:${i % 3 ? '#063a52' : '#0a4a5e'}"/>`;
    kelp.appendChild(svg);
  }

  // Plankton
  $$('[data-plankton]').forEach(layer => {
    for (let i = 0; i < +layer.dataset.plankton * (touch ? .6 : 1); i++) {
      const p = document.createElement('i');
      p.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;--s:${rand(2, 4)}px;--t:${rand(1.5, 4)}s;animation-delay:${rand(-4, 0)}s`;
      layer.appendChild(p);
    }
  });

  // Jellyfish
  const JELLY_COLORS = ['#7ff6ff', '#d6a8ff', '#ff8fd1', '#9dffb0'];
  const jelly = () => {
    let tents = '';
    for (let i = 0; i < 6; i++) {
      const x = 14 + i * 7.2;
      tents += `<path class="tent" d="M${x} 34 q${R() > .5 ? 6 : -6} 18 0 34 t0 34 t0 30"/>`;
    }
    return `<svg viewBox="0 0 60 140"><path class="bell" d="M6 34 C6 8 54 8 54 34 C46 30 40 38 30 34 C20 38 14 30 6 34Z"/>${tents}</svg>`;
  };
  $$('[data-jellies]').forEach(layer => {
    const near = layer.dataset.jellies === 'near';
    const spots = near ? [[6, 20], [78, 10], [86, 60]] : [[18, 6], [40, 30], [66, 22], [28, 70], [58, 64], [10, 46]];
    spots.forEach(([x, y], i) => {
      const j = document.createElement('span');
      j.className = 'jelly' + (near ? '' : ' dim');
      j.setAttribute('role', 'button'); j.setAttribute('aria-label', 'Poke the jellyfish'); j.tabIndex = 0;
      const g = JELLY_COLORS[(i + (near ? 1 : 0)) % JELLY_COLORS.length];
      j.style.cssText = `left:${x}%;top:${y}%;--w:${near ? rand(90, 140) : rand(40, 70)}px;--g:${g};--t:${rand(4, 7)}s;--p:${rand(1.8, 2.8)}s;animation-delay:${rand(-6, 0)}s`;
      j.innerHTML = jelly();
      layer.appendChild(j);
    });
  });

  /* =========================================================
     PARALLAX ENGINE
     ========================================================= */
  const scenes = $$('[data-scene]').map(el => ({ el, top: 0, h: 0, layers: $$('.layer', el).map(l => ({
    el: l, speed: +l.dataset.speed || 0, x: +l.dataset.x || 0, depth: +l.dataset.depth || 0,
  })) }));
  const measure = () => scenes.forEach(s => { s.top = s.el.offsetTop; s.h = s.el.offsetHeight; });
  measure();
  addEventListener('resize', () => { measure(); dirty = true; });
  addEventListener('load', () => { measure(); dirty = true; });

  let dirty = true, lastY = -1;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!touch) addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });
  addEventListener('scroll', () => { dirty = true; }, { passive: true });

  const meterValue = $('#meterValue'), meterLabel = $('#meterLabel'), meterFill = $('#meterFill');
  const chapterLinks = $$('[data-chapter]');
  const fmt = new Intl.NumberFormat('en-US');

  function frame() {
    const y = scrollY, vh = innerHeight;
    const mdx = mouse.x - mouse.sx, mdy = mouse.y - mouse.sy;
    const mouseMoving = Math.abs(mdx) + Math.abs(mdy) > .0005;
    mouse.sx += mdx * .06; mouse.sy += mdy * .06;

    if (dirty || mouseMoving || y !== lastY) {
      lastY = y; dirty = false;
      for (const s of scenes) {
        const rel = y - s.top;
        if (rel < -vh || rel > s.h) continue;   // off screen: skip
        for (const l of s.layers) {
          if (reduce) { l.el.style.transform = ''; continue; }
          const tx = rel * l.x - mouse.sx * l.depth * 80;
          const ty = rel * l.speed - mouse.sy * l.depth * 50;
          l.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        }
      }
      // depth meter: +4,800 m at the top → −3,000 m at the bottom
      const max = document.documentElement.scrollHeight - vh;
      const p = Math.min(1, Math.max(0, y / max));
      const alt = Math.round((4800 - p * 7800) / 10) * 10;
      meterValue.textContent = fmt.format(alt);
      meterLabel.textContent = alt >= 0 ? 'Altitude' : 'Depth';
      meterFill.style.height = p * 100 + '%';
      document.body.classList.toggle('scrolled', y > 40);
      // active chapter
      const mid = y + vh * .5;
      let cur = 0;
      scenes.forEach((s, i) => { if (s.top <= mid) cur = i; });
      chapterLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* =========================================================
     INTERACTION
     ========================================================= */
  // reveal chapter cards
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .25 });
  $$('.chapter').forEach(c => io.observe(c));

  // click the water to blow bubbles
  const water = [$('#shallows'), $('#abyss')];
  water.forEach(sec => sec.addEventListener('click', e => {
    if (e.target.closest('button, a, .jelly, .chapter')) return;
    for (let i = 0; i < 9; i++) {
      const b = document.createElement('span');
      b.className = 'pop';
      b.style.cssText = `left:${e.clientX + rand(-24, 24)}px;top:${e.clientY + rand(-10, 20)}px;--s:${rand(6, 22)}px;--t:${rand(1.6, 3)}s;--dx:${rand(-70, 70)}px;animation-delay:${rand(0, .25)}s`;
      document.body.appendChild(b);
      b.addEventListener('animationend', () => b.remove());
    }
  }));

  // poke jellyfish
  const poke = j => {
    j.classList.remove('poked'); void j.offsetWidth; j.classList.add('poked');
    const r = j.getBoundingClientRect(), g = getComputedStyle(j).getPropertyValue('--g');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span'), a = (i / 14) * Math.PI * 2, d = rand(40, 110);
      s.className = 'spark';
      s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.width * .3}px;--g:${g};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  };
  $$('.jelly').forEach(j => {
    j.addEventListener('click', () => poke(j));
    j.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(j); } });
  });

  // ascend
  $('#ascend').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
})();
