# CLAUDE.md - Syllabus-IQ Project Rules

> Project-specific rules for Claude Code. This file is read automatically.

---

## Project Overview

**Project Name:** Syllabus-IQ
**Description:** AI-powered platform that analyzes syllabus documents and generates MCQs aligned with NOS performance criteria.
**Tech Stack:**
- Backend: FastAPI + Python 3.11+
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL + SQLAlchemy
- Auth: JWT + Email/Password + Google OAuth
- UI: Tailwind CSS + shadcn/ui
- AI: Claude API (Anthropic)

---

## Project Structure

```
syllabus-iq/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── nos_unit.py
│   │   │   ├── criterion.py
│   │   │   ├── question.py
│   │   │   ├── generation_job.py
│   │   │   └── export_job.py
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   │   ├── document_parser.py
│   │   │   ├── mcq_generator.py
│   │   │   ├── duplicate_detector.py
│   │   │   └── excel_exporter.py
│   │   └── auth/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── types/
│   └── package.json
├── .claude/
│   └── commands/
├── skills/
├── agents/
└── PRPs/
```

---

## Code Standards

### Python (Backend)
```python
# ALWAYS use type hints
def get_document(db: Session, document_id: int) -> Document:
    pass

# ALWAYS use async for endpoints
@router.get("/documents/{id}")
async def get_document(id: int, db: Session = Depends(get_db)):
    pass

# Use logging, never print()
import logging
logger = logging.getLogger(__name__)
```

### TypeScript (Frontend)
```typescript
// ALWAYS define interfaces - NO any types
interface MCQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}

const fetchQuestions = async (documentId: number): Promise<MCQuestion[]> => {
  // ...
};
```

---

## Forbidden Patterns

### Backend
- Never use `print()` - use `logging` module
- Never store passwords in plain text - use bcrypt
- Never hardcode secrets - use environment variables
- Never use `SELECT *` - specify columns
- Never skip input validation
- Never expose file paths to users

### Frontend
- Never use `any` type
- Never leave `console.log` in production
- Never skip error handling in async operations
- Never use inline styles - use Tailwind CSS

---

## Module-Specific Rules

### Document Upload
- Validate file types server-side (not just extension)
- Max file size: 20MB
- Store uploads outside of web-accessible directories
- Generate unique filenames to prevent collisions

### MCQ Generation
- Rate limit generation requests per user
- Always include source page references
- Run duplicate detection after generation
- Handle Claude API errors gracefully with retries

### Question Bank
- All questions must belong to a user (user_id FK)
- Question status: active, archived, duplicate
- Difficulty levels: easy, medium, hard

### Export
- Generate Excel files asynchronously for large datasets
- Clean up old export files periodically

---

## API Conventions

- All endpoints prefixed with `/api/v1/`
- Use plural nouns: `/documents`, `/questions`, `/exports`
- Return appropriate HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 409: Conflict
  - 429: Too Many Requests

---

## Authentication

### JWT Configuration
- Access token expires: 30 minutes
- Refresh token expires: 7 days
- Algorithm: HS256

### OAuth Providers
- Google OAuth 2.0 enabled
- Always verify state parameter for CSRF protection

---

## Environment Variables

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

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d

# Tests
pytest backend/tests -v
cd frontend && npm test

# Linting
ruff check backend/
cd frontend && npm run lint
```

---

## Validation

```bash
ruff check backend/ && pytest
npm run lint && npm run type-check
docker-compose build
```

---

## Commit Message Format

```
feat(module): add feature
fix(module): fix bug
refactor(module): refactor component
test(module): add tests
docs: update documentation
```

---

## Workflow

```
1. Edit INITIAL.md (define product)
2. /generate-prp INITIAL.md
3. /execute-prp PRPs/syllabus-iq-prp.md
```

---

## Skills

| Task | Skill |
|------|-------|
| API + Auth | `skills/BACKEND.md` |
| React + UI | `skills/FRONTEND.md` |
| Models | `skills/DATABASE.md` |
| Tests | `skills/TESTING.md` |
| Docker | `skills/DEPLOYMENT.md` |

---

## Agents

| Agent | Role |
|-------|------|
| DATABASE-AGENT | Models + migrations |
| BACKEND-AGENT | API + auth + services |
| FRONTEND-AGENT | UI + pages |
| DEVOPS-AGENT | Docker + CI/CD |
| TEST-AGENT | Unit + integration tests |
| REVIEW-AGENT | Security + code quality |
