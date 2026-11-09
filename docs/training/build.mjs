// Builds docs/training/index.html from docs/OPDRACHTEN.md.
// Zero dependencies: run with `npm run site` (or `node docs/training/build.mjs`).
// OPDRACHTEN.md stays the single source for the assignment text; everything in src/ is decoration.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { acts as actMeta, deck, groups, roman } from './src/acts.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(here, '..');
const srcDir = join(here, 'src');
const REPO = 'https://github.com/CeriosTesting/cerios-clinic-playwright';
const REPO_DOCS = `${REPO}/blob/main/docs/`;

// ---------------------------------------------------------------------------
// Markdown (only the subset OPDRACHTEN.md uses)
// ---------------------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const listRe = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const isBlank = (l) => /^\s*$/.test(l);
const indentOf = (l) => Math.max(0, l.search(/\S/));
const startsBlock = (l) =>
  /^#{1,6}\s/.test(l) || /^\s*```/.test(l) || /^>/.test(l) || /^-{3,}\s*$/.test(l) || listRe.test(l);

function mapAnchor(hash) {
  let m = hash.match(/^#(\d)(\d)-/);
  if (m) return `#scene-${m[1]}-${m[2]}`;
  m = hash.match(/^#(\d)-/);
  if (m) return `#akte-${m[1]}`;
  return hash;
}

function link(url, html) {
  let href = url;
  let external = true;
  if (url.startsWith('#')) {
    href = mapAnchor(url);
    external = false;
  } else if (!/^[a-z]+:/i.test(url)) {
    href = REPO_DOCS + url; // relative .md link -> GitHub
  }
  const ext = external ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${esc(href)}"${ext}>${html}</a>`;
}

function inline(text) {
  const slots = [];
  const keep = (html) => `\u0000${slots.push(html) - 1}\u0000`;
  let t = text;
  t = t.replace(/`([^`]+)`/g, (_, c) => keep(`<code>${esc(c)}</code>`));
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => keep(link(url, esc(label))));
  t = t.replace(/<(https?:\/\/[^>\s]+)>/g, (_, url) => keep(link(url, esc(url))));
  t = t.replace(/https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"]/g, (url) => keep(link(url, esc(url))));
  t = esc(t);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]);
}

function codeBlock(code, lang) {
  const l = lang || 'text';
  return `<div class="code"><pre><code data-lang="${esc(l)}">${esc(code)}</code></pre></div>`;
}

function prettyDocTitle(url) {
  try {
    const u = new URL(url);
    const part = u.hash ? u.hash.slice(1) : u.pathname.split('/').filter(Boolean).pop() || u.host;
    const words = part.replace(/[-_]+/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  } catch {
    return url;
  }
}

function paragraph(text) {
  const lees = text.match(/^\*\*Leesvoer\*\*\s+<?(https?:\/\/[^\s>]+)>?\s*$/);
  if (lees) {
    const url = lees[1];
    const shown = url.replace(/^https?:\/\//, '');
    return (
      `<a class="leesvoer" href="${esc(url)}" target="_blank" rel="noopener">` +
      `<span class="leesvoer-label">Leesvoer · achter de schermen</span>` +
      `<span class="leesvoer-title">${esc(prettyDocTitle(url))}</span>` +
      `<span class="leesvoer-url">${esc(shown)}</span></a>`
    );
  }
  return `<p>${inline(text)}</p>`;
}

function parseList(lines, start) {
  const first = lines[start].match(listRe);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const sameList = (m) => m && m[1].length === baseIndent && /\d/.test(m[2]) === ordered;
  const items = [];
  let i = start;

  while (i < lines.length) {
    const m = lines[i].match(listRe);
    if (!sameList(m)) break;
    const contentIndent = m[1].length + m[2].length + 1;
    const body = [m[3]];
    i++;

    while (i < lines.length) {
      const l = lines[i];
      if (isBlank(l)) {
        let j = i;
        while (j < lines.length && isBlank(lines[j])) j++;
        if (j < lines.length && indentOf(lines[j]) >= contentIndent) {
          for (; i < j; i++) body.push('');
          continue;
        }
        break;
      }
      const ind = indentOf(l);
      const lm = l.match(listRe);
      if (lm && lm[1].length <= baseIndent) break;
      if (ind >= contentIndent || lm) {
        body.push(l.slice(Math.min(ind, contentIndent)));
        i++;
        continue;
      }
      if (body[body.length - 1] !== '' && !startsBlock(l)) {
        body.push(l.trim()); // lazy continuation line
        i++;
        continue;
      }
      break;
    }
    items.push(body);

    let j = i;
    while (j < lines.length && isBlank(lines[j])) j++;
    if (j > i) {
      if (j < lines.length && sameList(lines[j].match(listRe))) {
        i = j;
        continue;
      }
      break;
    }
  }

  const tag = ordered ? 'ol' : 'ul';
  const html = items
    .map((body) => {
      let inner = blocks(body);
      if (!body.includes('')) inner = inner.replace(/^<p>([\s\S]*?)<\/p>/, '$1');
      return `<li>${inner}</li>`;
    })
    .join('');
  return { html: `<${tag}>${html}</${tag}>`, next: i };
}

function blocks(lines) {
  let out = '';
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if (isBlank(l)) {
      i++;
      continue;
    }
    if (/^-{3,}\s*$/.test(l)) {
      i++;
      continue; // section separators: the layout already separates things
    }
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      const lvl = Math.min(6, m[1].length + 2);
      out += `<h${lvl}>${inline(m[2])}</h${lvl}>`;
      i++;
      continue;
    }
    if ((m = l.match(/^(\s*)```(\w*)\s*$/))) {
      const ind = m[1].length;
      const code = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        code.push(lines[i].slice(Math.min(ind, indentOf(lines[i]))));
        i++;
      }
      i++;
      out += codeBlock(code.join('\n'), m[2]);
      continue;
    }
    if (/^>/.test(l)) {
      const q = [];
      while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      out += `<blockquote>${blocks(q)}</blockquote>`;
      continue;
    }
    if (/^ {4,}\S/.test(l) && !listRe.test(l)) {
      const code = [];
      while (i < lines.length && (/^ {4}/.test(lines[i]) || (isBlank(lines[i]) && /^ {4}/.test(lines[i + 1] || '')))) {
        code.push(lines[i].slice(4));
        i++;
      }
      out += codeBlock(code.join('\n'), 'ts');
      continue;
    }
    if (listRe.test(l)) {
      const r = parseList(lines, i);
      out += r.html;
      i = r.next;
      continue;
    }
    const p = [];
    while (i < lines.length && !isBlank(lines[i]) && !(p.length && startsBlock(lines[i]))) p.push(lines[i++].trim());
    out += paragraph(p.join(' '));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Split OPDRACHTEN.md into acts and scenes
// ---------------------------------------------------------------------------

function fail(msg) {
  console.error(`\n✗ Build gestopt: ${msg}\n  Controleer de koppen in docs/OPDRACHTEN.md (## N Titel / ### N.M Opdracht X).\n`);
  process.exit(1);
}

const mdPath = join(docsDir, 'OPDRACHTEN.md');
const md = readFileSync(mdPath, 'utf8').replace(/\r\n?/g, '\n');
const lines = md.split('\n');

const h2 = [];
lines.forEach((l, idx) => {
  if (/^##\s/.test(l)) h2.push(idx);
});
if (!h2.length) fail('geen hoofdstukken (## ...) gevonden.');

const preamble = lines.slice(0, h2[0]);
const docTitle = (preamble.find((l) => /^#\s/.test(l)) || '# Playwright training').replace(/^#\s+/, '');
const voorAanvang = blocks(preamble.filter((l) => /^>/.test(l)));

const parsedActs = [];
h2.forEach((startIdx, k) => {
  const heading = lines[startIdx];
  const body = lines.slice(startIdx + 1, h2[k + 1] ?? lines.length).filter((l) => !/^-{3,}\s*$/.test(l));
  if (/^##\s+Inhoud\s*$/i.test(heading)) return;
  const m = heading.match(/^##\s+(\d+)\s+(.+?)\s*$/);
  if (!m) fail(`onverwachte hoofdstukkop "${heading}".`);
  const n = Number(m[1]);

  const h3 = [];
  body.forEach((l, idx) => {
    if (/^###\s/.test(l)) h3.push(idx);
  });
  const prologue = blocks(h3.length ? body.slice(0, h3[0]) : body);
  const scenes = h3.map((sIdx, s) => {
    const sh = body[sIdx];
    const sm = sh.match(/^###\s+(\d+)\.(\d+)\s+(.+?)\s*$/);
    if (!sm) fail(`onverwachte opdrachtkop "${sh}".`);
    if (Number(sm[1]) !== n) fail(`"${sh}" staat onder hoofdstuk ${n}.`);
    const title = sm[3];
    const bonus = /\(bonus\)/i.test(title);
    const nr = (title.match(/Opdracht\s+(\d+)/i) || [])[1] || null;
    return {
      id: `scene-${n}-${sm[2]}`,
      index: s + 1,
      title: title.replace(/\s*\(bonus\)\s*/i, '').trim(),
      opdracht: nr,
      bonus,
      html: blocks(body.slice(sIdx + 1, h3[s + 1] ?? body.length)),
    };
  });

  parsedActs.push({ n, title: m[2], prologue: scenes.length ? prologue : '', scenes, slot: !scenes.length, slotHtml: prologue });
});

if (!parsedActs.length) fail('geen hoofdstukken gevonden.');
for (const a of parsedActs) {
  if (a.slot) {
    a.scenes = [{ id: `scene-${a.n}-slot`, index: 1, title: 'Slotscène', opdracht: null, bonus: false, slotscene: true, html: a.slotHtml }];
  }
}

// ---------------------------------------------------------------------------
// HTML pieces
// ---------------------------------------------------------------------------

const metaFor = (n) =>
  actMeta[n] || { deckTitle: `Chapter ${n}`, role: '', tagline: '', bullets: [], lab: null, labTitle: '', labIntro: '', art: '' };

function sceneHtml(act, sc) {
  const kicker = sc.slotscene ? `Akte ${roman(act.n)} · Slotscène` : `Scène ${sc.index}${sc.opdracht ? ` · Opdracht ${sc.opdracht}` : ''}`;
  const heading = sc.slotscene ? 'Slotscène' : esc(sc.title);
  const badge = sc.bonus ? '<span class="badge-toegift" title="Bonusopdracht">Toegift</span>' : '';
  return `
      <article class="scene${sc.bonus ? ' is-bonus' : ''}" id="${sc.id}" data-scene="${sc.id}" data-bonus="${sc.bonus}">
        <header class="scene-head">
          <div>
            <p class="scene-kicker">${kicker}</p>
            <h3>${heading} ${badge}</h3>
          </div>
          <label class="played">
            <input type="checkbox" data-scene-check="${sc.id}" aria-label="${sc.slotscene ? 'Slotscène' : esc(sc.title)} gespeeld">
            <span class="played-ui" aria-hidden="true"><span class="played-mask"></span></span>
            <span class="played-text">Gespeeld</span>
          </label>
        </header>
        <div class="scene-body prose">${sc.html}</div>
      </article>`;
}

function actHtml(act) {
  const meta = metaFor(act.n);
  const bullets = meta.bullets.length
    ? `<ul class="pill-list">${meta.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : '';
  const lab = meta.lab
    ? `
      <section class="lab" id="lab-${act.n}" aria-labelledby="lab-${act.n}-title">
        <header class="lab-head">
          <p class="kicker">Repetitie · Akte ${roman(act.n)}</p>
          <h3 id="lab-${act.n}-title">${esc(meta.labTitle)}</h3>
          <p class="lab-intro">${meta.labIntro}</p>
        </header>
        <div class="lab-mount" data-lab="${meta.lab}"></div>
      </section>`
    : '';
  const required = act.scenes.filter((s) => !s.bonus).length;
  return `
  <section class="akte" id="akte-${act.n}" data-akte="${act.n}" aria-labelledby="akte-${act.n}-title">
    <div class="akte-rail" aria-hidden="true">
      <span class="rail-mark">{{MARK}}</span>
      <span class="rail-num">${act.n}</span>
    </div>
    <div class="akte-main">
      <header class="akte-hero">
        <div class="hero-copy">
          <p class="kicker">Playwright · Akte ${roman(act.n)}</p>
          <h2 id="akte-${act.n}-title">${esc(act.title)}</h2>
          <p class="akte-role">${esc(meta.role)}</p>
          ${bullets}
          <p class="akte-tagline">${meta.tagline}</p>
          <div class="akte-meta">
            <span class="akte-progress" data-akte-progress="${act.n}">0 / ${required} scènes gespeeld</span>
            ${meta.lab ? `<a class="lab-teaser" href="#lab-${act.n}">Repetitie: ${esc(meta.labTitle)} ↓</a>` : ''}
          </div>
        </div>
        <figure class="hero-art art-${act.n}" aria-hidden="true">${meta.art}</figure>
      </header>
      ${act.prologue ? `<div class="proloog prose">${act.prologue}</div>` : ''}
      <div class="scenes">${act.scenes.map((s) => sceneHtml(act, s)).join('')}
      </div>
      ${lab}
      <footer class="akte-foot"><span>CERIOS ACADEMY</span><span>Akte ${roman(act.n)} — ${esc(meta.deckTitle)}</span></footer>
    </div>
  </section>`;
}

function interlude(group) {
  if (group.id === 'advanced') {
    return `
  <section class="pauze" id="pauze" aria-labelledby="pauze-title">
    <div class="pauze-lights" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
    <p class="kicker">Intermezzo</p>
    <h2 id="pauze-title">Pauze</h2>
    <p>De zaallichten gaan even aan. Strek je benen, haal koffie — na de pauze: <strong>Advanced?</strong></p>
    <p class="pauze-fact" data-fact>Wist je dat… Playwright sinds januari 2020 bestaat, gemaakt door het team achter Puppeteer?</p>
    <button class="btn btn-ghost" type="button" data-next-fact>Nog een weetje</button>
  </section>`;
  }
  return '';
}

function groupHeader(group) {
  return `
  <header class="deel" id="deel-${group.id}">
    <p class="kicker">Deel ${groups.indexOf(group) + 1}</p>
    <h2>${esc(group.title)}</h2>
    <p>${group.intro}</p>
  </header>`;
}

function actsHtml() {
  let out = '';
  for (const g of groups) {
    const inGroup = parsedActs.filter((a) => a.n >= g.from && a.n <= g.to);
    if (!inGroup.length) continue;
    out += interlude(g) + groupHeader(g) + inGroup.map(actHtml).join('');
  }
  const leftovers = parsedActs.filter((a) => !groups.some((g) => a.n >= g.from && a.n <= g.to));
  out += leftovers.map(actHtml).join('');
  return out;
}

function playbillHtml() {
  const rows = (g) =>
    parsedActs
      .filter((a) => a.n >= g.from && a.n <= g.to)
      .map((a) => {
        const dots = a.scenes
          .map((s) => `<span class="pb-dot${s.bonus ? ' is-bonus' : ''}" data-dot="${s.id}" title="${esc(s.slotscene ? 'Slotscène' : s.title + (s.bonus ? ' (toegift)' : ''))}"></span>`)
          .join('');
        return `<li><a href="#akte-${a.n}"><span class="pb-act">Akte ${roman(a.n)}</span><span class="pb-lead" aria-hidden="true"></span><span class="pb-title">${esc(a.title)}</span></a><span class="pb-dots" aria-hidden="true">${dots}</span></li>`;
      })
      .join('');
  let out = '';
  groups.forEach((g, gi) => {
    if (gi === 1) out += `<li class="pb-pauze"><a href="#pauze">— Pauze —</a></li>`;
    out += `<li class="pb-group">${esc(g.title)}</li>${rows(g)}`;
  });
  return out;
}

function headerRailHtml() {
  return parsedActs
    .map(
      (a) =>
        `<a class="rail-chip" href="#akte-${a.n}" data-chip="${a.n}" aria-label="Akte ${roman(a.n)}: ${esc(a.title)}"><span>${roman(a.n)}</span></a>`,
    )
    .join('');
}

function slideHtml(s, idx, total) {
  const num = `<span class="s-num">${idx + 1}</span>`;
  const foot = `<span class="s-foot">CERIOS ACADEMY</span>`;
  if (s.type === 'title' || s.type === 'thanks') {
    return `<section class="slide slide-dark slide-${s.type}" data-slide="${idx}" aria-roledescription="dia" aria-label="Dia ${idx + 1} van ${total}">
      <div class="s-dark-copy">
        ${s.type === 'title' ? '<div class="s-brand">{{WORDMARK}}</div>' : ''}
        ${(s.lines || []).map((l, i) => `<p class="${i === 0 && s.type === 'thanks' ? 's-big' : ''}">${l}</p>`).join('')}
        ${s.accent ? `<p class="s-accent">${s.accent}</p>` : ''}
        ${s.contact ? `<ul class="s-contact">${s.contact.map((c) => `<li>${c}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="s-dark-art" aria-hidden="true">{{MASKS}}</div>
    </section>`;
  }
  const bullets = s.columns
    ? `<div class="s-cols">${s.columns
        .map((c) => `<div><p class="s-colhead">${c.title}</p><ul class="pill-list">${c.items.map((b) => `<li>${b}</li>`).join('')}</ul></div>`)
        .join('')}</div>`
    : `${s.text ? `<p class="s-text">${s.text}</p>` : ''}<ul class="pill-list">${(s.bullets || []).map((b) => `<li>${b}</li>`).join('')}</ul>`;
  return `<section class="slide" data-slide="${idx}" ${s.act ? `data-slide-act="${s.act}"` : ''} aria-roledescription="dia" aria-label="Dia ${idx + 1} van ${total}">
      <div class="s-rail" aria-hidden="true">{{MARK}}</div>
      <div class="s-body">
        <p class="kicker">${s.kicker || 'Playwright'}</p>
        <h2>${s.title}</h2>
        ${bullets}
      </div>
      ${s.art ? `<div class="s-art hero-art ${s.artClass || ''}" aria-hidden="true">${s.art}</div>` : ''}
      ${num}${foot}
    </section>`;
}

function presenterHtml() {
  const slides = [...deck.before];
  for (const a of parsedActs) {
    const meta = metaFor(a.n);
    slides.push({ type: 'bullets', act: a.n, title: meta.deckTitle, bullets: meta.deckBullets || meta.bullets, text: meta.deckText, art: meta.art, artClass: `art-${a.n}` });
  }
  slides.push(...deck.after);
  return slides.map((s, i) => slideHtml(s, i, slides.length)).join('');
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

const read = (f) => readFileSync(join(srcDir, f), 'utf8');
// Official Cerios logos from the Cerios Academy design system, drawn in currentColor.
const MARK = read('logo.svg');
const MASKS = read('masks.svg');
const WORDMARK = `<span class="wordmark">${read('logo-full.svg').trim()}<span class="wm-academy">Academy</span></span>`;

const data = {
  acts: parsedActs.map((a) => ({
    n: a.n,
    roman: roman(a.n),
    title: a.title,
    scenes: a.scenes.map((s) => ({ id: s.id, title: s.slotscene ? 'Slotscène' : s.title, opdracht: s.opdracht, bonus: s.bonus })),
  })),
};

const buildDate = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

const fill = (tpl, map) => Object.entries(map).reduce((acc, [k, v]) => acc.split(`{{${k}}}`).join(v), tpl);

let html = read('template.html');
html = fill(html, {
  STYLES: read('styles.css'),
  ACTS: actsHtml(),
  PLAYBILL: playbillHtml(),
  RAIL: headerRailHtml(),
  PRESENTER: presenterHtml(),
  VOOR_AANVANG: voorAanvang,
  DOC_TITLE: esc(docTitle),
  BUILD_DATE: esc(buildDate),
  OPDRACHTEN_URL: `${REPO_DOCS}OPDRACHTEN.md`,
  INSTALLATION_URL: `${REPO_DOCS}INSTALLATION.md`,
  CLINIC_START_URL: `${REPO_DOCS}CERIOS_CLINIC_START.md`,
  REPO_URL: REPO,
  DATA: JSON.stringify(data).replace(/</g, '\\u003c'),
  SCRIPT: read('app.js'),
});
// Second pass: snippets inserted above contain these tokens too.
html = fill(html, { MARK, MASKS, WORDMARK });

const leftover = html.match(/\{\{[A-Z_]+\}\}/);
if (leftover) fail(`placeholder ${leftover[0]} niet ingevuld.`);

const outPath = join(here, 'index.html');
writeFileSync(outPath, html);

const sceneCount = parsedActs.reduce((n, a) => n + a.scenes.filter((s) => s.opdracht).length, 0);
const bonusCount = parsedActs.reduce((n, a) => n + a.scenes.filter((s) => s.bonus).length, 0);
console.log(
  `✓ docs/training/index.html gebouwd uit OPDRACHTEN.md — ${parsedActs.length} aktes, ${sceneCount} opdrachten (waarvan ${bonusCount} toegift), ${Math.round(html.length / 1024)} KB`,
);
