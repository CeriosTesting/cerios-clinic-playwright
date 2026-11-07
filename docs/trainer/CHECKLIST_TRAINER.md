# Checklist trainer

Checklist voor de trainer, voor, tijdens en na de Playwright training.

---

## Voor de training

### Repo klaarzetten

- [ ] Maak de repo **public**:
      GitHub → repo → **Settings** → **General** → onderaan bij **Danger Zone** →
      **Change repository visibility** → **Make public**
- [ ] **Archiveer** de repo:
      GitHub → repo → **Settings** → **General** → **Danger Zone** → **Archive this repository**

      Een gearchiveerde repo is read-only: deelnemers kunnen de repo wel **clonen en gebruiken**,
      maar niemand kan er nog naar **pushen** (ook geen issues of pull requests aanmaken).
      Wil je later zelf nog iets aanpassen? Dan moet je de repo eerst weer **unarchiven**.
- [ ] Controleer in een incognito-venster (niet ingelogd) dat de repo bereikbaar is:
      <https://github.com/CeriosTesting/cerios-clinic-playwright>

### Deelnemers informeren

- [ ] **Een week van tevoren:** deel [INSTALLATION.md](../INSTALLATION.md) met de deelnemers, zodat
      Node.js, VS Code, Git, Docker Desktop en Playwright al geïnstalleerd zijn
- [ ] **Een uur van tevoren:** deel de **URL van de GitHub repo** met de deelnemers, zodat ze de opdrachten
      ([OPDRACHTEN.md](../OPDRACHTEN.md)) kunnen openen:
      <https://github.com/CeriosTesting/cerios-clinic-playwright/blob/main/docs/OPDRACHTEN.md>
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

- [ ] Zet de repo terug:
      - **Unarchive**: GitHub → repo → **Settings** → **General** → **Danger Zone** →
        **Unarchive this repository**
      - Maak de repo weer **private**: **Danger Zone** → **Change repository visibility** →
        **Make private**
- [ ] Verwerk de feedbackpunten van de deelnemers in de opdrachten en/of de uitwerking (indien
      aangeleverd)
