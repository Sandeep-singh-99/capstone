# MediGuide AI - Backend Engine

MediGuide AI is a production-quality, multi-agent Healthcare Information Navigator designed to help users understand medical reports, clinical parameters, and mapping symptoms to recommended doctor specialties in simple language. 

This repository contains the backend implementation using **FastAPI**, **LangGraph**, **LangChain**, **PostgreSQL (pgvector)**, and the **Model Context Protocol (MCP)**.

---

## Technical Architecture

The codebase follows **Clean Architecture** patterns:
1.  **Core / Domain Layer**: Defines core configurations and base entities (SQLAlchemy Models).
2.  **Repository Layer**: Decouples database operations from business routing, providing clean transactional hooks.
3.  **Service Layer**: Houses core logical services (report parsing, chat history, specialty matching) and triggers the LangGraph orchestration flow.
4.  **API / Presentation Layer**: Defines route endpoint controllers, rate limits, Pydantic schemas, and structured logging hooks.

### Multi-Agent LangGraph Workflow

```mermaid
graph TD
    START((Input Request)) --> Planner{Planner Agent}
    
    Planner -->|Image Upload| Image[Image Reader Agent]
    Planner -->|PDF Upload| PDF[Report Reader Agent]
    Planner -->|Text Symptoms| Symptom[Symptom Reader Agent]
    Planner -->|Conversation Chat| Chat[Chat Agent]
    
    Image --> Knowledge[Medical Knowledge Agent]
    PDF --> Knowledge
    Symptom --> Knowledge
    
    Knowledge -->|Image Flow| Rec1[Doctor Recommendation Agent]
    Knowledge -->|PDF Flow| Hist2[History Agent]
    Knowledge -->|Symptom Flow| Rec3[Doctor Recommendation Agent]
    Knowledge -->|Chat Flow| Chat
    
    Rec1 --> Hist1[History Agent]
    Rec3 --> Chat
    Hist2 --> Chat
    
    Hist1 --> END((Output Response))
    Chat --> END
```

---

## Database ER Schema

*   **User**: Fields: `id`, `full_name`, `email`, `role` (admin/patient/doctor/user), `image_url`, `image_public_id`, `hashed_password`, `created_at`, `updated_at`.
*   **MedicalReport**: Fields: `id`, `user_id` (FK), `file_url`, `file_public_id`, `file_type` ('image'/'pdf'), `image_url`, `image_public_id`, `input_text`, `extracted_text`, `ai_summary`, timestamps.
*   **Conversation**: Fields: `id`, `user_id` (FK), `report_id` (FK, nullable), `title`, timestamps.
*   **ChatHistory**: Fields: `id`, `user_id` (FK), `conversation_id` (FK), `report_id` (FK, nullable), `question`, `answer`, timestamps.
*   **Specialist**: Fields: `id`, `name` (unique), `description`, `symptoms` (JSON array), timestamps.
*   **Reminder**: Fields: `id`, `user_id` (FK), `title`, `description` (nullable), `reminder_date` (datetime), `is_completed` (boolean), timestamps.
*   **AuditLog**: Fields: `id`, `user_id` (FK, nullable), `action` (login, upload, agent, etc.), `details`, `ip_address`, `created_at`.

---

## API Endpoints Documentation

### 1. Authentication (`/auth`)
*   `POST /auth/register` - Create patient profile (form data).
*   `POST /auth/login` - Authenticate & retrieve JWT access token in httpOnly cookie.
*   `GET /auth/me` - Fetch profile metadata.
*   `POST /auth/logout` - Clear cookies.

### 2. Medical Reports (`/reports`)
*   `POST /reports/upload` - Secure file upload validation (<10MB, images & PDFs only). Triggers LangGraph vision or parsing agents.
*   `GET /reports/{id}` - Fetch single report analysis details.
*   `DELETE /reports/{id}` - Delete report from database and delete asset from Cloudinary.

### 3. Consultation Chat (`/chat`)
*   `POST /chat/start` - Initialize session linked optionally to a report.
*   `POST /chat/{id}/message` - Submit message/query. Triggers conversation memory, previous reports search, and RAG retrieval.
*   `GET /chat/{id}/history` - Fetch full Q&A messages.
*   `GET /chat/` - List user's consultation sessions.
*   `DELETE /chat/{id}` - Remove chat session.

### 4. Specialists Routing (`/specialists`)
*   `POST /specialists/recommend` - Query matching medical specialty based on raw symptom list.
*   `GET /specialists/` - List clinical specialties directory.

### 5. Patient Reminders (`/reminders`)
*   `POST /reminders/` - Create a medication, appointment, or follow-up reminder.
*   `GET /reminders/` - List reminders.
*   `PATCH /reminders/{id}/complete` - Toggle completion status.
*   `DELETE /reminders/{id}` - Delete reminder.

---

## Environment Configuration (`.env`)

Add the following keys to your `server/.env` file:

```env
DATABASE_URL="postgresql://neondb_owner:...@ep-noisy-snow-ahcf3g56-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET_KEY="your-jwt-secret-string"
ACCESS_TOKEN_EXPIRE_DAYS=15

CLOUDINARY_CLOUD_NAME="dclpb8mva"
CLOUDINARY_API_KEY="646183267773685"
CLOUDINARY_API_SECRET="3dCo_o3Pkh8CjC7AypLTBSEDwLc"

# Gemini AI Configuration (Required for active LLM/embeddings)
GEMINI_API_KEY="your-google-gemini-api-key"
```

---

## Setup & Running Instructions

### 1. Local Run
Install dependencies inside the virtual environment:
```bash
uv pip install -r requirements.txt
```

Deploy DB migrations:
```bash
python -m alembic upgrade head
```

Seed specialist catalog & RAG medical seed documents:
```bash
python -m app.utils.seed
python -m app.rag.ingest
```

Run dev server:
```bash
uvicorn app.main:app --reload
```

Run MCP stdio process server:
```bash
python -m app.mcp.server
```

### 2. Docker Run
Build and run the entire stack (FastAPI server + client UI) using Docker Compose:
```bash
docker-compose up --build
```
The server will bind to port `8000` and the client VITE app to port `5173`.
