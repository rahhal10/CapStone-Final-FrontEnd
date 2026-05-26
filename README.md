# AUTO_AI — Frontend

AI-powered car body damage detection and repair cost estimation. Upload a vehicle photo, get an instant damage report, and receive transparent part pricing across three sourcing tiers.

---

## Tech Stack

- **React 19** + **Vite 8**
- **React Router DOM v7** — client-side routing
- **CSS Modules** — scoped component styles, no UI library
- **Custom JWT auth** — cookie-based session with inactivity auto-logout

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000
VITE_AI_URL=http://127.0.0.1:8000
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Node.js backend base URL | `http://localhost:4000` |
| `VITE_AI_URL` | FastAPI AI server base URL | `http://127.0.0.1:8000` |

### 3. Run the dev server

```bash
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── assets/                   # Static images (logo, hero, auth background)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx         # Top navigation with auth state
│   │   ├── Footer.jsx         # Site footer
│   │   └── AuthLayout.jsx     # Two-panel layout for login/sign-up
│   └── ui/
│       ├── AuthGateModal.jsx  # Modal prompting guests to sign in
│       ├── ForgotPasswordModal.jsx
│       └── FormInput.jsx      # Reusable input with icon + password toggle
├── context/
│   └── AuthContext.jsx        # JWT auth state, cookie persistence, inactivity logout
├── pages/
│   ├── landing/               # / — Hero, HowItWorks, Stats, Partners
│   ├── diagnostic/            # /diagnostic — Image upload + live analysis panel
│   ├── manualEntry/           # /manual-entry — Vehicle details + damage confirmation
│   ├── results/               # /results — Bbox overlay + part price table
│   ├── history/               # /history — Scan history, search, report modal
│   └── auth/                  # /login, /sign-up
└── services/
    └── authApi.js             # All fetch calls to the backend API
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Marketing page with hero CTA, how-it-works steps, and platform stats |
| `/diagnostic` | Diagnostic Upload | Drag-and-drop or camera capture; live 5-step analysis progress panel |
| `/manual-entry` | Vehicle Details | Confirm AI-detected vehicle make/model/year and classify any unidentified damage |
| `/results` | Results | Bounding-box overlay on uploaded image; part pricing table (Original New / Used / Aftermarket) |
| `/history` | Scan History | Paginated list of past scans with search, status badges, and a full report modal |
| `/login` | Login | Email + password sign-in with session-expired banner |
| `/sign-up` | Sign Up | Account creation with client-side validation |

---

## Authentication

- **Storage:** JWT and user object stored in `SameSite=Strict` cookies.
- **Expiry:** Cookie lifetime is derived from the JWT `exp` claim so they stay in sync with the backend setting.
- **Inactivity logout:** User is redirected to `/login?reason=expired` after a configurable period of inactivity (`INACTIVITY_MS` in `AuthContext.jsx`).
- **Auth gate:** Guest users clicking protected actions see an `AuthGateModal` prompting them to sign in or create an account.

---

## AI Damage Detection

The diagnostic flow calls the backend which internally runs a YOLO model. The frontend supports **12 damage classes**:

| Class Key | Display Name |
|---|---|
| `Front-Windscreen-Damage` | Front Windscreen |
| `Headlight-Damage` | Headlight |
| `Rear-windscreen-Damage` | Rear Windscreen |
| `Sidemirror-Damage` | Side Mirror |
| `Taillight-Damage` | Taillight |
| `bonnet-dent` | Bonnet |
| `boot-dent` | Boot Lid |
| `doorouter-dent` | Door (Outer) |
| `fender-dent` | Fender |
| `front-bumper-dent` | Front Bumper |
| `quaterpanel-dent` | Quarter Panel |
| `rear-bumper-dent` | Rear Bumper |

Detections with class `unknown-damage` are displayed as grey bounding boxes and shown separately in the report.

---

## Supported Vehicles (Price Estimation)

| Make | Model | Year Ranges |
|---|---|---|
| Ford | Fusion | 2010–2012, 2013–2016, 2017, 2018–2020 |
| Changan | eSTAR | 2020–2026 |
| Volkswagen | ID.4 | 2020–2026 |

---

## API Integration

All network calls are in `src/services/authApi.js`. The frontend communicates exclusively with the **Node.js backend** — it does not call FastAPI directly.

| Function | Method | Endpoint | Auth |
|---|---|---|---|
| `apiSignup` | POST | `/api/auth/signup` | No |
| `apiLogin` | POST | `/api/auth/login` | No |
| `apiDetect` | POST | `/api/detect` | JWT |
| `apiEstimate` | POST | `/api/estimate` | JWT |
| `apiGetHistory` | GET | `/api/history` | JWT |
