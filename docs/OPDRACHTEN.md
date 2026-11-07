# Playwright training — Basics

---

> **Waar maak je de opdrachten?**
>
> Alle opdrachten maak je in jouw eigen Playwright project dat je tijdens de installatie hebt aangemaakt:
> de map **`C:\GIT\cerios-playwright`** (zie [INSTALLATION.md](INSTALLATION.md#3-installatie-playwright)).
> Open deze map in VS Code via **File -> Open Folder …** voordat je begint. Nieuwe testen komen in de
> map `tests` van dat project.

---

## Inhoud

1. [Record and playback](#1-record-and-playback)
   - 1.1 [Opdracht 1](#11-opdracht-1)
   - 1.2 [Opdracht 2](#12-opdracht-2)
   - 1.3 [Opdracht 3](#13-opdracht-3)
2. [Trace viewer](#2-trace-viewer)
   - 2.1 [Opdracht 4](#21-opdracht-4)
3. [Locators](#3-locators)
   - 3.1 [Opdracht 5](#31-opdracht-5)
   - 3.2 [Opdracht 6](#32-opdracht-6)
   - 3.3 [Opdracht 7 (Bonus)](#33-opdracht-7-bonus)
   - 3.4 [Opdracht 8 (Bonus)](#34-opdracht-8-bonus)
4. [DRY with POM](#4-dry-with-pom)
   - 4.1 [Opdracht 9](#41-opdracht-9)
   - 4.2 [Opdracht 10](#42-opdracht-10)
5. [Save login with Storage State](#5-save-login-with-storage-state)
   - 5.1 [Opdracht 11](#51-opdracht-11)
   - 5.2 [Opdracht 12](#52-opdracht-12)
6. [Accessibility testing](#6-accessibility-testing)
   - 6.1 [Opdracht 13](#61-opdracht-13)
7. [Configuration and run tests parallel](#7-configuration-and-run-tests-parallel)
   - 7.1 [Opdracht 14](#71-opdracht-14)
8. [Compare with the trainer's framework](#8-compare-with-the-trainers-framework)

---

## 1 Record and playback

Nu gaan we dan onze eerste test maken. We gaan gebruik maken van de **Cerios Clinic app** op
`http://localhost:5173`. De opdracht is om de registratie te doorlopen. Gelukkig heeft het Playwright team
een extension gebouwd voor VS Code wat het maken en debuggen van testen erg makkelijk maakt.

- Installeer eerst de extensie door links op **Extensions** te klikken, te zoeken naar
  **Playwright Test for VSCode** en druk op **install**
- Druk nu op **Testing** met het logo van een Erlenmeyer; hier zullen geen testen staan, want die hebben
  we eerder al opgeruimd. Wel zullen we onderin een nieuw Playwright menu zien na de installatie van
  de extension
- Druk hier op **Record new**

Er zal een Chrome browser worden gestart. Kijk goed naar het icoontje in jouw startbalk, want deze zal
net wat andere kleuren hebben. Dit is dus niet jouw lokale installatie, maar Playwrights eigen Chrome
browser. Daarnaast zal er ook een testfile aangemaakt worden onder de folder `tests`. Nu is het tijd om
al onze acties te recorden naar Playwright code.

- Plak de url `http://localhost:5173/register` in de record browser en druk op enter
- Vul het registratieformulier in met een e-mailadres en wachtwoord
- Dien het formulier in
- Sluit de browser
- Kijk nu in jouw `tests` folder; hier is een nieuw testfile gemaakt.
- Probeer te snappen wat er nu gebeurt.
- Run jouw recording door naar het test menu te gaan.Hier staat nu als het goed is de zojuist
opgenomen test.
- Je kan nu op het groene pijltje in de testfile drukken of via de Test explorer. Probeer het eens en kijk wat er gebeurt.

Wat gebeurt hier nou eigenlijk? `page` is de definitie van een pagina binnen de browser. Hiermee kan je
vervolgens elementen op een pagina identificeren en acties op uitvoeren zoals klikken, invullen of uitlezen.

Dit is toch fantastisch? Het Patient Portal laadt netjes op en toch zie je geen regels code om te moeten
wachten. Hoe kan dit? Playwright heeft t.o.v. andere libraries een **autowait mechanisme** ingebouwd.
Zodra jij dus op een locator een actie wilt uitvoeren, wacht Playwright eerst totdat de locator gevonden
kan worden en dat die actief is om de actie op uit te voeren.

### 1.1 Opdracht 1

Neem een nieuwe test op. Navigeer naar `http://localhost:5173/register` en doorloop het
registratieformulier. Verifieer dat het successcherm het door jou ingevoerde e-mailadres toont.
Kijk in de recording browser bovenin met welke opties je een expect/assert/verify kan doen.

In de emailbox (http://localhost:8025) kan je je email bevestigen. Voor nu prima om dat handmatig te doen. Dit helpt voor de volgende opdrachten. Log nu uit.

### 1.2 Opdracht 2

Neem een nieuwe test op. Log in via de SSO-flow:

1. Navigeer naar `http://localhost:5173/login`
2. Klik op de knop **Sign in** — je wordt doorgestuurd naar het Keycloak-inlogscherm
3. Vul in het Keycloak-formulier een geldig patiëntaccount in, bijv. `patient.wilson@example.com` /
   `Patient1234!`
4. Klik op de inlogknop — je wordt doorgestuurd naar de homepagina van het Patient Portal

Probeer nu m.b.v. Record at cursor de test uit te breiden door de navigatie-items **My Appointments**, **Medical History**, **Prescriptions**, **Our Doctors** en **Profile** aan te klikken. Dus niet een nieuwe test maken.

### 1.3 Opdracht 3

Probeer nu eens één of meerdere andere assertions uit.

**Leesvoer** <https://playwright.dev/docs/test-assertions>

---

## 2 Trace viewer

De trace viewer van Playwright is wel echt een key feature die je out-of-the-box krijgt. Een trace geeft
jou toegang tot de gehele historie van een test. Welke acties er hebben plaatsgevonden, welke network
calls zijn er geweest en waar is de test nou precies gefaald? Dit kan je hier allemaal uit halen. Veel
meer betekenis dan een screenshot of een video.

In het Playwright test menu kan je de optie **Show trace viewer** aanzetten. Het is niet mogelijk om
zowel de browser als de trace viewer aan te zetten. Als de test klaar is, dan krijg je de gezipte trace
direct te zien.

### 2.1 Opdracht 4

Gebruik de trace viewer op één van jouw eerder gemaakte testen. Kijk wat je allemaal kan zien in deze
trace. Pak of maak nu een test met een `expect` erin. Wijzig de verwachte waarde en zorg dus voor een
fout. Run de trace viewer nu en kijk wat er gebeurt. Handig toch!?

---

## 3 Locators

Locators zijn de motor voor Playwrights auto-waiting en retry-ability. Locators zijn bestemd om elementen
op een pagina te vinden op elk mogelijk moment. De makers van Playwright zijn ervan overtuigd dat
locators moeten worden opgezet zoals het voor ons mensen logisch is. Geen magische XPath of CSS
selectors, maar op basis van zichtbare teksten en rollen. Natuurlijk kan je nog steeds aan de slag met
CSS/XPath.

### 3.1 Opdracht 5

Record een nieuwe test. We gaan naar de pagina **Our Doctors** (`http://localhost:5173/doctors`).

> **Let op:** alleen `/login` en `/register` zijn zonder login te bereiken. Alle andere pagina's sturen
> je terug naar `/login` als je niet bent ingelogd. Elke Playwright test start met een schone browser,
> dus ook zonder login. Log daarom eerst in via de SSO-flow zoals in Opdracht 2, en klik daarna in het
> menu op **Our Doctors**.
>
> Tip: je kan ook jouw test uit Opdracht 2 als startpunt gebruiken en met **Record at cursor** verder
> gaan.

Er staan 3 dokterkaarten op de pagina. Klik op één van de kaarten, bijv. op **Dr. James Smith**.

Kijk goed naar de gegenereerde locator. Je zal iets zien als:

    page.locator('div').filter({ hasText: 'JSDr. James SmithGeneral' }).nth(4).click();

Wat valt je op? Waarom staat er `nth(4)`? Dit gaat niet over het kiezen *tussen* 3 dokters — elke
dokter heeft immers unieke tekst. Het probleem is dat `.filter({ hasText: '...' })` op een brede `div`
meerdere **geneste** `div`-elementen teruggeeft die allemaal dezelfde tekst bevatten: de kaart zelf,
de flex-wrapper erbinnen, de tekst-container, enzovoort. Playwright kiest dan met `nth(4)` de
juiste nesting-laag.

Haal de `nth(4)` er eens weg en kijk wat er gebeurt.

### 3.2 Opdracht 6

Probeer eens een paar locators om te schrijven naar iets anders dan hetgeen Playwright voor je maakt.

**Leesvoer** <https://playwright.dev/docs/locators>

### 3.3 Opdracht 7 (Bonus)

Na het verwijderen van `nth(4)` geeft Playwright een strictness exception: hij vindt meerdere geneste
`div`-elementen die allemaal de zoektekst bevatten. De root cause is de te brede `div`-locator.

Probeer de locator te herschrijven zodat je **niet** begint met een brede `div`, maar met de specifieke
CSS-klasse van de kaart. Begin op `.card`-niveau en filter daarbinnen op de naam van de dokter —
zonder gebruik van `nth()`.

**Leesvoer** https://playwright.dev/docs/locators#matching-inside-a-locator

### 3.4 Opdracht 8 (Bonus)

In Opdracht 5 en 7 heb je gezien hoe je met `.filter({ hasText: '...' })` een specifieke kaart uit een
lijst van gelijkende elementen selecteert — te beginnen bij de specifieke CSS-klasse van de kaart, en
zonder gebruik te maken van `nth()`. Tijd om deze techniek zelfstandig toe te passen.

Ga naar de afsprakenpagina (`http://localhost:5173/appointments`). Ook deze pagina is alleen te zien
als je bent ingelogd: begin jouw test dus weer met inloggen (zoals in Opdracht 5) en klik daarna in
het menu op **My Appointments**. Hier staan meerdere afspraakkaarten
die qua opbouw sterk lijken op de dokterkaarten van eerder. Zoek zelf (bijv. via de DevTools) de
CSS-klasse van een afspraakkaart en filter daarbinnen op tekst — bijvoorbeeld een dokternaam of datum —
om één specifieke afspraak te selecteren.

**Leesvoer** <https://playwright.dev/docs/locators#filtering-locators>

---

## 4 DRY with POM

Als we terugkijken naar de opgenomen testen zien we vaak dezelfde locators en acties terugkomen. Dit
zorgt natuurlijk voor een niet-onderhoudbaar framework, maar is wel leuk om snel aan te tonen dat iets
werkt. Laat het daar ook bij aub!

DRY oftewel *Don't Repeat Yourself* is een design principe dat ervoor zorgt dat zodra je een string of
actie 2× voorbij ziet komen je moet proberen dit op een generieke simpele manier op te zetten. POM oftwel
*Page Object Model* is hier een manier voor. Een POM kan een hele pagina zijn of een onderdeel van een
pagina. Denk bijvoorbeeld aan iets wat vrijwel op elke pagina aanwezig is, zoals een menubar, footer of
header. Een POM kan ook een andere generieke POM in zich hebben; dit noem ik het liefst een
*Page Component*.

### 4.1 Opdracht 9

Gebruik één van de vooraf aangemaakte patiëntaccounts, bijv. `patient.wilson@example.com` /
`Patient1234!`. Neem een test op die inlogt via de SSO-flow:

1. Navigeer naar `http://localhost:5173/login`
2. Klik op de knop **Sign in**
3. Vul in het Keycloak-inlogformulier (`#username` en `#password`) de credentials in
4. Klik op `#kc-login`
5. Verifieer dat je op de homepagina bent geland (bijv. controleer de heading "Good day, ...")

### 4.2 Opdracht 10

Maak in de root van jouw project (dus naast de map `tests`) een nieuwe map aan genaamd `pageObjects`.
Druk hiervoor in de Explorer met de rechtermuisknop op een leeg veld en kies voor **New Folder**. Maak
in deze map een file aan genaamd `login-page.ts`; dit zal het nieuwe page object worden. Maak gebruik van jouw opgenomen test en volg het voorbeeld van Playwright zelf.
Let erop dat je methodes beschrijvende namen krijgen. Maak een nieuwe test met de hand en maak gebruik
van de POM. Vergelijk de 2 testen met elkaar. Wat heeft jouw voorkeur?

**Leesvoer** <https://playwright.dev/docs/pom>

---

## 5 Save login with Storage State

Vind jij het ook zo fijn om altijd voor elke test te moeten inloggen? Playwright heeft hier een
out-of-the-box antwoord op. Stel je hebt tientallen UI testen en je moet voor elke test eerst inloggen;
dit kost onnodig veel tijd op een hele testrun, en na 1× inloggen weten we wel dat het inloggen werkt.

Playwright biedt de mogelijkheid om de authenticatie met cookies en local storage uit te lezen, op te
slaan en te hergebruiken. Game changer! De Cerios Clinic app maakt gebruik van Keycloak SSO,
waarbij de sessie in de *local storage* van de browser wordt bewaard.

### 5.1 Opdracht 11

Volg het onderdeel *"Basic: shared account in all tests"*. Kom je er niet uit? Vraag de trainer.

Nu de login is opgeslagen, kan je in jouw testen de login-stappen weghalen en direct naar een pagina
gaan, bijv. `await page.goto('/doctors')`.

> **Tip:** `page.goto('/doctors')` werkt alleen als Playwright weet wat de basis-url is. Zet daarom in
> `playwright.config.ts` onder `use` de regel met `baseURL` aan (haal de `//` weg) en vul de url van de
> app in: `baseURL: 'http://localhost:5173',`

Let op: nu start élke test ingelogd. Dat is niet handig voor testen die juist níet ingelogd moeten
beginnen, zoals de registratietest (Opdracht 1) en de logintesten (Opdracht 9 en 10). Probeer maar
eens: wat gebeurt er met jouw logintest? Zet voor deze testen de opgeslagen login uit door bovenin het
testbestand het volgende toe te voegen:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

**Leesvoer** <https://playwright.dev/docs/auth#basic-shared-account-in-all-tests>

### 5.2 Opdracht 12

Je hebt vast de gebruikersnaam en het wachtwoord nu in code getypt. Stel je voor dat je dit naar de
GIT-omgeving van je werk gaat pushen? Dan heeft iedereen jouw gegevens. Dit is niet echt oké toch?

De oplossing? **Environment Variables**. Die zetten we in een apart bestand `.env`. Playwright leest
dit bestand niet zelf; daarvoor gebruiken we het package **dotenv**. Installeer dit eerst via de
terminal:

```bash
npm install dotenv --save-dev
```

Ga daarna naar de `playwright.config.ts` file. Bovenin staat een comment *"Read environment variables
from file"* met daaronder 3 regels die uitgezet zijn met `//`. Haal bij deze 3 regels de `//` weg:

```ts
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
```

Maak nu een nieuwe file aan op het hoogste niveau van jouw project (dus naast `playwright.config.ts`).
Druk rechtermuisknop op een leeg veld in de Explorer en kies voor **New File**. Noem de file `.env`;
dit bestand zal alle omgevingsvariabelen bevatten die we nodig gaan hebben.

Voeg de volgende variabelen toe aan jouw `.env` file:

```
BASE_URL=http://localhost:5173
PATIENT_EMAIL=patient.wilson@example.com
PATIENT_PASSWORD=Patient1234!
```

Dit bestand mag nooit naar de server gepushed worden — hier zitten immers credentials in. Open daarom
het bestand `.gitignore` en voeg onderaan deze regel toe:

```
.env
```

Nu kan je met `process.env` jouw environment variabelen ophalen. Vervang in `playwright.config.ts` de
url bij `baseURL` door `process.env.BASE_URL`, en gebruik in jouw testen of page objects
`process.env.PATIENT_EMAIL` en `process.env.PATIENT_PASSWORD` in plaats van de getypte waardes.

Het kan zijn dat er nu een warning/error ontstaat waar je dit wilt gaan toepassen… Waarom?

---

## 6 Accessibility testing

Digitale toegankelijkheid van websites wordt steeds belangrijker. De overheid wil dat iedereen mee kan
doen in de digitale samenleving. Daarom moeten websites en mobiele apps van overheidsinstanties
toegankelijk zijn voor iedereen, ook voor mensen met een beperking. Dat bereik je door de internationale
standaard voor toegankelijkheid toe te passen.

Axe — nee, niet het lekkere luchtje, maar de accessibility testing tool — is een mooie manier om een
pagina te scannen. Laat er nou een package voor Playwright zijn!

### 6.1 Opdracht 13

Installeer de axe package voor Playwright via de terminal:

```bash
npm install @axe-core/playwright
```

Volg het onderdeel *"Scanning an entire page"* en scan de homepagina of de **Our Doctors**-pagina van
het Patient Portal. Beide pagina's zijn alleen te zien als je bent ingelogd. Dankzij de opgeslagen
login uit Opdracht 11 gaat dat vanzelf. Krijg je toch de loginpagina te zien? Dan scan je dus de
verkeerde pagina; controleer dan of jouw storage state goed is ingesteld.

Ondertussen ben je al een expert, dus die trainer heb je niet meer nodig.

**Leesvoer** <https://playwright.dev/docs/accessibility-testing#scanning-an-entire-page>

---

## 7 Configuration and run tests parallel

We hebben nu onze prachtige testen steeds gerund via de VSCode extensie. Als je jouw project eenmaal in
de CI/CD pipeline draait zal dit net even anders gaan. Gelukkig kan je met de terminal jouw testen
runnen zoals dat op een build agent zou gaan.

### 7.1 Opdracht 14

Run het volgende commando:

```bash
npx playwright test
```

Wat gebeurt er nu allemaal? Blijkbaar draaien de testen, maar je ziet niets. Dat komt omdat nu alle
testen headless draaien. De browser wordt dus niet getoond. Dit is handig, want een build agent heeft
geen fysiek scherm, dus dan moet er wel de mogelijkheid zijn om headless te draaien.

Wil jij wel zien wat er nu allemaal gebeurt? Voer dan het volgende commando uit:

```bash
npx playwright test --headed
```

WOW, wat gebeurt er nu? Neem eens een kijkje in jouw `playwright.config.ts`. Hierin staan meerdere
projecten gedefinieerd en `fullyParallel` + `workers` staan aan en ingevuld.

Speel eens wat met de 3 genoemde onderdelen.

**Leesvoer** <https://playwright.dev/docs/test-configuration>

---

## 8 Compare with the trainer's framework

Ondertussen hebben we al een aardig framework staan. Tijd om te vergelijken met hoe de trainer het zou
doen.

De uitwerking van de trainer staat op GitHub:
<https://github.com/CeriosTesting/cerios-clinic-playwright>

Clone deze repo naast jouw eigen project in de map `C:\GIT`:

- Open in VS Code een terminal via **Terminal -> New Terminal**
- Ga naar de GIT folder en clone de repo:

  ```bash
  cd C:\GIT
  git clone https://github.com/CeriosTesting/cerios-clinic-playwright.git
  ```

- Open de repo in een nieuw VS Code venster, zodat jouw eigen project ook open blijft:

  ```bash
  code -n C:\GIT\cerios-clinic-playwright
  ```

  Werkt het `code` commando niet? Kies dan in VS Code in het menu **File -> New Window** en daarna
  **File -> Open Folder …** -> open de map `C:\GIT\cerios-clinic-playwright`.

- Vertrouw ook hier de auteurs ("Yes, I trust the authors")
- Wil je de testen van de trainer ook draaien? Voer dan in de terminal van het nieuwe venster
  `npm install` uit en kopieer `.env.sample` naar `.env` met de juiste waardes (zie Opdracht 12).

Vergelijk nu jouw uitwerking met die van de trainer. Let op de volgende onderdelen:

- `pageObjects/` — hoe zijn de Page Objects opgezet?
- `tests/` — hoe zijn de testen gestructureerd?
- `tests/my-test.ts` — wat zijn custom fixtures en hoe werken ze?
- `enums/MenuItem.ts` — hoe worden navigatie-items beheerd met een enum?
- `playwright.config.ts` — welke configuratiekeuzes zijn gemaakt?
