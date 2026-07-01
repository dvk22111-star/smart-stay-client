from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid

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

class ChatMessage(BaseModel):
    sessionId: Optional[str] = None
    message: str

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

# In-memory storage (demo only)
users_db = {}
sessions_db = {}

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

@app.post("/chat/message")
async def chat_message(msg: ChatMessage):
    """Handle chat message"""
    session_id = msg.sessionId or str(uuid.uuid4())
    
    # Simple echo bot for demo
    reply = f"You said: {msg.message}"
    
    sessions_db[session_id] = msg.message
    
    return {
        "sessionId": session_id,
        "reply": reply
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
