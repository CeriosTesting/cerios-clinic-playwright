// Extras per act that are not in OPDRACHTEN.md: the slide-deck bullets, the theater role,
// the rehearsal lab and an illustration. The assignment text itself always comes from OPDRACHTEN.md.

export const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n);

export const groups = [
  { id: 'basics', title: 'Basics', from: 1, to: 3, intro: 'Opnemen, terugspoelen en de spotlight richten. Na deze drie aktes schrijf je je eerste echte testen.' },
  { id: 'advanced', title: 'Advanced?', from: 4, to: 7, intro: 'Het decor wordt professioneler: herbruikbare rollen, een backstage pass, toegankelijkheid en een heel ensemble tegelijk op het toneel.' },
  { id: 'expert', title: 'Expert?', from: 8, to: 8, intro: 'De première is geweest. Tijd voor de recensie: hoe zou de regisseur het gedaan hebben?' },
];

const svg = (body, vb = '0 0 200 160') =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const acts = {
  1: {
    deckTitle: 'Chapter 1 – Record and playback',
    role: 'De eerste repetitie — jij speelt, Playwright schrijft het script.',
    bullets: ['localhost:5173', 'Playwright Test for VSCode extension'],
    tagline: 'Rol: <strong>de souffleur</strong> (Codegen) fluistert je elke regel code in.',
    lab: 'souffleur',
    labTitle: 'De souffleur',
    labIntro: 'Kijk mee hoe een opname ontstaat: elke klik en elke toetsaanslag wordt direct een regel Playwright-code. Zo werkt <em>Record new</em> in VS Code ook.',
    art: svg(
      `<rect x="30" y="34" width="140" height="92" rx="8"/>
       ${[50, 72, 94, 116, 138, 160].map((x, i) => `<line x1="${x - 4}" y1="50" x2="${x - 4}" y2="112"/><rect x="${x - 11}" y="${58 + ((i * 17) % 40)}" width="14" height="9" rx="2" fill="currentColor"/>`).join('')}
       <circle cx="168" cy="26" r="9" fill="#E2574C" stroke="none"/>`,
    ),
  },
  2: {
    deckTitle: 'Chapter 2 – Trace viewer',
    role: 'De inspecteur — waarom gaat de test fout? Nou daarom!',
    bullets: ['Waarom gaat de test fout? Nou daarom!', 'De gehele geschiedenis van een test inzichtelijk. Teststeps, networktrace en opname van alle acties'],
    tagline: 'Rol: <strong>de inspecteur</strong> spoelt de voorstelling terug, frame voor frame.',
    lab: 'trace',
    labTitle: 'Terugspoelen',
    labIntro: 'Een nagebootste trace van een mislukte test. Klik door de acties en wissel tussen <em>Before</em> en <em>After</em>, precies zoals in de echte trace viewer.',
    art: svg(
      `<rect x="20" y="104" width="160" height="22" rx="4"/>
       ${[36, 64, 92, 120, 148].map((x) => `<line x1="${x}" y1="108" x2="${x}" y2="122"/>`).join('')}
       <circle cx="88" cy="62" r="30"/><line x1="110" y1="84" x2="134" y2="106" stroke-width="7"/>
       <path d="M74 62 l10 10 l18 -20"/>`,
    ),
  },
  3: {
    deckTitle: 'Chapter 3 – Locators',
    role: 'De belichting — wie staat er precies in de spotlight?',
    bullets: ['De motor van Playwright', 'Auto-waiting en retry-ability', 'Elementen identificeren zoals de mens dat doet (GetByRole)'],
    tagline: 'Rol: <strong>de belichter</strong>. Eén spot, één acteur: zo houdt Playwright van locators.',
    lab: 'spotlight',
    labTitle: 'Spotlight',
    labIntro: 'Een toneel met drie acteurs, opgebouwd met geneste <code>div</code>\'s, net als de dokterkaarten. Typ een locator en kijk wie er in de spotlight komt. Raakt hij meer dan één element? Dan krijg je dezelfde <em>strict mode violation</em> als in Playwright.',
    art: svg(
      `<path d="M60 18 l-8 -10 h28 l-8 10z" fill="currentColor"/>
       <path d="M58 22 L20 140 H140 L74 22" stroke-dasharray="4 7" />
       <circle cx="92" cy="96" r="10"/><path d="M78 140 v-18 a14 14 0 0 1 28 0 v18"/>
       <ellipse cx="80" cy="141" rx="56" ry="6"/>`,
    ),
  },
  4: {
    deckTitle: 'Chapter 4 – DRY with POM',
    role: 'Het script — één rol, door elke scène hergebruikt.',
    bullets: ['DON’T REPEAT YOURSELF!', 'Page object Model', 'POM hoeft niet persé een hele pagina te zijn', 'Nested POM -> PCM (Page Component Model)'],
    tagline: 'Rol: <strong>de regisseur</strong> schrijft één keer de rol uit; elke scène speelt hem na.',
    lab: 'pom',
    labTitle: 'Improvisatie vs. script',
    labIntro: 'Drie opgenomen testen tegen een (nep-)kaartverkoop. Laat de regisseur een knoptekst aanpassen en tel hoeveel plekken je moet wijzigen: met en zonder Page Object.',
    art: svg(
      `<path d="M10 120 C 50 90, 80 92, 110 108 S 170 112, 190 96"/>
       <path d="M10 138 C 60 116, 100 120, 140 130 S 180 128, 192 122"/>
       <path d="M30 104 C 60 80, 90 80, 120 94" stroke-dasharray="2 8"/>
       <circle cx="150" cy="40" r="16"/>`,
    ),
  },
  5: {
    deckTitle: 'Chapter 5 – Save login with Storage State',
    role: 'De backstage pass — één keer langs de portier, daarna vrije toegang.',
    bullets: ['Het is niet nodig om inloggen 100x te testen per run', 'Dat kan sneller!', 'Authentication met cookies en local storage'],
    tagline: 'Rol: <strong>de portier</strong> controleert je pas één keer per voorstelling.',
    lab: 'backstage',
    labTitle: 'Backstage pass',
    labIntro: 'Hoeveel tijd kost het om voor elke test opnieuw in te loggen? Schuif met het aantal testen en de inlogtijd en zie wat één opgeslagen login je oplevert.',
    art: svg(
      `<rect x="62" y="70" width="76" height="62" rx="8"/>
       <path d="M76 70 v-16 a24 24 0 0 1 48 0 v16"/>
       <circle cx="100" cy="96" r="7" fill="currentColor"/><line x1="100" y1="100" x2="100" y2="116"/>
       ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${30 + i * 28}" cy="22" r="2.5" fill="currentColor"/>`).join('')}`,
    ),
  },
  6: {
    deckTitle: 'Chapter 6 – Accessibility testing',
    role: 'Zaallicht — iedereen moet de voorstelling kunnen volgen.',
    bullets: [],
    deckText:
      'Digitale toegankelijkheid van websites wordt steeds belangrijker. De overheid wil dat iedereen mee kan doen in de digitale samenleving. Daarom moeten websites en mobiele apps van overheidsinstanties toegankelijk zijn voor iedereen. Ook voor mensen met een beperking. Dat bereik je door de internationale standaard voor toegankelijkheid toe te passen.',
    tagline: 'Rol: <strong>de zaalwacht</strong> zorgt dat iedereen een goede plek heeft.',
    lab: 'zaallicht',
    labTitle: 'Zaallicht',
    labIntro: 'Bekijk deze hele site eens door andere ogen. De knoppen hieronder veranderen de <strong>hele pagina</strong>. Met <kbd>Esc</kbd> gaat het zaallicht weer normaal aan.',
    art: svg(
      `${[30, 82, 134].map((x) => `<rect x="${x}" y="52" width="40" height="40" rx="8" transform="rotate(-8 ${x + 20} 72)"/>`).join('')}
       <circle cx="50" cy="64" r="4" fill="currentColor"/><path d="M50 70 v10 h8 l4 6"/><path d="M42 82 a9 9 0 0 0 16 4"/>
       <path d="M96 64 a8 8 0 0 1 12 10 q-4 3 -4 7"/><path d="M110 60 a14 14 0 0 1 0 22" />
       <circle cx="156" cy="62" r="3.5" fill="currentColor"/><path d="M156 67 l-3 10 l-4 9 M156 67 l3 9 M150 72 l14 -2 M159 76 l12 12"/>`,
    ),
  },
  7: {
    deckTitle: 'Chapter 7 – Configuration and run tests parallel',
    role: 'Het ensemble — meerdere acteurs, meerdere podia, tegelijk.',
    bullets: ['Runnen zoals in een pipeline', 'Nog meer snelheid door parallelisatie', 'Meerdere projecten / meerdere browsers'],
    tagline: 'Rol: <strong>het ensemble</strong>: workers spelen scènes tegelijk.',
    lab: 'ensemble',
    labTitle: 'Ensemble',
    labIntro: 'Workers zijn acteurs: elk speelt één test tegelijk. Speel met <code>workers</code>, <code>fullyParallel</code> en de <code>projects</code> en zie hoe lang de voorstelling duurt.',
    art: svg(
      `<path d="M40 80 C 40 40, 96 40, 100 80 S 160 120, 160 80 S 104 40, 100 80 S 40 120, 40 80 Z"/>
       <path d="M58 46 l-8 -4 l2 9"/><path d="M142 114 l8 4 l-2 -9"/>
       ${['Plan', 'Code', 'Test', 'Deploy'].map((_, i) => `<rect x="${18 + i * 44}" y="132" width="36" height="12" rx="3"/>`).join('')}`,
    ),
  },
  8: {
    deckTitle: 'Chapter 8 – Compare with the trainer’s framework',
    role: 'De recensie — appels en peren? “Well, we’re both fruit.”',
    bullets: [],
    tagline: 'Rol: <strong>de recensent</strong>. Vergelijk jouw regie met die van de trainer.',
    lab: 'recensie',
    labTitle: 'De recensie',
    labIntro: 'Leg jouw uitwerking naast die van de trainer en geef per onderdeel je oordeel. Er is geen fout antwoord: het gaat erom dat je weet <em>waarom</em>.',
    art: svg(
      `<circle cx="70" cy="92" r="32"/><path d="M70 60 q2 -14 12 -18"/><path d="M74 56 q14 -10 22 0 q-10 8 -22 0z" fill="currentColor"/>
       <circle cx="138" cy="92" r="32"/><circle cx="138" cy="62" r="3" fill="currentColor"/>
       <path d="M104 28 q-10 -8 -20 0" stroke-dasharray="2 6"/>`,
    ),
  },
};

// Presenter mode: the slide deck around the chapter slides (slide texts follow the PowerPoint).
export const deck = {
  before: [
    { type: 'title', lines: ['Playwright', 'Play your cards right', 'With the BASICS'], accent: 'Cerios Academy' },
    {
      kicker: 'Huishouden',
      title: 'Laat het kantoor opgeruimd achter voor je collega’s morgen ☺',
      bullets: ['Vaat in de vaatwasser', 'Afval in de prullenbak', 'Blikjes en flesjes in de box in de keuken', 'Catering: buffetwarmers afsluiten (deksel erop/vlam doven)', 'Catering: borden en bestek opbergen in kratjes'],
    },
    {
      title: 'Playwright',
      text: 'Sinds januari 2020 voor het eerst aangekondigd door Microsoft. Gemaakt door een team wat eerder aan soortgelijke projecten heeft gewerkt, bijvoorbeeld Puppeteer van Google.',
      bullets: ['Het is open source', 'Het is een library, geen framework', 'Node.js, Python, Java en .NET'],
    },
    {
      title: 'Highlights',
      columns: [
        { title: 'Any browser · Any platform · One API', items: ['Chromium, WebKit en Firefox', 'Windows, Linux en macOS — lokaal of op CI', 'Headless of headed'] },
        { title: 'Resilient · No flaky tests', items: ['Auto-wait', 'Web-first assertions', 'Tracing'] },
        { title: 'Powerful tooling', items: ['Codegen', 'Playwright inspector', 'Trace viewer'] },
        { title: 'Full isolation · Fast execution', items: ['Browser context per test', 'Log in once'] },
      ],
    },
    {
      title: 'Chapters',
      columns: [
        { title: 'Basics', items: ['Installations', 'Chapter 1 – Record and playback', 'Chapter 2 – Trace viewer', 'Chapter 3 – Locators'] },
        { title: 'Advanced?', items: ['Chapter 4 – DRY with POM', 'Chapter 5 – Save login with Storage State', 'Chapter 6 – Accessibility testing', 'Chapter 7 – Configuration and run tests parallel'] },
        { title: 'Expert?', items: ['Chapter 8 – Compare with the trainer’s framework'] },
      ],
    },
    { title: 'Prerequisites – Installation', bullets: ['NodeJs', 'VS-Code', 'Playwright', 'Docker'] },
    {
      title: 'Installation: System under Test',
      text: 'Cerios Clinic — 3 applicaties, 1 ecosysteem om te testen.',
      bullets: ['Doctor Portal · Assistant Portal · Patient Portal', 'PostgreSQL · Keycloak · Swagger · Docker', 'Patient Portal: http://localhost:5173', 'Mailbox (Mailpit): http://localhost:8025'],
    },
  ],
  after: [
    {
      type: 'thanks',
      lines: ['Dank voor jullie aandacht'],
      contact: ['www.linkedin.com/company/cerios/', 'Academy@cerios.nl', 'Helvoirt, Utrecht, Rotterdam, Hoogeveen', 'www.cerios.nl'],
    },
  ],
};
