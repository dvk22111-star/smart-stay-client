Backend demo (FastAPI)

How to run (Windows):

1. Create a virtual environment (recommended):

```
python -m venv .venv
.venv\Scripts\activate
```

2. Install requirements:

```
pip install -r Service/requirements.txt
```

3. Run the FastAPI app:

```
uvicorn Service.api.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

Endpoints (demo):
- POST `/auth/register` { name, email? } -> { id, name, email }
- POST `/itinerary/send` { userId?, email? } -> { status, to? }
- POST `/chat/message` { sessionId?, message } -> { sessionId, reply }

Note: this is a minimal demo (in-memory). For production connect to SQL Server and persistent storage.
