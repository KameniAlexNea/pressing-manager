# Pressing Manager

Efficient web application (FastAPI + SQLAlchemy + Bootstrap) to manage a dry-cleaning / pressing workflow: register clothing items, track status (received → cleaned → delivered), compute stats, view pending work, search by owner, and suggest storage based on configurable rules.

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
