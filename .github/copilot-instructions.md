# Playwright Course — Cerios Clinic

## Context
This workspace is used for a Playwright basics training course for colleagues.
The goal is to teach Playwright fundamentals using the **Cerios Clinic** application as the test target.

This is a migration from a previous course that used https://valoriwebshop.nl/.
The trainer's reference framework lives in `Valori-Playwright/` and targets the **Patient Portal** of cerios-clinic.

---

## Workspace Structure

```
/                                      # Student's Playwright framework (workspace root)
├── playwright.config.ts               # Chromium, setup dependency, storage state, dotenv
├── .env.sample                        # BASE_URL, PATIENT_EMAIL, PATIENT_PASSWORD
├── .env                               # (gitignored) actual credentials
├── package.json
├── tsconfig.json
├── tests/
│   ├── auth.setup.ts                  # SSO login, saves .auth/user.json
│   ├── my-test.ts                     # Custom fixtures (menuPage, homePage, loginPage)
│   ├── home.spec.ts                   # Home greeting, quick-action cards, doctors page
│   └── menu.spec.ts                   # Navigation through all 5 patient portal nav items
├── pageObjects/
│   ├── login-page.ts                  # SSO login: Sign in button → Keycloak form
│   ├── home-page.ts                   # Home assertions + navigateToDoctors()
│   ├── menu-page.ts                   # 5 nav items, assertUrlAndTitle()
│   └── componentObjects/
│       ├── doctor-component.ts        # Reusable: count/filter doctor cards
│       └── product-component.ts      # Original webshop component (kept for reference)
├── enums/
│   ├── MenuItem.ts                    # MyAppointments, MedicalHistory, Prescriptions, OurDoctors, Profile
│   └── MenuSubItem.ts                 # Empty (patient portal has no sub-menus)
├── cerios-clinic/                     # The application under test (full-stack clinic monorepo)
│   └── infra/
│       └── docker-compose.yml        # Starts all cerios-clinic services
└── Valori-Playwright/                 # Trainer's reference solution (read-only reference)
```

---

## Application Under Test: Cerios Clinic

A full-stack clinic management system. Run with:
```bash
cd cerios-clinic/infra
docker compose --profile apps up -d --pull always
```

### Portals & URLs
| Portal | URL | Description |
|--------|-----|-------------|
| Patient Portal | http://localhost:5173 | Patients view/book appointments |
| Doctor Portal | http://localhost:5174 | Doctors manage their schedule |
| Assistant Portal | http://localhost:5175 | Reception staff manage appointments |
| Admin Portal | http://localhost:5176 | System administration |
| Patient API (Swagger) | http://localhost:3001/api/docs | |
| Doctor API (Swagger) | http://localhost:3002/api/docs | |
| Assistant API (Swagger) | http://localhost:3003/api/docs | |
| Admin API (Swagger) | http://localhost:3004/api/docs | |
| Keycloak | http://localhost:8180 | Auth (admin / admin_secret) |
| Mailpit | http://localhost:8025 | Email catcher |

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Patient | patient.wilson@example.com | Patient1234! |
| Patient | patient.moore@example.com | Patient1234! |
| Patient | patient.taylor@example.com | Patient1234! |
| Patient | patient.anderson@example.com | Patient1234! |
| Patient | patient.thomas@example.com | Patient1234! |
| Doctor | dr.smith@clinic.local | Clinic1234! |
| Doctor | dr.johnson@clinic.local | Clinic1234! |
| Doctor | dr.williams@clinic.local | Clinic1234! |
| Assistant | assistant.brown@clinic.local | Clinic1234! |
| Assistant | assistant.davis@clinic.local | Clinic1234! |
| Assistant | assistant.miller@clinic.local | Clinic1234! |
| Admin | admin@clinic.local | Admin1234! |

### Patient Portal — Routes & Pages
| Route | Page | h1 heading |
|-------|------|------------|
| `/login` | Login (SSO via Keycloak) | "Patient Portal" |
| `/register` | Registration form | — |
| `/` | Home / Dashboard | "Good day, {firstName}" |
| `/appointments` | Appointments list (Upcoming / Past) | "My Appointments" |
| `/appointments/:id` | Appointment detail | "Appointment details" |
| `/medical-history` | Completed appointments + notes | "Medical History" |
| `/prescriptions` | Prescriptions with medication items | "My Prescriptions" |
| `/doctors` | Grid of 3 doctor cards | "Our Doctors" |
| `/profile` | Edit patient profile | "My Profile" |

### Patient Portal — Navigation items (in order)
`My Appointments` → `Medical History` → `Prescriptions` → `Our Doctors` → `Profile`

### Patient Portal — Login flow (SSO)
The portal uses Keycloak SSO. Login flow:
1. Navigate to `/login`
2. Click **"Sign in"** button → redirects to Keycloak at `localhost:8180`
3. Fill `#username` and `#password` in the Keycloak form
4. Click `#kc-login` → redirects back to patient portal `/`

### Key UI facts
- Home page has **2 quick-action cards** (My Appointments, My Profile) in a `.card` CSS class
- Doctors page has **3 seeded doctors** rendered in a `div.max-w-3xl` wrapper
- Doctor cards use `.card` class; contain "Dr. {firstName} {lastName}" and specialization text
- Seeded doctors: Dr. James Smith (General Practice), Dr. Sarah Johnson (Cardiology), Dr. Michael Williams (Neurology)
- Navigation is in a `<nav>` element (only nav on the page — footer is a plain `<footer>`)

---

## Student Playwright Framework — Workspace Root

The student's working framework lives at the **workspace root** (`/`). This is where all test development happens.

### Running tests
```bash
# From workspace root
cp .env.sample .env        # fill in credentials (first time only)
npm install
npx playwright install
npx playwright test                    # headless
npx playwright test --headed           # headed
npx playwright test --ui               # UI mode
npx playwright show-report             # open last HTML report
```

## Valori-Playwright — Trainer's Reference Solution

The complete, finished solution lives in `Valori-Playwright/`. Students compare against this at the end.

### Project structure (mirrors workspace root)
```
Valori-Playwright/
├── playwright.config.ts               # Chromium, setup dependency, storage state, dotenv
├── .env.sample                        # BASE_URL, PATIENT_EMAIL, PATIENT_PASSWORD
├── tests/
│   ├── auth.setup.ts                  # SSO login, saves .auth/user.json
│   ├── my-test.ts                     # Custom fixtures (menuPage, homePage, loginPage)
│   ├── home.spec.ts                   # Home greeting, quick-action cards, doctors page
│   └── menu.spec.ts                   # Navigation through all 5 patient portal nav items
├── pageObjects/
│   ├── login-page.ts                  # SSO login: Sign in button → Keycloak form
│   ├── home-page.ts                   # Home assertions + navigateToDoctors()
│   ├── menu-page.ts                   # 5 nav items, assertUrlAndTitle()
│   └── componentObjects/
│       ├── doctor-component.ts        # Reusable: count/filter doctor cards
│       └── product-component.ts      # Original webshop component (kept for reference)
└── enums/
    ├── MenuItem.ts                    # MyAppointments, MedicalHistory, Prescriptions, OurDoctors, Profile
    └── MenuSubItem.ts                 # Empty (patient portal has no sub-menus)
```

### Key design patterns used
- **Page Object Model (POM)**: each page has a dedicated class with descriptive methods
- **Component Objects**: `DoctorComponent` is reusable across page objects (like `ProductComponent` was)
- **Custom fixtures** (`my-test.ts`): page objects are injected into tests via `test.extend`
- **Storage state auth**: login runs once in `auth.setup.ts`, session reused by all tests
- **Environment variables**: credentials never hardcoded; loaded via `dotenv` from `.env`
- **Enum-driven navigation**: `MenuItem` enum drives both clicking and URL assertions
- **Role-based locators**: prefer `getByRole`, `getByText` over CSS/XPath where possible

---

## Course Assignments (14 total + 2 bonus)

The Word document `Playwright Training Basics V1.3.docx` contains the full assignment text.
Below is the mapping from the original webshop scenario to the cerios-clinic equivalent.

| # | Chapter | Original (valoriwebshop.nl) | Cerios-clinic equivalent |
|---|---------|----------------------------|--------------------------|
| 1 | Record & Playback | Add 2 items to cart, verify cart count | Register at `/register`, verify success screen shows submitted email |
| 2 | Record & Playback | Navigate Clothes/Men/Women menu, verify URL+title | Login, navigate all 5 nav items, verify URL + page heading |
| 3 | Record & Playback | Try other assertions | Same — apply to any clinic page |
| 4 | Trace Viewer | Use trace viewer; introduce a failure | Same — use on a clinic test |
| 5 | Trace Viewer | Click "The Best Is Yet To Come" (teaches nth/strictness) | Navigate to Our Doctors, click a specific doctor card (3 cards → teaches nth/strictness) |
| 6 | Trace Viewer | Rewrite generated locators | Same — rewrite locators on doctor/appointment cards |
| 7 | Trace Viewer (bonus) | Chain locators to avoid nth() | Find doctor card by name, then click within it |
| 8 | Trace Viewer (bonus) | Filter with has() | Filter appointment cards using `.filter({ hasText: ... })` |
| 9 | DRY / POM | Create account manually, record login test | Use pre-seeded patient account, record SSO login test |
| 10 | DRY / POM | Create `login-page.ts` POM | Same — SSO flow: navigate `/login` → click Sign in → fill Keycloak form |
| 11 | Storage State | Implement shared auth setup | Same — SSO session stored in localStorage by Keycloak-JS |
| 12 | Storage State | Move credentials to `.env` + dotenv | Same — `BASE_URL`, `PATIENT_EMAIL`, `PATIENT_PASSWORD` |
| 13 | Accessibility | Install axe-core, scan entire page | Same — scan patient portal home or doctors page |
| 14 | Config & Parallel | Run via terminal, headless/headed, workers config | Same commands, same `playwright.config.ts` concepts |
| — | Final | Compare with trainer's Valori-Playwright repo | Compare with this `Valori-Playwright/` folder |
