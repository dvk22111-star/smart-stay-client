from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import logging

# Enable logging to debug issues
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for React frontend - allow all origins during development
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a fallback middleware to ensure CORS headers are present on every response
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

logger.info("✓ CORS middleware enabled for frontend connections")

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

# Sample vacations data - MATCHES TypeScript Model
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

@app.get("/")
async def root():
    """Root endpoint"""
    logger.info("✓ Root endpoint called")
    return {"message": "Backend is running", "version": "1.0", "status": "ok"}

@app.post("/auth/register", response_model=UserResponse)
async def register(user: User):
    """Register a new user"""
    user_id = str(uuid.uuid4())
    users_db[user_id] = {
        "id": user_id,
        "name": user.name,
        "email": user.email
    }
    logger.info(f"✓ User registered: {user.name}")
    return UserResponse(id=user_id, name=user.name, email=user.email)

@app.post("/itinerary/send")
async def send_itinerary(payload: ItineraryPayload):
    """Send itinerary to user"""
    recipient = payload.email or "unknown@example.com"
    logger.info(f"✓ Itinerary sent to {recipient}")
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
    
    logger.info(f"✓ Chat message received in session {session_id}")
    return {
        "sessionId": session_id,
        "reply": reply
    }

@app.get("/vacations", response_model=List[Vacation])
async def get_vacations():
    """Get all available vacations"""
    logger.info(f"✓ Vacations endpoint called - returning {len(VACATIONS)} vacations")
    return VACATIONS

@app.get("/offers", response_model=List[Offer])
async def get_offers():
    """Get all vacation offers"""
    logger.info(f"✓ Offers endpoint called - returning {len(OFFERS)} offers")
    return OFFERS

@app.get("/vacation_info", response_model=VacationInfo)
async def get_vacation_info():
    """Get vacation information"""
    info = VacationInfo(
        dates=["01-07-2026", "08-07-2026", "15-07-2026", "22-07-2026"],
        location="Israel",
        notes="Check out our amazing vacation packages for summer 2026!"
    )
    logger.info("✓ Vacation info endpoint called")
    return info

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("✓ Health check called")
    return {"status": "ok", "message": "Backend is running on 127.0.0.1:8000"}

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting FastAPI server on http://127.0.0.1:8000")
    logger.info("📋 Endpoints available:")
    logger.info("   GET  /vacations - Get all vacations")
    logger.info("   GET  /offers - Get all offers")
    logger.info("   GET  /vacation_info - Get vacation info")
    logger.info("   GET  /health - Health check")
    logger.info("   POST /auth/register - Register user")
    logger.info("   POST /itinerary/send - Send itinerary")
    logger.info("   POST /chat/message - Send chat message")
    uvicorn.run(app, host="127.0.0.1", port=8000)

