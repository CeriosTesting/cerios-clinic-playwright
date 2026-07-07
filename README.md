# Cerios Clinic Playwright

Dit is de trainer's uitwerking van de Playwright training zoals beschreven in [OPDRACHTEN.md](OPDRACHTEN.md).
De repo bevat een uitgewerkt, opgeschoond Playwright framework tegen de **Cerios Clinic** applicatie
(een Patient Portal), zodat deelnemers na afloop van de opdrachten hun eigen uitwerking kunnen
vergelijken met een referentie-implementatie.

## Inhoud van deze repo

- **[INSTALLATION.md](INSTALLATION.md)** — stap-voor-stap installatiehandleiding: de benodigde
  tools (Node.js, VS Code, Git), Docker Desktop (om de Cerios Clinic app lokaal te draaien) en het
  opzetten van een nieuw Playwright project.
- **[OPDRACHTEN.md](OPDRACHTEN.md)** — de trainingsopdrachten zelf, opgedeeld in modules: record &
  playback, de trace viewer, locators, DRY met het Page Object Model, storage state, accessibility
  testing en test-configuratie.
- De rest van de repo (**`tests/`**, **`pageObjects/`**, **`enums/`**) is de uitgewerkte oplossing
  van diezelfde opdrachten — bedoeld om na afloop mee te vergelijken (zie sectie 8 van OPDRACHTEN.md).

## Projectstructuur

```
tests/            Playwright testen + de auth-setup en custom test-fixtures (my-test.ts)
pageObjects/       Page Objects per pagina, met componentObjects/ voor herbruikbare onderdelen
enums/             Enums voor bijv. menu-items, gebruikt door de Page Objects
playwright.config.ts   Projecten (setup/chromium), storage state, parallelisatie, reporter
.env.sample        Voorbeeld env-variabelen (BASE_URL, patiënt-credentials)
```

## Aan de slag

1. Doorloop [INSTALLATION.md](INSTALLATION.md) om Node.js, VS Code, Git, Docker en Playwright te
   installeren.
2. Kopieer `.env.sample` naar `.env` en vul de variabelen in.
3. Start de Cerios Clinic app via Docker.
4. Installeer de dependencies:

   ```bash
   npm install
   ```

5. Draai de testen:

   ```bash
   npx playwright test
   ```

   Of headed, om mee te kijken:

   ```bash
   npx playwright test --headed
   ```

6. Volg vervolgens [OPDRACHTEN.md](OPDRACHTEN.md) om zelf een framework op te bouwen, en vergelijk
   je uitwerking met de code in deze repo.
