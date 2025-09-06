# Pressing Manager - Mobile Web App

A modern mobile web application for managing a dry cleaning business, built with Vue.js frontend and FastAPI backend, featuring Firebase authentication.

## Features

- **Dashboard**: Overview with statistics and charts
- **Item Registration**: Register items with photos and details  
- **Item Management**: Search, update status, track deadlines
- **Owner Management**: View items by owner
- **Statistics**: Revenue tracking and analytics
- **Firebase Authentication**: Secure login/registration
- **Mobile-First Design**: Responsive UI with Ant Design Vue

## Technology Stack

### Frontend
- **Vue 3** with TypeScript and Composition API
- **Ant Design Vue** for UI components
- **Chart.js** for data visualization
- **Pinia** for state management
- **Vue Router** for navigation
- **Firebase Auth** for authentication
- **Vite** for development and building

### Backend
- **FastAPI** with Python 3.12
- **SQLAlchemy** for database ORM
- **SQLite** database
- **Firebase Admin SDK** for token verification
- **Uvicorn** ASGI server

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- UV package manager (recommended) or pip

### 1. Clone and Setup

```bash
git clone <your-repo>
cd pressing-manager
```

### 2. Backend Setup

```bash
# Install dependencies
uv sync
# or with pip: pip install -r requirements.txt

# Create static directory
mkdir -p static

# Start backend server
uv run uvicorn main:app --reload
# or: python -m uvicorn main:app --reload
```

Backend will be available at http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

### 4. Firebase Configuration (Required for Authentication)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password provider
3. Get your Firebase config from Project Settings > General
4. Copy the frontend environment file:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
5. Update `frontend/.env.local` with your Firebase configuration:
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
6. Generate a backend service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `firebase_service_account.json` in the project root

**⚠️ Security Warning:** Never commit Firebase credentials to version control. The `.env.local` and `firebase_service_account.json` files are already excluded in `.gitignore`.

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend Development
```bash
uv run uvicorn main:app --reload --port 8000
# API documentation: http://localhost:8000/docs
```

### Project Structure

```
pressing-manager/
├── frontend/                 # Vue.js frontend
│   ├── src/
│   │   ├── views/           # Page components
│   │   ├── store/           # Pinia stores
│   │   ├── router/          # Vue Router config
│   │   └── firebase.ts      # Firebase config
│   ├── package.json
│   └── vite.config.ts
├── app/                     # FastAPI backend
│   ├── models.py           # Database models
│   ├── routes.py           # API endpoints
│   ├── crud.py             # Database operations
│   ├── database.py         # Database config
│   └── firebase_admin.py   # Firebase auth
├── main.py                 # FastAPI app entry
├── pyproject.toml          # Python dependencies
└── firebase_service_account.json  # Firebase credentials
```

## API Endpoints

### Authentication Required Endpoints
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item  
- `GET /api/items/{id}` - Get item by ID
- `PATCH /api/items/{id}/status` - Update item status
- `GET /api/items/deadlines` - Get items with deadlines
- `GET /api/stats` - Get statistics

### Authentication
All API endpoints require a valid Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Database Schema

### Items Table
- `id`: Unique identifier
- `owner`: Owner name (uppercase)
- `price`: Item price
- `status`: received/cleaned/delivered
- `date_received`: Registration date
- `date_cleaned`: Cleaning completion date
- `date_delivered`: Delivery date
- `date_promised`: Promised delivery date
- `items`: JSON array of item lines
- `description`: Item description
- `notes`: Additional notes
- `contact`: Contact information
- `image`: Base64 encoded image
- `amount_given`: Amount paid at registration

## Mobile Features

- **Responsive Design**: Optimized for mobile devices
- **Bottom Navigation**: Easy thumb navigation
- **Touch-Friendly**: Large buttons and touch targets
- **Fast Loading**: Optimized bundle size
- **Offline Support**: Local storage fallbacks

## Deployment

### Production Build
```bash
# Frontend
cd frontend && npm run build

# Backend  
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### Environment Variables
- `FIREBASE_CRED_PATH`: Path to Firebase service account JSON

## Security

- Firebase Authentication with email/password
- JWT token verification on all API endpoints  
- CORS configured for frontend domain
- Input validation and sanitization
- SQL injection protection via SQLAlchemy ORM

### Environment Variables Security

**⚠️ Important**: Never commit sensitive credentials to version control.

**Protected files (automatically ignored by Git):**
- `frontend/.env.local` - Frontend Firebase configuration
- `firebase_service_account.json` - Backend service account key
- `.env` files in project root

**For development:**
1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Add your Firebase credentials to `.env.local`
3. Download service account JSON to project root

**For production:**
- Use environment variables or secure secret management
- Configure CI/CD with encrypted secrets
- Never store credentials in code or config files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue on GitHub
- Check the API documentation at `/docs` endpoint
- Review the Firebase console for authentication issues

## Roadmap

- [ ] Push notifications
- [ ] Barcode/QR code scanning  
- [ ] Customer SMS notifications
- [ ] Advanced reporting
- [ ] Multi-location support
- [ ] Print receipt functionality

## ✅ Features

- Register clothing items with: description, owner (auto uppercased), contact (+237 format), price, optional notes, reception date (defaults to now), promised delivery date (defaults to now + configurable days)
- Status transitions: received → cleaned → delivered (timestamps stored)
- Storage suggestion logic driven by `config.yml` keywords
- List pending (not yet cleaned) items older than N days
- Filter items by owner (case-insensitive)
- Manage delivery deadlines: search all promised dates, view overdue/upcoming items with days remaining
- Aggregate statistics: totals, cleaned, delivered, pending, revenue (sum of delivered prices)
- Simple responsive UI using Bootstrap (no custom build tooling)
- Modular backend (app folder) using SQLAlchemy ORM instead of raw SQL
- Clean separation: models / CRUD / routes / database session management

## 🛠 Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Web Framework | FastAPI | Async, automatic docs (Swagger / ReDoc) |
| ORM | SQLAlchemy | Declarative models, session handling |
| Templating | Jinja2 | Server-side rendered pages |
| Styling | Bootstrap 5 CDN | Minimal custom CSS |
| Data Store | SQLite | File `pressing.db` (easy local deployment) |
| Packaging / Env | `uv` / virtualenv | Fast dependency management |
| Tooling | tox, ruff, black, mypy | Quality gates |

## 📂 Project Structure

```
pressing-manager/
├── app/
│   ├── __init__.py
│   ├── database.py        # Engine, SessionLocal, Base
│   ├── models.py          # SQLAlchemy models (ClothingItem)
│   ├── crud.py            # CRUD + stats logic
│   └── routes.py          # FastAPI route handlers (HTML pages)
├── templates/             # Jinja2 templates (Bootstrap UI)
│   ├── index.html
│   ├── register.html
│   ├── register_success.html
│   ├── item.html
│   ├── item_details.html
│   ├── pending.html
│   ├── pending_list.html
│   ├── owner.html
│   ├── owner_list.html
│   ├── deadlines.html
│   ├── deadlines_list.html
│   ├── stats.html
│   ├── message.html
│   ├── storage.html
├── static/                # Static assets (placeholder directory)
├── config.yml             # Storage suggestion rules
├── main.py                # App entrypoint (creates tables + includes router)
├── requirements.txt       # Runtime dependencies (if not using uv)
├── tox.ini                # Multi-env dev workflow
├── uv.lock / pyproject.toml (if present)  # uv resolution files
├── pressing.db (runtime)  # SQLite database file (created on first run)
└── README.md
```

## ⚙️ Configuration (`config.yml`)

Example:
```yaml
storage_suggestions:
  - keywords: ["chemise", "shirt"]
    suggestion: "Ranger sur cintres"
  - keywords: ["pantalon", "pants"]
    suggestion: "Plier et ranger dans tiroir"
  - keywords: ["robe", "dress"]
    suggestion: "Ranger sur cintres avec housse"
  - keywords: []
    suggestion: "Stockage général"

default_promised_days: 7
```
First matching keyword list wins; final empty list acts as default fallback.

`default_promised_days`: Number of days from now to set as default promised delivery date in registration form.## 🚀 Quick Start

Using `uv` (preferred):
```bash
uv sync              # Install dependencies into .venv
uv run uvicorn main:app --reload --port 8000
```

Using classic `pip`:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Visit: http://localhost:8000

Interactive API docs (automatically from FastAPI):
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 Testing & Quality

Run formatters / linters / type checks / tests via tox:
```bash
tox -e format   # Apply formatting (black, ruff, isort)
tox -e lint     # Lint only
tox -e type     # mypy checks
tox -e test     # unittest + coverage
tox -e all      # Aggregate quality gates
```

## 🗃 Database Model (ClothingItem)

| Field | Type | Notes |
|-------|------|-------|
| id | str (UUID) | Primary key |
| description | str | Indexed |
| owner | str | Uppercased for search |
| price | float | Item price |
| status | str | received / cleaned / delivered |
| date_received | datetime | Provided or auto-now |
| date_cleaned | datetime? | Set on clean action |
| date_delivered | datetime? | Set on deliver action |
| notes | str? | Optional free text |
| contact | str? | Customer phone (+237...) |
| date_promised | datetime? | Promised delivery date |

Tables are auto-created on startup (`models.Base.metadata.create_all`). For production you may later introduce Alembic migrations.

## 🔄 Main Flows

1. Register item → store metadata & initial status (optional promised delivery date)
2. Optionally mark as cleaned → store `date_cleaned`
3. Optionally mark as delivered → store `date_delivered`
4. Query by code, owner, or pending criteria
5. Manage deadlines: search items by promised date, view overdue/upcoming with days remaining
6. View aggregated statistics & storage suggestions

## 📑 Key Endpoints (HTML)

| Path | Method | Purpose |
|------|--------|---------|
| / | GET | Home dashboard links |
| /register | GET/POST | Register new item (with optional promised date) |
| /item | GET/POST | Form & lookup by ID |
| /item/{code} | GET | Item detail card |
| /item/{code}/clean | GET | Mark item cleaned |
| /item/{code}/deliver | GET | Mark item delivered |
| /item/{code}/storage | GET | Storage suggestion |
| /pending | GET/POST | Form & list pending items |
| /owner | GET/POST | Form & list by owner |
| /deadlines | GET/POST | Form & list items by promised delivery date |
| /stats | GET | Aggregate statistics |

Underlying logic is modularized in `app/crud.py` and `app/routes.py`.

## 🧩 Extending

Ideas to evolve:
- Add REST/JSON API layer separate from HTML pages
- Add authentication (FastAPI Users / OAuth2) for staff vs public access
- Introduce pagination & filtering (SQLAlchemy `.filter()` combos)
- Integrate `sqladmin` for instant admin CRUD
- Add HTMX for partial page updates (avoid full reloads)
- Export reports (CSV / PDF) of delivered items & revenue
- Swap SQLite for Postgres in production (`postgresql+psycopg://` URL)
- Add Alembic migrations for schema evolution

## 🛡 Error Handling

Consistent `HTTPException` usage for not found and invalid state (e.g. requesting storage suggestion before cleaning). Future improvement: custom error templates.

## 🌍 Localization

Current UI labels are in French. To support multiple languages, introduce a simple translation map or use Babel with template filters.

## ♻️ Data Hygiene

- Owner names normalized to uppercase on insert (simplifies lookups)
- Contact stored raw; you can enforce E.164 formatting later
- Promised delivery dates optional; use for deadline tracking and alerts
- Potential future cleanup task: auto-archive delivered items older than N days

## 🧪 Minimal Programmatic Example (JSON) *(future enhancement)*

Add a pure JSON endpoint layer by wrapping CRUD calls and returning Pydantic schemas; the existing modularity supports that easily.

## 🚧 Roadmap Snapshot

- [ ] JSON API layer
- [ ] Admin backoffice (sqladmin)
- [ ] Auth & roles
- [ ] Export / reporting
- [ ] Pagination & search improvements
- [ ] Alembic migrations
- [ ] Tests for CRUD logic (unit + integration)

## 🤝 Contributions

1. Fork & branch (`feat/your-feature`)
2. Run quality gates (`tox -e all`)
3. Open PR with description & screenshots if UI changes

## 📜 License

See `LICENSE` (insert chosen license here if not already specified).

## 🙋 Support / Questions

Open an issue or extend the README with a FAQ section as needs emerge.

---
Built for a lightweight, local-first pressing workflow. Adapt, extend, and refine as operations grow.

## Frontend (Vue 3 + Vite)

The `frontend/` folder contains a mobile-friendly SPA using Ant Design Vue and local storage. Run it with:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173
