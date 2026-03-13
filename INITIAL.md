# INITIAL.md - Syllabus-IQ Product Definition

> An intelligent tool that analyzes educational syllabus and job requirement documents to automatically generate high-quality MCQs aligned with National Occupational Standards (NOS).

---

## PRODUCT

### Name
Syllabus-IQ

### Description
Syllabus-IQ is an AI-powered platform that reads and analyzes syllabus PDFs, Word documents, and text files to identify National Occupational Standards (NOS) units and their performance criteria. It automatically generates structured Multiple Choice Questions (MCQs) for each criterion, complete with answer explanations and exact source page references. The system includes duplicate detection, a searchable question bank, and structured Excel export — helping teachers and students transform syllabus documents into ready-to-use assessment material.

### Target User
Students, teachers, and educational institutions who need to create assessment materials from syllabus and job requirement documents.

### Type
- [x] SaaS (Software as a Service)

---

## TECH STACK

| Layer | Choice |
|-------|--------|
| Backend | FastAPI + Python 3.11+ |
| Frontend | React + TypeScript + Vite |
| Database | PostgreSQL + SQLAlchemy |
| Auth | JWT + Email/Password + Google OAuth |
| UI | Tailwind CSS + shadcn/ui |
| AI | Claude API (Anthropic) |
| Payments | None |

---

## MODULES

### Module 1: Authentication (Required)

**Description:** User authentication and authorization with email/password and Google OAuth.

**Models:**
```
User:
  - id, email, hashed_password, full_name
  - role (user/admin), is_active, is_verified
  - oauth_provider, avatar_url
  - created_at, updated_at

RefreshToken:
  - id, user_id (FK), token, expires_at, revoked, created_at
```

**Endpoints:**
- POST /api/v1/auth/register - Create new account
- POST /api/v1/auth/login - Login with email/password
- POST /api/v1/auth/refresh - Refresh access token
- POST /api/v1/auth/logout - Revoke refresh token
- GET /api/v1/auth/me - Get current user profile
- PUT /api/v1/auth/me - Update profile
- GET /api/v1/auth/google - Initiate Google OAuth
- GET /api/v1/auth/google/callback - Google OAuth callback

**Pages:**
- /login - Login page
- /register - Registration page
- /forgot-password - Forgot password page
- /profile - User profile page (protected)

---

### Module 2: Document Upload & Analysis

**Description:** Upload syllabus PDFs, Word documents, and text files. Parse and extract NOS units and performance criteria from uploaded documents.

**Models:**
```
Document:
  - id, user_id (FK)
  - filename, original_filename, file_type (pdf/docx/txt)
  - file_size, file_path
  - status (uploaded/processing/analyzed/failed), error_message
  - uploaded_at, processed_at

NOSUnit:
  - id, document_id (FK)
  - unit_code, unit_title, description
  - order_index, created_at

PerformanceCriterion:
  - id, nos_unit_id (FK)
  - criterion_code, criterion_text, page_reference
  - order_index, created_at
```

**Endpoints:**
- POST /api/v1/documents/upload - Upload document (PDF/DOCX/TXT)
- GET /api/v1/documents - List user's documents
- GET /api/v1/documents/{id} - Get document details with NOS units
- DELETE /api/v1/documents/{id} - Delete document and related data
- POST /api/v1/documents/{id}/analyze - Trigger document analysis
- GET /api/v1/documents/{id}/nos-units - Get extracted NOS units
- GET /api/v1/documents/{id}/criteria - Get all performance criteria

**Pages:**
- /documents - Document list with drag-and-drop upload area
- /documents/{id} - Document detail view showing extracted NOS units and criteria

---

### Module 3: MCQ Generation Engine

**Description:** AI-powered MCQ generation using Claude API. Generates questions aligned to each performance criterion with explanations and source references. Includes duplicate detection.

**Models:**
```
MCQGenerationJob:
  - id, document_id (FK), user_id (FK)
  - status (pending/generating/completed/failed)
  - total_criteria, processed_criteria
  - error_message
  - started_at, completed_at, created_at

MCQuestion:
  - id, generation_job_id (FK), document_id (FK)
  - nos_unit_id (FK), criterion_id (FK), user_id (FK)
  - question_text
  - option_a, option_b, option_c, option_d
  - correct_option (A/B/C/D)
  - explanation, source_page_reference
  - difficulty_level (easy/medium/hard)
  - is_duplicate, duplicate_of_id (FK, nullable)
  - created_at, updated_at
```

**Endpoints:**
- POST /api/v1/generate/{document_id} - Start MCQ generation for a document
- GET /api/v1/generate/{job_id}/status - Get generation job status
- POST /api/v1/generate/{document_id}/criteria - Generate MCQs for specific criteria
- GET /api/v1/generate/{job_id}/results - Get generated questions from a job

**Pages:**
- /generate/{document_id} - Generation control panel (select criteria, start, view progress)
- Real-time progress indicator during generation

---

### Module 4: Question Bank Management

**Description:** Browse, search, filter, edit, and organize all generated MCQs. Duplicate detection and question quality management.

**Models:**
```
QuestionTag:
  - id, name, created_at

QuestionTagMapping:
  - id, question_id (FK), tag_id (FK)
```

**Endpoints:**
- GET /api/v1/questions - List questions with search, filter, pagination
- GET /api/v1/questions/{id} - Get question detail
- PUT /api/v1/questions/{id} - Edit a question
- DELETE /api/v1/questions/{id} - Delete a question
- GET /api/v1/questions/duplicates - List detected duplicates
- POST /api/v1/questions/{id}/tags - Add tags to a question
- GET /api/v1/questions/stats - Question bank statistics

**Pages:**
- /questions - Question bank with search, filters (by document, NOS unit, difficulty, tags)
- /questions/{id} - Question detail/edit view
- Bulk actions (delete, export selected)

---

### Module 5: Export & Download

**Description:** Export generated questions to structured Excel format with columns for question text, options, correct answer, explanation, source reference, NOS unit, and criterion.

**Models:**
```
ExportJob:
  - id, user_id (FK)
  - filename, format (xlsx)
  - filter_criteria (JSON), status (pending/processing/completed/failed)
  - file_path, row_count
  - created_at, completed_at
```

**Endpoints:**
- POST /api/v1/exports - Create export job with filter criteria
- GET /api/v1/exports - List user's exports
- GET /api/v1/exports/{id}/download - Download exported file
- DELETE /api/v1/exports/{id} - Delete export

**Pages:**
- /exports - Export history and new export creation
- Export configuration modal (select documents, filters, columns)

---

### Module 6: Dashboard

**Description:** Overview and statistics for the user's activity.

**Pages:**
- /dashboard - Main dashboard with widgets:
  - Total documents uploaded
  - Total questions generated
  - Recent activity feed
  - Quick actions (upload, generate, export)
  - Questions by difficulty distribution chart
- /settings - User settings and preferences

---

### Module 7: Admin Panel (Post-MVP)

**Description:** Admin-only management interface for platform oversight.

**Endpoints:**
- GET /api/v1/admin/users - List all users with stats
- PUT /api/v1/admin/users/{id} - Update user role/status
- GET /api/v1/admin/stats - Platform-wide statistics
- GET /api/v1/admin/documents - List all documents across users
- DELETE /api/v1/admin/users/{id} - Deactivate user account

**Pages:**
- /admin - Admin dashboard with platform stats
- /admin/users - User management table
- /admin/documents - Document overview

---

### Module 8: Analytics Dashboard (Post-MVP)

**Description:** Usage metrics and insights.

**Endpoints:**
- GET /api/v1/analytics/overview - Overall usage stats
- GET /api/v1/analytics/generation - MCQ generation metrics over time
- GET /api/v1/analytics/documents - Document processing stats

**Pages:**
- /analytics - Charts: questions over time, documents processed, NOS coverage heatmap

---

### Module 9: Question Preview & Print (Post-MVP)

**Description:** Preview generated questions as a formatted test paper for printing.

**Endpoints:**
- POST /api/v1/preview - Generate printable preview with selected questions
- GET /api/v1/preview/{id} - Get preview HTML/PDF

**Pages:**
- /preview - Question preview with print-friendly layout
- Test paper header customization (institution name, exam title, date)

---

## MVP SCOPE

### Must Have (MVP)
- [x] User registration and login (email/password + Google OAuth)
- [x] Upload PDF/DOCX/TXT and extract NOS units & performance criteria
- [x] AI-powered MCQ generation with explanations & source references
- [x] Question bank with search, filter, and edit capabilities
- [x] Export to structured Excel format
- [x] Basic dashboard with stats

### Nice to Have (Post-MVP)
- [ ] Admin panel
- [ ] Analytics dashboard with charts
- [ ] Question preview & print as test paper
- [ ] Email notifications
- [ ] Bulk document upload
- [ ] Question difficulty auto-classification
- [ ] Collaborative question editing

---

## ACCEPTANCE CRITERIA

### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can login with Google OAuth
- [ ] JWT tokens work correctly with refresh
- [ ] Protected routes redirect to login
- [ ] Admin role access control works

### Document Upload & Analysis
- [ ] User can upload PDF, DOCX, and TXT files
- [ ] Drag-and-drop upload works
- [ ] Document parsing extracts NOS units correctly
- [ ] Performance criteria are extracted with page references
- [ ] Processing status updates in real-time
- [ ] Error handling for invalid/corrupt files

### MCQ Generation
- [ ] Claude API generates relevant MCQs per criterion
- [ ] Each question has 4 options (A/B/C/D)
- [ ] Correct answer is identified
- [ ] Explanation is provided for each question
- [ ] Source page reference is included
- [ ] Duplicate detection flags similar questions
- [ ] Generation progress is visible in real-time

### Question Bank
- [ ] Questions are searchable by text
- [ ] Questions can be filtered by document, NOS unit, difficulty
- [ ] Questions can be edited and saved
- [ ] Questions can be deleted
- [ ] Pagination works correctly

### Export
- [ ] Excel export contains all required columns
- [ ] Filters can be applied before export
- [ ] Downloaded file opens correctly in Excel
- [ ] Export history is maintained

### Quality
- [ ] All API endpoints documented in OpenAPI
- [ ] Backend test coverage 80%+
- [ ] Frontend TypeScript strict mode passes
- [ ] Docker builds and runs successfully

---

## SPECIAL REQUIREMENTS

### Security
- [x] Rate limiting on auth endpoints
- [x] Rate limiting on AI generation endpoints
- [x] Input validation on all endpoints
- [x] SQL injection prevention (SQLAlchemy ORM)
- [x] XSS prevention
- [x] CSRF protection for OAuth flows
- [x] File upload validation (type, size limits: 20MB max)
- [x] Uploaded files stored securely (not publicly accessible)

### Integrations
- [x] Claude API (Anthropic) for MCQ generation
- [x] PDF parsing (PyPDF2 / pdfplumber)
- [x] DOCX parsing (python-docx)
- [x] Excel generation (openpyxl)

---

## AGENTS

| Agent | Role | Works On |
|-------|------|----------|
| DATABASE-AGENT | Creates all models and migrations | All database models |
| BACKEND-AGENT | Builds API endpoints and services | Auth, documents, generation, export |
| FRONTEND-AGENT | Creates UI pages and components | All pages and components |
| DEVOPS-AGENT | Sets up Docker, CI/CD | Infrastructure |
| TEST-AGENT | Writes unit and integration tests | All code |
| REVIEW-AGENT | Security and code quality audit | All code |

---

# READY?

```bash
/generate-prp INITIAL.md
```

Then:

```bash
/execute-prp PRPs/syllabus-iq-prp.md
```
