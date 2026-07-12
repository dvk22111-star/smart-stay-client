from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import json
import os
import re
from pathlib import Path

app = FastAPI()

# Enable CORS for React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class User(BaseModel):
    name: str
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None

class ItineraryPayload(BaseModel):
    userId: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    offerId: Optional[str] = None
    cardNumber: Optional[str] = None
    cardExpiry: Optional[str] = None
    cardCvv: Optional[str] = None
    identity: Optional[str] = None

class VacationRegistration(BaseModel):
    userId: Optional[str] = None
    customerName: str
    email: str
    phone: Optional[str] = None
    identity: Optional[str] = None
    cardNumber: Optional[str] = None
    cardExpiry: Optional[str] = None
    cardCvv: Optional[str] = None
    vacationId: Optional[int] = None
    vacationName: Optional[str] = None
    hotelId: Optional[int] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    basicCost: Optional[float] = None
    offerId: Optional[str] = None

class ChatMessage(BaseModel):
    sessionId: Optional[str] = None
    message: str

class BotSessionCreate(BaseModel):
    VacationID: Optional[int] = None
    GroupID: Optional[int] = None
    Phone: Optional[str] = None

class BotAnswerPayload(BaseModel):
    QuestionID: Optional[int] = None
    AnswerText: Optional[str] = None

class Vacation(BaseModel):
    vacationID: int
    destination: str
    startDate: str
    endDate: str
    price: float

class Offer(BaseModel):
    id: str
    title: str
    location: str
    date: str
    description: str
    price: float
    kashrut: Optional[str] = None
    image: Optional[str] = None
    brochure: Optional[str] = None

class VacationInfo(BaseModel):
    dates: Optional[List[str]] = None
    location: Optional[str] = None
    notes: Optional[str] = None

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
REGISTRATIONS_FILE = DATA_DIR / "registrations.json"
USERS_FILE = DATA_DIR / "users.json"


def load_json_file(path: Path, default):
    if not path.exists():
        return default
    try:
        with path.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return default


def save_json_file(path: Path, data):
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)


# In-memory storage (demo only)
users_db = load_json_file(USERS_FILE, {})
sessions_db = {}
bot_sessions = {}
registrations_db = load_json_file(REGISTRATIONS_FILE, [])  # Store all vacation registrations
admin_users = [
    {"id": "admin-1", "name": "Admin", "email": "admin@example.com"}
]
placements_db = [
    {"id": "placement-1", "title": "מיקום דוגמה", "description": "מיקום לדוגמה"}
]

# Sample vacations data
VACATIONS = [
    Vacation(vacationID=1, destination="אילת - נופש ים אדום", startDate="01-07-2026", endDate="05-07-2026", price=1950),
    Vacation(vacationID=2, destination="ים המלח - ספא וריפוי", startDate="08-07-2026", endDate="12-07-2026", price=2150),
    Vacation(vacationID=3, destination="ירושלים וחברון - טיול תרבותי", startDate="15-07-2026", endDate="18-07-2026", price=1750),
    Vacation(vacationID=4, destination="צפון - טבע וטיולים", startDate="22-07-2026", endDate="26-07-2026", price=2050),
]

OFFERS = [
    Offer(
        id="offer-1",
        title="חבילת חוף דוגמא",
        location="מלון אל מול הים",
        date="21/07/2026 - 27/07/2026",
        description="חופשה מרגיעה עם ארוחת בוקר ושימוש בחדר כושר ובריכה.",
        price=2699,
        kashrut="כשר למהדרין",
        image="/assets/mock-vacation.jpg",
        brochure="/assets/תוכניה.pdf"
    ),
    Offer(
        id="offer-2",
        title="חבילת ספא דוגמא",
        location="מלון ספא יוקרה",
        date="01/08/2026 - 05/08/2026",
        description="חופשה מושלמת עם טיפולי ספא זוגיים וחוף פרטי.",
        price=3199,
        kashrut="כשר",
        image="/assets/mock-vacation-2.jpg",
        brochure="/assets/blank.pdf"
    ),
]

# Endpoints

@app.post("/auth/register", response_model=UserResponse)
async def register(user: User):
    """Register a new user"""
    user_id = str(uuid.uuid4())
    users_db[user_id] = {
        "id": user_id,
        "name": user.name,
        "email": user.email
    }
    save_json_file(USERS_FILE, users_db)
    return UserResponse(id=user_id, name=user.name, email=user.email)

@app.post("/itinerary/send")
async def send_itinerary(payload: ItineraryPayload):
    """Send itinerary to user"""
    recipient = payload.email or "unknown@example.com"
    return {
        "status": "success",
        "message": f"Itinerary sent to {recipient}",
        "to": recipient
    }

@app.post("/vacation/register")
async def register_vacation(registration: VacationRegistration):
    """Register a customer for a vacation and save all details to database"""
    import datetime
    
    reg_dict = {
        "registrationId": str(uuid.uuid4()),
        "userId": registration.userId,
        "customerName": registration.customerName,
        "email": registration.email,
        "phone": registration.phone,
        "identity": registration.identity,
        "vacationId": registration.vacationId,
        "vacationName": registration.vacationName,
        "hotelId": registration.hotelId,
        "startDate": registration.startDate,
        "endDate": registration.endDate,
        "basicCost": registration.basicCost,
        "offerId": registration.offerId,
        "registrationDate": datetime.datetime.now().isoformat(),
        "status": "pending"  # pending, confirmed, cancelled
    }
    
    # Store in a local JSON file so it persists between runs
    registrations_db.append(reg_dict)
    save_json_file(REGISTRATIONS_FILE, registrations_db)
    
    print(f"✅ New vacation registration saved:")
    print(f"   Customer: {registration.customerName}")
    print(f"   Vacation: {registration.vacationName}")
    print(f"   Email: {registration.email}")
    print(f"   Phone: {registration.phone}")
    print(f"   Total Registrations: {len(registrations_db)}")
    
    return {
        "status": "success",
        "message": f"ההרשמה לנופש {registration.vacationName} בוצעה בהצלחה",
        "registrationId": reg_dict["registrationId"],
        "confirmationEmail": registration.email
    }

class AdminLoginPayload(BaseModel):
    username: str
    password: str

@app.post("/admin/login")
async def admin_login(payload: AdminLoginPayload):
    if payload.username == "admin" and payload.password == "admin":
        return {"access_token": "demo-admin-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/admin/users")
async def get_admin_users():
    """Return all saved vacation registrations for the admin interface."""
    return registrations_db

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a saved vacation registration by its registrationId."""
    global registrations_db
    for index, registration in enumerate(registrations_db):
        if registration.get("registrationId") == user_id:
            del registrations_db[index]
            save_json_file(REGISTRATIONS_FILE, registrations_db)
            return {"status": "deleted"}

    raise HTTPException(status_code=404, detail="Registration not found")

@app.get("/placement")
async def get_placement():
    return placements_db

def get_bot_reply(session_id: str, message: str) -> str:
    """Return bot responses based only on the server data already defined in this module."""
    normalized = (message or "").strip().lower()
    normalized = re.sub(r"[^א-תa-z0-9\s]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    def contains(*terms: str) -> bool:
        return any(term in normalized for term in terms)

    if not normalized or contains("start", "התחל", "שלום", "היי", "hi", "hello"):
        vacations = "; ".join(
            f"{vacation.destination} ({vacation.startDate}-{vacation.endDate}, {int(vacation.price)}₪)"
            for vacation in VACATIONS
        )
        return f"שלום! אני הבוט של Smart Stay. החופשות שלי כרגע: {vacations}"

    if contains("הצעה", "הצעות", "מבצע", "מבצעים", "offer", "offers", "discount"):
        offers = "; ".join(f"{offer.title} - {offer.date}" for offer in OFFERS)
        return f"ההצעות הזמינות כרגע: {offers}"

    if contains("תאריך", "תאריכים", "מתי", "תאריכים"):
        return "התאריכים הזמינים: " + ", ".join(vacation.startDate for vacation in VACATIONS)

    if contains("מחיר", "כמה", "עלות", "עולה", "כמה זה"):
        prices = ", ".join(f"{vacation.destination}: {int(vacation.price)}₪" for vacation in VACATIONS)
        return f"המחירים הזמינים: {prices}"

    if contains("להזמין", "הזמנה", "איך להזמין", "רוצה להזמין"):
        return (
            "כדי להזמין חופשה כתוב שם יעד, הצעה, תאריך או מחיר, ואנחנו נחזור אליך. "
            "אם ברצונך לרשום הזמנה, היכנס לטופס ההרשמה באתר."
        )

    if contains("עזרה", "מה אפשר", "מה אתה יכול", "help"):
        return (
            "אני יכול לענות על שאלות על חופשות, הצעות, תאריכים ומחירים. "
            "נסה לכתוב: 'אילת', 'הצעות', 'תאריכים', 'מחירים' או 'איך להזמין'."
        )

    for vacation in VACATIONS:
        destination = vacation.destination.lower()
        if destination in normalized or any(term in normalized for term in destination.split()):
            return (
                f"מצאתי חופשה: {vacation.destination} מ-{vacation.startDate} עד {vacation.endDate} במחיר {int(vacation.price)}₪"
            )

    return (
        "אני יכול לענות רק על חופשות, הצעות, תאריכים ומחירים מתוך הנתונים הקיימים בשרת. "
        "כתוב למשל: 'אילת', 'הצעות', 'תאריכים' או 'מחירים'."
    )


@app.post("/chat/message")
async def chat_message(msg: ChatMessage):
    """Handle chat message using only the backend-defined bot logic."""
    session_id = msg.sessionId or str(uuid.uuid4())
    reply = get_bot_reply(session_id, msg.message)

    sessions_db[session_id] = msg.message
    bot_sessions[session_id] = {"last_reply": reply}
    return {
        "sessionId": session_id,
        "reply": reply,
    }

@app.post("/bot/sessions")
async def create_bot_session(payload: BotSessionCreate):
    session_id = str(uuid.uuid4())
    bot_sessions[session_id] = {"phone": payload.Phone}
    return {
        "SessionID": session_id,
        "message": "שלום! אני הבוט של Smart Stay. איך אוכל לעזור?",
    }

@app.post("/bot/sessions/{session_id}/verify-phone")
async def verify_bot_phone(session_id: str):
    if session_id not in bot_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "message": "שלום! אני הבוט של Smart Stay. כתוב לי מה אתה רוצה לדעת.",
        "next_question": {"text": "תוכל לכתוב למשל: הצעות, אילת, תאריכים או מחיר"},
    }

@app.post("/bot/sessions/{session_id}/answers")
async def answer_bot_question(session_id: str, payload: BotAnswerPayload):
    if session_id not in bot_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    reply = get_bot_reply(session_id, payload.AnswerText or "")
    bot_sessions[session_id]["last_reply"] = reply
    return {
        "message": reply,
    }

@app.get("/vacations", response_model=List[Vacation])
async def get_vacations():
    """Get all available vacations"""
    return VACATIONS

@app.get("/offers", response_model=List[Offer])
async def get_offers():
    """Get all vacation offers"""
    return OFFERS

@app.get("/vacation_info", response_model=VacationInfo)
async def get_vacation_info():
    """Get vacation information"""
    return VacationInfo(
        dates=["01-07-2026", "08-07-2026", "15-07-2026", "22-07-2026"],
        location="Israel",
        notes="Check out our amazing vacation packages for summer 2026!"
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
