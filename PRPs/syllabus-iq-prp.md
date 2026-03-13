# PRP: Syllabus-IQ

> Implementation blueprint for parallel agent execution

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | Syllabus-IQ |
| **Type** | SaaS |
| **Version** | 1.0 |
| **Created** | 2026-03-10 |
| **Complexity** | High |

---

## PRODUCT OVERVIEW

**Description:** AI-powered platform that analyzes syllabus PDFs, Word documents, and text files to identify NOS units and performance criteria, then automatically generates structured MCQs with explanations and source references. Includes duplicate detection, searchable question bank, and Excel export.

**Value Proposition:** Saves teachers and students hours of manual work by transforming syllabus documents into ready-to-use, standards-aligned assessment material with full traceability.

**MVP Scope:**
- [ ] User registration and login (email/password + Google OAuth)
- [ ] Upload PDF/DOCX/TXT and extract NOS units & performance criteria
- [ ] AI-powered MCQ generation with explanations & source references
- [ ] Question bank with search, filter, and edit capabilities
- [ ] Export to structured Excel format
- [ ] Basic dashboard with stats

---

## TECH STACK

| Layer | Technology | Skill Reference |
|-------|------------|-----------------|
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md |
| Frontend | React + TypeScript + Vite | skills/FRONTEND.md |
| Database | PostgreSQL + SQLAlchemy | skills/DATABASE.md |
| Auth | JWT + bcrypt + Google OAuth | skills/BACKEND.md |
| UI | Tailwind CSS + shadcn/ui | skills/FRONTEND.md |
| AI | Claude API (Anthropic) | skills/BACKEND.md |
| Testing | pytest + React Testing Library | skills/TESTING.md |
| Deployment | Docker + Docker Compose | skills/DEPLOYMENT.md |

---

## DATABASE MODELS

### User
- id (PK), email (unique), hashed_password, full_name
- role (user/admin), is_active, is_verified
- oauth_provider, avatar_url
- created_at, updated_at

### RefreshToken
- id (PK), user_id (FK -> User), token (unique)
- expires_at, revoked, created_at

### Document
- id (PK), user_id (FK -> User)
- filename, original_filename, file_type (pdf/docx/txt)
- file_size, file_path
- status (uploaded/processing/analyzed/failed), error_message
- uploaded_at, processed_at

### NOSUnit
- id (PK), document_id (FK -> Document)
- unit_code, unit_title, description
- order_index, created_at

### PerformanceCriterion
- id (PK), nos_unit_id (FK -> NOSUnit)
- criterion_code, criterion_text, page_reference
- order_index, created_at

### MCQGenerationJob
- id (PK), document_id (FK -> Document), user_id (FK -> User)
- status (pending/generating/completed/failed)
- total_criteria, processed_criteria
- error_message
- started_at, completed_at, created_at

### MCQuestion
- id (PK), generation_job_id (FK -> MCQGenerationJob)
- document_id (FK -> Document), nos_unit_id (FK -> NOSUnit)
- criterion_id (FK -> PerformanceCriterion), user_id (FK -> User)
- question_text, option_a, option_b, option_c, option_d
- correct_option (A/B/C/D)
- explanation, source_page_reference
- difficulty_level (easy/medium/hard)
- is_duplicate, duplicate_of_id (FK -> MCQuestion, nullable)
- created_at, updated_at

### QuestionTag
- id (PK), name (unique), created_at

### QuestionTagMapping
- id (PK), question_id (FK -> MCQuestion), tag_id (FK -> QuestionTag)

### ExportJob
- id (PK), user_id (FK -> User)
- filename, format (xlsx)
- filter_criteria (JSON), status (pending/processing/completed/failed)
- file_path, row_count
- created_at, completed_at

---

## MODULES

### Module 1: Authentication
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Create new account |
| POST | /api/v1/auth/login | Login, return JWT tokens |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Revoke refresh token |
| GET | /api/v1/auth/me | Get current user profile |
| PUT | /api/v1/auth/me | Update user profile |
| GET | /api/v1/auth/google | Initiate Google OAuth flow |
| GET | /api/v1/auth/google/callback | Handle Google OAuth callback |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /login | LoginPage | LoginForm, GoogleOAuthButton, FormInput |
| /register | RegisterPage | RegisterForm, GoogleOAuthButton, FormInput |
| /forgot-password | ForgotPasswordPage | ForgotPasswordForm |
| /profile | ProfilePage | ProfileForm, AvatarUpload |

---

### Module 2: Document Upload & Analysis
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/documents/upload | Upload document (PDF/DOCX/TXT, max 20MB) |
| GET | /api/v1/documents | List user's documents with pagination |
| GET | /api/v1/documents/{id} | Get document details with NOS units |
| DELETE | /api/v1/documents/{id} | Delete document and all related data |
| POST | /api/v1/documents/{id}/analyze | Trigger NOS extraction and analysis |
| GET | /api/v1/documents/{id}/nos-units | Get extracted NOS units |
| GET | /api/v1/documents/{id}/criteria | Get all performance criteria |

**Backend Services:**
- `document_parser.py` — PDF (pdfplumber), DOCX (python-docx), TXT parsing
- File type validation (magic bytes, not just extension)
- Unique filename generation (UUID-based)

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /documents | DocumentListPage | DocumentCard, UploadDropzone, FileTypeIcon, StatusBadge |
| /documents/{id} | DocumentDetailPage | NOSUnitAccordion, CriteriaList, AnalyzeButton, ProgressBar |

---

### Module 3: MCQ Generation Engine
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/generate/{document_id} | Start MCQ generation for entire document |
| GET | /api/v1/generate/{job_id}/status | Get generation job progress |
| POST | /api/v1/generate/{document_id}/criteria | Generate MCQs for selected criteria only |
| GET | /api/v1/generate/{job_id}/results | Get generated questions from job |

**Backend Services:**
- `mcq_generator.py` — Claude API integration, prompt engineering for MCQ generation
- `duplicate_detector.py` — Similarity detection using text comparison
- Rate limiting per user on generation endpoints

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /generate/{document_id} | GenerationPage | CriteriaSelector, GenerateButton, ProgressTracker, ResultPreview |

---

### Module 4: Question Bank Management
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/questions | List questions with search, filter, pagination |
| GET | /api/v1/questions/{id} | Get question detail |
| PUT | /api/v1/questions/{id} | Edit question text/options/answer |
| DELETE | /api/v1/questions/{id} | Delete a question |
| GET | /api/v1/questions/duplicates | List detected duplicate pairs |
| POST | /api/v1/questions/{id}/tags | Add/update tags on a question |
| GET | /api/v1/questions/stats | Question bank statistics |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /questions | QuestionBankPage | QuestionCard, SearchBar, FilterPanel, PaginationControls, BulkActionBar |
| /questions/{id} | QuestionEditPage | QuestionForm, OptionEditor, DifficultySelector, TagInput |

---

### Module 5: Export & Download
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/exports | Create export job with filter criteria |
| GET | /api/v1/exports | List user's export history |
| GET | /api/v1/exports/{id}/download | Download exported Excel file |
| DELETE | /api/v1/exports/{id} | Delete export file |

**Backend Services:**
- `excel_exporter.py` — openpyxl-based Excel generation with columns: Question, Option A-D, Correct Answer, Explanation, Source Page, NOS Unit, Criterion

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /exports | ExportsPage | ExportConfigModal, ExportHistoryTable, DownloadButton, FilterSelector |

---

### Module 6: Dashboard
**Agents:** FRONTEND-AGENT + BACKEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/dashboard/stats | Get user's dashboard statistics |
| GET | /api/v1/dashboard/recent | Get recent activity feed |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /dashboard | DashboardPage | StatCard, RecentActivityList, QuickActionPanel, DifficultyChart |
| /settings | SettingsPage | SettingsForm, PasswordChangeForm |

---

## PHASE EXECUTION PLAN

### Phase 1: Foundation (4 agents in parallel)

**DATABASE-AGENT:**
- Create all SQLAlchemy models (User, RefreshToken, Document, NOSUnit, PerformanceCriterion, MCQGenerationJob, MCQuestion, QuestionTag, QuestionTagMapping, ExportJob)
- Set up Alembic migrations
- Create `database.py` with session management
- Create model `__init__.py` with all exports

**BACKEND-AGENT:**
- Create `main.py` with FastAPI app, CORS, router registration
- Create `config.py` with Pydantic settings (env vars)
- Set up project folder structure (routers/, services/, schemas/, auth/)
- Create `requirements.txt` with all dependencies
- Create health check endpoint: `GET /api/v1/health`

**FRONTEND-AGENT:**
- Initialize Vite + React + TypeScript project
- Install and configure Tailwind CSS + shadcn/ui
- Set up folder structure (components/, pages/, hooks/, services/, context/, types/)
- Create base layout components (AppLayout, Sidebar, Navbar)
- Set up React Router with route definitions
- Create API service layer (axios instance with interceptors)
- Create AuthContext for JWT token management

**DEVOPS-AGENT:**
- Create `Dockerfile` for backend (Python 3.11)
- Create `Dockerfile` for frontend (Node 20 + nginx)
- Create `docker-compose.yml` (backend, frontend, postgres, pgadmin)
- Create `.env.example` with all required variables
- Create `.gitignore` for Python + Node + uploads
- Create `Makefile` with common commands

**Validation Gate 1:**
```bash
cd backend && pip install -r requirements.txt && alembic upgrade head
cd frontend && npm install
docker-compose config
```

---

### Phase 2: Core Modules (backend + frontend per module)

**Step 2a: Authentication Module**

BACKEND-AGENT:
- `auth/jwt.py` — JWT token creation/verification
- `auth/oauth.py` — Google OAuth flow
- `auth/dependencies.py` — get_current_user dependency
- `routers/auth.py` — All auth endpoints
- `schemas/auth.py` — Login, Register, Token schemas
- `services/auth_service.py` — Auth business logic

FRONTEND-AGENT:
- `pages/LoginPage.tsx` — Login form + Google OAuth button
- `pages/RegisterPage.tsx` — Registration form
- `pages/ProfilePage.tsx` — User profile view/edit
- `context/AuthContext.tsx` — Token storage, refresh, logout
- `services/authService.ts` — Auth API calls
- `components/ProtectedRoute.tsx` — Route guard

**Step 2b: Document Upload & Analysis Module**

BACKEND-AGENT:
- `routers/documents.py` — Document CRUD + upload + analyze
- `schemas/document.py` — Document, NOSUnit, Criterion schemas
- `services/document_parser.py` — PDF/DOCX/TXT parsing logic
- File upload handling with validation (type, size)

FRONTEND-AGENT:
- `pages/DocumentListPage.tsx` — Document list + upload dropzone
- `pages/DocumentDetailPage.tsx` — NOS units + criteria tree view
- `components/UploadDropzone.tsx` — Drag-and-drop file upload
- `components/NOSUnitAccordion.tsx` — Expandable NOS unit display

**Step 2c: MCQ Generation Module**

BACKEND-AGENT:
- `routers/generate.py` — Generation job endpoints
- `schemas/generate.py` — Job, MCQuestion schemas
- `services/mcq_generator.py` — Claude API integration + prompt engineering
- `services/duplicate_detector.py` — Question similarity detection

FRONTEND-AGENT:
- `pages/GenerationPage.tsx` — Criteria selection + generation control
- `components/ProgressTracker.tsx` — Real-time generation progress
- `components/CriteriaSelector.tsx` — Checkbox tree for criteria selection

**Step 2d: Question Bank Module**

BACKEND-AGENT:
- `routers/questions.py` — Question CRUD + search/filter + tags
- `schemas/question.py` — Question, Tag schemas

FRONTEND-AGENT:
- `pages/QuestionBankPage.tsx` — Searchable, filterable question list
- `pages/QuestionEditPage.tsx` — Question edit form
- `components/QuestionCard.tsx` — Question display card
- `components/FilterPanel.tsx` — Filter sidebar (document, NOS, difficulty)

**Step 2e: Export Module**

BACKEND-AGENT:
- `routers/exports.py` — Export job CRUD + download
- `schemas/export.py` — Export job schemas
- `services/excel_exporter.py` — openpyxl Excel generation

FRONTEND-AGENT:
- `pages/ExportsPage.tsx` — Export history + create new export
- `components/ExportConfigModal.tsx` — Export filter/column configuration

**Step 2f: Dashboard Module**

BACKEND-AGENT:
- `routers/dashboard.py` — Stats + recent activity endpoints
- `schemas/dashboard.py` — Stats response schemas

FRONTEND-AGENT:
- `pages/DashboardPage.tsx` — Stats cards + activity feed + charts
- `pages/SettingsPage.tsx` — User settings
- `components/StatCard.tsx` — Stat display widget
- `components/DifficultyChart.tsx` — Question difficulty distribution

**Validation Gate 2:**
```bash
ruff check backend/
cd frontend && npm run lint && npm run type-check
```

---

### Phase 3: Quality (3 agents in parallel)

**TEST-AGENT:**
- Backend unit tests: auth, document parsing, MCQ generation, export
- Backend integration tests: full API flow with test database
- Frontend component tests with React Testing Library
- Target: 80%+ code coverage

**REVIEW-AGENT:**
- Security audit: file upload validation, auth flow, rate limiting, input sanitization
- Performance review: database query optimization, pagination, async processing
- Code quality: type hints, error handling, logging

**Validation Gate 3:**
```bash
pytest --cov --cov-fail-under=80
cd frontend && npm test
```

**Final Validation:**
```bash
docker-compose up -d
curl http://localhost:8000/api/v1/health
cd frontend && npm run build
```

---

## VALIDATION GATES

| Gate | Phase | Commands |
|------|-------|----------|
| 1 | Foundation | `pip install -r requirements.txt`, `alembic upgrade head`, `npm install`, `docker-compose config` |
| 2 | Modules | `ruff check backend/`, `npm run lint`, `npm run type-check` |
| 3 | Quality | `pytest --cov --cov-fail-under=80`, `npm test` |
| Final | Integration | `docker-compose up -d`, `curl localhost:8000/api/v1/health`, `npm run build` |

---

## FILE STRUCTURE

```
syllabus-iq/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── nos_unit.py
│   │   │   ├── criterion.py
│   │   │   ├── question.py
│   │   │   ├── generation_job.py
│   │   │   └── export_job.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── document.py
│   │   │   ├── generate.py
│   │   │   ├── question.py
│   │   │   ├── export.py
│   │   │   └── dashboard.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── generate.py
│   │   │   ├── questions.py
│   │   │   ├── exports.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── document_parser.py
│   │   │   ├── mcq_generator.py
│   │   │   ├── duplicate_detector.py
│   │   │   └── excel_exporter.py
│   │   └── auth/
│   │       ├── jwt.py
│   │       ├── oauth.py
│   │       └── dependencies.py
│   ├── alembic/
│   │   ├── alembic.ini
│   │   └── versions/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_documents.py
│   │   ├── test_generate.py
│   │   ├── test_questions.py
│   │   └── test_exports.py
│   ├── uploads/           # Document uploads (gitignored)
│   ├── exports/           # Generated exports (gitignored)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── GoogleOAuthButton.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── documents/
│   │   │   │   ├── UploadDropzone.tsx
│   │   │   │   ├── DocumentCard.tsx
│   │   │   │   └── NOSUnitAccordion.tsx
│   │   │   ├── generation/
│   │   │   │   ├── CriteriaSelector.tsx
│   │   │   │   └── ProgressTracker.tsx
│   │   │   ├── questions/
│   │   │   │   ├── QuestionCard.tsx
│   │   │   │   └── FilterPanel.tsx
│   │   │   ├── exports/
│   │   │   │   └── ExportConfigModal.tsx
│   │   │   └── dashboard/
│   │   │       ├── StatCard.tsx
│   │   │       └── DifficultyChart.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DocumentListPage.tsx
│   │   │   ├── DocumentDetailPage.tsx
│   │   │   ├── GenerationPage.tsx
│   │   │   ├── QuestionBankPage.tsx
│   │   │   ├── QuestionEditPage.tsx
│   │   │   ├── ExportsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDocuments.ts
│   │   │   ├── useQuestions.ts
│   │   │   └── useExports.ts
│   │   ├── services/
│   │   │   ├── api.ts          # Axios instance + interceptors
│   │   │   ├── authService.ts
│   │   │   ├── documentService.ts
│   │   │   ├── generateService.ts
│   │   │   ├── questionService.ts
│   │   │   └── exportService.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── document.ts
│   │   │   ├── question.ts
│   │   │   └── export.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── Makefile
├── INITIAL.md
├── CLAUDE.md
├── PRPs/
├── skills/
└── agents/
```

---

## ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/syllabus_iq

# Auth
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## AGENT ASSIGNMENTS SUMMARY

| Agent | Phase 1 (Foundation) | Phase 2 (Modules) | Phase 3 (Quality) |
|-------|---------------------|-------------------|-------------------|
| DATABASE-AGENT | Models, migrations, database.py | — | — |
| BACKEND-AGENT | main.py, config.py, structure | Auth, Documents, Generate, Questions, Exports, Dashboard APIs | — |
| FRONTEND-AGENT | Vite setup, layout, routing | Auth, Documents, Generate, Questions, Exports, Dashboard UIs | — |
| DEVOPS-AGENT | Docker, CI/CD, env files | — | — |
| TEST-AGENT | — | — | Unit + integration tests |
| REVIEW-AGENT | — | — | Security + code quality audit |

---

## NEXT STEP

Execute with parallel agents:
```bash
/execute-prp PRPs/syllabus-iq-prp.md
```
