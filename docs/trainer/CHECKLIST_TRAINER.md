# Checklist trainer

Checklist voor de trainer, voor, tijdens en na de Playwright training.

---

## Voor de training

### Repo klaarzetten

De repo is altijd **public**. `main` is beschermd met de ruleset **Protect main**, dus je hoeft
de repo niet meer te archiveren of private te maken.

- [ ] Controleer dat de ruleset **Protect main** nog actief is:
      GitHub → repo → **Settings** → **Rules** → **Rulesets** →
      <https://github.com/CeriosTesting/cerios-clinic-playwright/settings/rules>

      De ruleset zorgt ervoor dat:
      - wijzigingen op `main` alleen via een **pull request met minimaal 1 approval** kunnen
        (**Require a pull request before merging** → **Required approvals: 1**);
      - een approval vervalt als er daarna nieuwe commits worden gepusht
        (**Dismiss stale pull request approvals when new commits are pushed**);
      - `main` niet verwijderd of geforce-pusht kan worden (**Restrict deletions**,
        **Block force pushes**).

      Repo-admins (**Repository admin** in de **Bypass list**) mogen direct naar `main` pushen.
      Deelnemers kunnen de repo **clonen en gebruiken**, maar niet naar `main` pushen.

      Ruleset kwijt? Maak hem opnieuw aan via **New ruleset** → **New branch ruleset**: naam
      **Protect main**, **Enforcement status: Active**, **Bypass list: Repository admin (Always
      allow)**, **Target branches: Include default branch** en de rules hierboven.
- [ ] Controleer in een incognito-venster (niet ingelogd) dat de repo bereikbaar is:
      <https://github.com/CeriosTesting/cerios-clinic-playwright>
- [ ] Controleer dat **GitHub Pages** aan staat voor de trainingswebsite:
      GitHub → repo → **Settings** → **Pages** → **Source: Deploy from a branch** → branch
      **main**, map **/docs**. De site staat op
      <https://ceriostesting.github.io/cerios-clinic-playwright/>
- [ ] Opdrachten aangepast in [OPDRACHTEN.md](../OPDRACHTEN.md)? Draai `npm run site` en commit
      ook `docs/training/index.html`, anders loopt de website achter

### Deelnemers informeren

- [ ] **Een week van tevoren:** deel [INSTALLATION.md](../INSTALLATION.md) met de deelnemers, zodat
      Node.js, VS Code, Git, Docker Desktop en Playwright al geïnstalleerd zijn
- [ ] **Een uur van tevoren:** deel de **URL van de GitHub repo** met de deelnemers, zodat ze de opdrachten
      ([OPDRACHTEN.md](../OPDRACHTEN.md)) kunnen openen:
      <https://github.com/CeriosTesting/cerios-clinic-playwright/blob/main/docs/OPDRACHTEN.md>
      en de trainingswebsite als extraatje: <https://ceriostesting.github.io/cerios-clinic-playwright/>

### Omgeving

- [ ] Controleer dat de Cerios Clinic app start via de stappen in
      [CERIOS_CLINIC_START.md](../CERIOS_CLINIC_START.md) en bereikbaar is op `http://localhost:5173`
- [ ] Controleer dat het patiëntaccount uit de opdrachten werkt (zie Opdracht 2 en 12)
- [ ] Draai de testen van de uitwerking één keer (`npx playwright test`) om te zien dat alles groen is

---

## Tijdens de training

- [ ] Check bij de start of iedereen de installatie heeft afgerond en Docker Desktop draait
- [ ] Laat iedereen bij de start de Cerios Clinic app starten via
      [CERIOS_CLINIC_START.md](../CERIOS_CLINIC_START.md):
      <https://github.com/CeriosTesting/cerios-clinic-playwright/blob/main/docs/CERIOS_CLINIC_START.md>
- [ ] Deel de URL van de repo / opdrachten nogmaals (bijv. in de chat of op het scherm)
- [ ] Wijs bij sectie 8 van de opdrachten op het clonen van de uitwerking van de trainer

---

## Na de training

- [ ] Verwerk de feedbackpunten van de deelnemers in de opdrachten en/of de uitwerking (indien
      aangeleverd)
