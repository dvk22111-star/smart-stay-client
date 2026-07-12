import { Offer, get_vacation_info, VacationInfo, getVacations } from '../Service/server/home'
import React, { useState, useEffect } from 'react'
import {
  Typography,
  Button,
  Box,
  TextField,
  Paper,
  CircularProgress,
  Stack,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material'
import { Vacation } from "../Models/vacations";
import LoginIcon from '@mui/icons-material/LoginRounded'
import InfoIcon from '@mui/icons-material/InfoRounded'
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded'
import LogoutIcon from '@mui/icons-material/LogoutRounded'
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded'
import CloseIcon from '@mui/icons-material/CloseRounded'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../Style/mainS'
import { isValidEmail, normalizeEmail } from './validation'

const brochurePdfUrl = '/brochure.pdf'
const rawApiUrl = (globalThis as typeof globalThis & { __APP_API_URL__?: string }).__APP_API_URL__ || ''
const API_BASE_URLS = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  rawApiUrl.replace(/\/$/, ''),
]

async function fetchFromApi(path: string, options: RequestInit = {}) {
  let lastError: unknown = null

  for (const base of API_BASE_URLS) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      })

      if (res.ok) {
        return res
      }

      lastError = new Error(`HTTP ${res.status}`)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('שגיאה בהתחברות לשרת')
}

// Brizza component not used in this file
const navButtonSx = {
  mr: 1,
  color: '#1e293b',
  textTransform: 'none',
  borderRadius: 3,
  border: '1px solid rgba(30,41,59,0.16)',
  bgcolor: 'rgba(255,255,255,0.9)',
  minWidth: 160,
  boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
  '&:hover': {
    boxShadow: '0 8px 22px rgba(15,23,42,0.12)',
    transform: 'translateY(-1px)',
    bgcolor: 'rgba(244,247,255,0.95)',
  },
}

const primaryButtonSx = {
  color: '#0f172a',
  textTransform: 'none',
  borderRadius: 999,
  border: '1px solid rgba(59,130,246,0.18)',
  bgcolor: '#ffffff',
  px: 2.5,
  py: 1.1,
  fontWeight: 700,
  boxShadow: '0 12px 28px rgba(37,99,235,0.14)',
  '&:hover': {
    bgcolor: '#eff6ff',
    boxShadow: '0 16px 34px rgba(37,99,235,0.2)',
    transform: 'translateY(-1px)',
  },
}

const heroButtonSx = {
  minWidth: 190,
  borderRadius: 999,
  px: 2.6,
  py: 1.35,
  fontSize: 15,
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: '0 16px 34px rgba(15,23,42,0.12)',
  transition: 'all 0.22s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 42px rgba(15,23,42,0.16)',
  },
}

const secondaryHeroButtonSx = {
  ...heroButtonSx,
  color: '#0f172a',
  bgcolor: 'rgba(255,255,255,0.88)',
  border: '1px solid rgba(148,163,184,0.28)',
  '&:hover': {
    ...heroButtonSx['&:hover'],
    bgcolor: '#ffffff',
  },
}

const accentHeroButtonSx = {
  ...heroButtonSx,
  color: '#ffffff',
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  '&:hover': {
    ...heroButtonSx['&:hover'],
    background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
  },
}



type AdminUser = {
  UserID: number
  Name: string
  Email?: string | null
  Phone?: string | null
  Credit?: number | null
}

type Placement = {
  PlacementID: number
  RoomID: number
  VacationersCustomersID: number
  Price: number
}


type ActiveFlow = 'login' | 'sendItinerary' | 'info' | 'offers' | 'groupOffers' | 'bot' | null

type User = { id?: string | number | null; name: string | null; email: string | null }

interface LoginFlowProps {
  onRegister: (name: string, email: string) => Promise<void> | void
  onLogout: () => void
  user: User
}
const LoginFlow: React.FC<LoginFlowProps> = ({ onRegister, onLogout, user }) => {
 type Mode = 'login' | 'register' | 'join'

const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [groupCode, setGroupCode] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  function handleRegisterSubmit() {
    if (!name) return alert('אנא הזיני שם')
    if (!email) return alert('אנא הזיני דוא"ל')
    const mail = normalizeEmail(email)
    if (!isValidEmail(mail)) return alert('כתובת דוא"ל לא תקינה')
    try {
      const maybe = onRegister(name, mail)
      if (maybe && typeof (maybe as any).then === 'function') (maybe as Promise<void>).catch((e) => {
        console.error(e)
        alert('שגיאה ברישום')
      })
    } catch (e) {
      console.error(e)
      alert('שגיאה ברישום')
    }
  }

  function handleLogin() {
    if (!name) return alert('אנא הזיני שם')
    const mail = email ? normalizeEmail(email) : ''
    if (mail && !isValidEmail(mail)) return alert('כתובת דוא"ל לא תקינה')
    try {
      const maybe = onRegister(name, mail || '')
      if (maybe && typeof (maybe as any).then === 'function') (maybe as Promise<void>).catch((e) => {
        console.error(e)
        alert('שגיאה בהתחברות')
      })
    } catch (e) {
      console.error(e)
      alert('שגיאה בהתחברות')
    }
  }

  // function handleJoin() {
  //   if (!groupCode) return alert('אנא הכנס/י קוד קבוצה')
  //   alert('בקשת הצטרפות נקלטה: ' + groupCode)
  // }

  if (user && user.name)
    return (
  
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">מחובר/ת כ: {user.name}</Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" color="primary" onClick={onLogout}>
            יציאה
          </Button>
        </Box>
      </Paper>
    )

  return (

    
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        רישום / כניסה
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant={mode === 'login' ? 'contained' : 'outlined'} onClick={() => setMode('login')}>
          כניסה
        </Button>
        <Button variant={mode === 'register' ? 'contained' : 'outlined'} onClick={() => setMode('register')}>
          רישום
        </Button>
        {/* <Button variant={mode === 'join' ? 'contained' : 'outlined'} onClick={() => setMode('join')}>
          הצטרפות
        </Button> */}
      </Stack>

      {mode === 'login' && (
        <Box component="form" noValidate sx={{ display: 'grid', gap: 1 }}>
          <TextField label="שם" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Box sx={{ mt: 1 }}>
            <Button variant="contained" onClick={handleLogin} fullWidth>
              התחבר
            </Button>
          </Box>
        </Box>
      )}

      {mode === 'register' && (
        <Box component="form" noValidate sx={{ display: 'grid', gap: 1 }}>
          <TextField label="שם" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="דואל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Box sx={{ mt: 1 }}>
            <Button variant="contained" onClick={handleRegisterSubmit} fullWidth>
              רישום
            </Button>
          </Box>
        </Box>
      )}

      {/* {mode === 'join' && (
        <Box component="form" noValidate sx={{ display: 'grid', gap: 1 }}>
          <TextField label="קוד קבוצה" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} />
          <Box sx={{ mt: 1 }}>
            <Button variant="contained" onClick={handleJoin} fullWidth>
              שלח בקשה
            </Button>
          </Box>
        </Box>
      )} */}
    </Paper>
  )
}
 
interface SendItineraryFlowProps {
  user: User
  onRequireEmail: (mail: string) => void
}

const SendItineraryFlow: React.FC<SendItineraryFlowProps> = ({ user, onRequireEmail }) => {
  function send() {
    if (user && user.email) {
      const mail = normalizeEmail(user.email)
      if (!isValidEmail(mail)) {
        alert('כתובת דוא"ל הרשומה אינה תקינה, יש להזין כתובת תקינה')
        const promptMail = prompt('אנא הכנס/י כתובת אימייל:')
        if (promptMail) {
          const nm = normalizeEmail(promptMail)
          if (!isValidEmail(nm)) return alert('כתובת דוא"ל לא תקינה')
          onRequireEmail(nm)
        }
        return
      }
      alert('התוכניה נשלחה ל: ' + mail)
    } else {
      const mail = prompt('אנא הכנס/י כתובת אימייל:')
      if (!mail) return
      const nm = normalizeEmail(mail)
      if (!isValidEmail(nm)) return alert('כתובת דוא"ל לא תקינה')
      onRequireEmail(nm)
    }
   }
 
  return (
    <Box className="panel">
      <Typography variant="h6">שליחת תוכניה</Typography>
      <Typography>
        לחצי לשליחת התוכניה. אם את רשומה - תשלח אוטומטית, אחרת תתבקשו להכניס דואר.
      </Typography>
      <Box style={{ marginTop: 8 }}>
        <Button variant="contained" sx={primaryButtonSx} onClick={send}>
          שלח תוכניה
        </Button>
      </Box>
    </Box>
  )
 }
 
const InfoFlow: React.FC = () => {
  const [info, setInfo] = useState<VacationInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await get_vacation_info()
        if (!mounted) return
        setInfo(res)
        setError(null)
      } catch (e) {
        if (!mounted) return
        setInfo(null)
        setError('לא הצלחנו לטעון את הנתונים מהשרת של הפייתון. בדוק שהשרת רץ על 127.0.0.1:8000.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading)
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">מידע על הנופש</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>טוען...</Typography>
        </Box>
      </Paper>
    )

  if (error)
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">מידע על הנופש</Typography>
        <Typography color="error">{error}</Typography>
        <Typography className="small">בדוק שהשרת רץ ב־127.0.0.1:8000 ושני נתיבים זמינים: /vacation_info ו-/offers</Typography>
      </Paper>
    )

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">מידע על הנופש</Typography>
      <Typography>תאריכים: {info?.dates?.join(' - ') || 'לא זמין'}</Typography>
      <Typography>מיקום: {info?.location || 'לא זמין'}</Typography>
      {info?.notes && <Typography>{info.notes}</Typography>}
    </Paper>
  )
}

const OffersFlow: React.FC<{ vacations: Vacation[]; onRegisterOpen?: (offer: Offer, vacation: Vacation) => void }> = ({ vacations, onRegisterOpen }) => {
  const [openBrochureUrl, setOpenBrochureUrl] = useState<string | null>(null)

  const openBrochure = () => {
    const url = brochurePdfUrl
    setOpenBrochureUrl(url)
  }

  const closeBrochure = () => {
    setOpenBrochureUrl(null)
  }

  if (!vacations || vacations.length === 0) return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography color="text.secondary">אין נופשים זמינים כרגע</Typography>
    </Box>
  )

  return (
    <Box>
      <Box className="offers-grid">
        {vacations.map((vacation: Vacation) => {
          const offer: Offer = {
            id: String(vacation.VacationID),
            title: vacation.Program,
            location: `Hotel ${vacation.HotelID}`,
            date: `${vacation.StartV} - ${vacation.EndV}`,
            description: `נופש: ${vacation.Program}`,
            price: vacation.BasicCost,
          }

          return (
            <Card key={offer.id} sx={{ borderRadius: 4, boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{offer.title}</Typography>
                <Typography>תאריכים: <strong>{offer.date}</strong></Typography>
                <Typography>יעד: <strong>{offer.location}</strong></Typography>
                <Typography>מספר חדרים: <strong>{vacation.NumberOfRooms}</strong></Typography>
                <Typography>קומות: <strong>{vacation.NumberOfFloors}</strong></Typography>
                <Typography>מחיר: <strong>₪{offer.price}</strong></Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="contained" onClick={openBrochure}>
                  לצפיה בתוכניה
                </Button>
                <Button size="small" variant="contained" onClick={() => onRegisterOpen && onRegisterOpen(offer, vacation)}>
                  לרישום לנופש
                </Button>
              </CardActions>
            </Card>
          )
        })}
      </Box>
      <Dialog open={Boolean(openBrochureUrl)} onClose={closeBrochure} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          תוכניה
          <IconButton aria-label="close" onClick={closeBrochure} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {openBrochureUrl ? (
            <object data={openBrochureUrl} type="application/pdf" width="100%" height="720px">
              <p>הדפדפן שלך אינו תומך בתצוגת PDF בתוך הדיאלוג. <a href={openBrochureUrl} target="_blank" rel="noreferrer">פתח את התוכניה בחלון חדש</a>.</p>
            </object>
          ) : (
            <Typography>לא נמצא קובץ תוכניה.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBrochure}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
 
// const GroupOffersFlow: React.FC = () => (
//   <div className="panel">
//     <h3>הצעות לקבוצות</h3>
//     <p>הנחה 10% לקבוצות מעל 10 נשים</p>
//     <p>ניתן להנפיק קופון קבוצתי דרך ממשק מנהלת הקבוצה</p>
//   </div>
// )
 
export default function MainPage(): React.ReactElement {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null)
  const [user, setUser] = useState<User>({ name: null, email: null })
  const [showLogin, setShowLogin] = useState(false)
  const [showVacations, setShowVacations] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [vacationsLoading, setVacationsLoading] = useState<boolean>(true)
  const [vacationsError, setVacationsError] = useState<string | null>(null)
  const [registerOffer, setRegisterOffer] = useState<Offer | null>(null)
  const [registerVacation, setRegisterVacation] = useState<Vacation | null>(null)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [regName, setRegName] = useState<string>('')
  const [regEmail, setRegEmail] = useState<string>('')
  const [regPhone, setRegPhone] = useState<string>('')
  const [regCardNumber, setRegCardNumber] = useState<string>('')
  const [regCardExpiry, setRegCardExpiry] = useState<string>('')
  const [regCardCvv, setRegCardCvv] = useState<string>('')
  const [regIdentity, setRegIdentity] = useState<string>('')
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [showBotDialog, setShowBotDialog] = useState(false)
  const [botSessionId, setBotSessionId] = useState<number | null>(null)
  const [botMessages, setBotMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([])
  const [botInput, setBotInput] = useState('')
  const [botLoading, setBotLoading] = useState(false)
  const [botQuestionId, setBotQuestionId] = useState<string | null>(null)
  const [adminPassword, setAdminPassword] = useState<string>('')
  const [adminError, setAdminError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPage, setAdminPage] = useState<'welcome' | 'registrants' | 'placements' | 'delete'>('welcome')
  const [registrations, setRegistrations] = useState<AdminUser[]>([])
  const [selectedDeleteRegistration, setSelectedDeleteRegistration] = useState<string>('')
  // const [placements, setPlacements] = useState<Placement[]>(MOCK_PLACEMENTS)
  const [placements, setPlacements] = useState<Placement[]>([])

  function handleOpenRegister(offer: Offer, vacation: Vacation): void {
    setRegisterOffer(offer)
    setRegisterVacation(vacation)
    setRegisterError(null)
    setRegErrors({})
    setShowRegisterDialog(true)
  }

  useEffect(() => {
    let mounted = true
    const loadVacations = async () => {
      try {
        setVacationsLoading(true)
        setVacationsError(null)
        console.log('Loading vacations from server...')
        const data = await getVacations()
        console.log('Vacations response:', data)
        if (!mounted) return
        setVacations(data)
        console.log('Vacations length after set:', data.length)
      } catch (error: any) {
        console.error('Failed to load vacations:', error)
        if (!mounted) return
        setVacationsError(error?.message || 'שגיאה בטעילת נופשים')
        setVacations([])
      } finally {
        if (!mounted) return
        setVacationsLoading(false)
      }
    }

    loadVacations()
    return () => {
      mounted = false
    }
  }, [])
async function deleteUser(userId: number | string) {
  if (!userId) return

  const id = Number(userId)
  if (Number.isNaN(id)) {
    console.error('Invalid user id for delete:', userId)
    alert('שגיאה במחיקה: מזהה משתמש לא תקין')
    return
  }

  try {
    const res = await adminFetch(`/users/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Delete failed: ${text}`)
    }

    setRegistrations((prev) => prev.filter((r) => r.UserID !== id))
    setSelectedDeleteRegistration('')
    alert('המשתמש נמחק בהצלחה')
  } catch (err) {
    console.error(err)
    alert('שגיאה במחיקה')
  }
}

  function handleOpenAbout(): void {
    setShowAbout(true)
  }

  async function handleRegister(name: string, email: string): Promise<void> {
    try {
      const payload: any = { name }
      if (email) payload.email = email
      const res = await fetchFromApi('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('שגיאה ברישום')
      const data = await res.json()
      setUser({ id: data.id, name: data.name || name, email: data.email || email || null })
      alert('נרשמת בהצלחה כ: ' + (data.name || name))
    } catch (e) {
      console.error(e)
      alert('לא ניתן להשלים רישום — בדוק שהשרת רץ')
    }
  }
  async function handleAdminLogin() {
  try {
    const res = await fetchFromApi('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: adminPassword,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
  console.log("SERVER ERROR:", errorText)
      throw new Error('Login failed')
    }

    const data = await res.json()

    localStorage.setItem(
      'admin_token',
      data.access_token
    )


    setAdminError(null)
    setIsAdmin(true)
    await loadAdminUsers()
    await loadPlacements()
    setShowAdminDialog(false)
    setAdminPassword('')
    setAdminPage('welcome')

  } catch (error) {
    console.error(error)
    setAdminError('סיסמת מנהלת לא נכונה')
  }
}
async function loadPlacements() {
  const token = localStorage.getItem("admin_token")

  const res = await adminFetch("/placement")

  if (!res.ok) {
    throw new Error("Failed")
  }

  const data = await res.json()

  setPlacements(data)
}
  function handleLogout(): void {
    setUser({ name: null, email: null })
    alert('התנתקת')
  }

  function handleRequireEmail(mail: string): void {
    alert('התוכניה נשלחה ל: ' + mail)
  }

  async function startBotChat() {
    try {
      setBotLoading(true)
      setBotMessages([])
      setBotQuestionId(null)

      const sessionRes = await fetchFromApi('/bot/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Phone: '0500000000',
          VacationID: null,
          GroupID: null,
        })
      })

      if (!sessionRes.ok) throw new Error('שגיאה ביצירת סשן בוט')
      const sessionData = await sessionRes.json()
      const sessionId = sessionData.SessionID
      setBotSessionId(sessionId)

      const verifyRes = await fetchFromApi(`/bot/sessions/${sessionId}/verify-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!verifyRes.ok) throw new Error('שגיאה באתחול שיחת הבוט')
      const verifyData = await verifyRes.json()
      const nextQuestion = verifyData?.next_question || null
      const nextQuestionId = nextQuestion?.id || null
      const initialMessage =
        verifyData?.message ||
        nextQuestion?.text ||
        'שלום! איך אוכל לעזור?'

      setBotQuestionId(nextQuestionId)
      setBotMessages([{ role: 'bot', text: initialMessage }])
      setShowBotDialog(true)
      setActiveFlow('bot')
    } catch (err) {
      console.error(err)
      alert('לא הצלחנו להתחבר לשרת הבוט. וודא שהשרת ב-8000 פועל ושהקישור נכון.')
    } finally {
      setBotLoading(false)
    }
  }

  async function sendBotMessage() {
    if (!botInput.trim() || botSessionId === null) return
    const msg = botInput.trim()
    const currentQuestionId = botQuestionId

    setBotInput('')
    setBotMessages(prev => [...prev, { role: 'user', text: msg }])
    setBotLoading(true)

    try {
      const res = await fetchFromApi(`/bot/sessions/${botSessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          QuestionID: currentQuestionId,
          AnswerText: msg,
          IsFinal: false,
        })
      })

      if (!res.ok) throw new Error('שגיאה בשליחת תשובה לשרת')
      const data = await res.json()

      const responseParts = [
        data?.message,
        data?.next_question?.text,
      ].filter((part): part is string => Boolean(part && String(part).trim()))
      const responseMessage =
        responseParts.length > 0
          ? responseParts.join('\n\n')
          : 'התקבלה תשובה מהשרת.'

      setBotMessages((prev) => [...prev, { role: 'bot', text: responseMessage }])
      setBotQuestionId(data?.next_question?.id || null)
    } catch (err) {
      console.error(err)
      setBotMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'אירעה שגיאה בשליחת ההודעה. נסה שוב.' }
      ])
    } finally {
      setBotLoading(false)
    }
  }

  function validateField(field: string, value: string): string | null {
    const trimmed = value.trim()

    switch (field) {
      case 'name':
        return trimmed.length >= 2 ? null : 'אנא הזן שם מלא'
      case 'email':
        return /\S+@\S+\.\S+/.test(trimmed) ? null : 'אנא הזן כתובת מייל תקינה'
      case 'phone': {
        const digits = value.replace(/\D/g, '')
        return digits.length >= 7 ? null : 'אנא הזן מספר טלפון תקין'
      }
      case 'cardNumber': {
        const digits = value.replace(/\D/g, '')
        return digits.length >= 13 && digits.length <= 19 ? null : 'אנא הזן מספר כרטיס תקין'
      }
      case 'cardExpiry': {
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmed)) return 'אנא הזן תוקף כרטיס בפורמט MM/YY'
        const [month, year] = trimmed.split('/').map((v) => parseInt(v, 10))
        const now = new Date()
        const expiryDate = new Date(2000 + year, month - 1, 1)
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return expiryDate >= currentMonth ? null : 'תוקף הכרטיס כבר חלף'
      }
      case 'cardCvv': {
        const digits = value.replace(/\D/g, '')
        return digits.length === 3 ? null : 'אנא הזן CVV בן 3 ספרות'
      }
      case 'identity': {
        const digits = value.replace(/\D/g, '')
        return digits.length >= 7 && digits.length <= 9 ? null : 'אנא הזן מספר תעודת זהות תקין'
      }
      default:
        return null
    }
  }

  function validateAllFields(): boolean {
    const errors: Record<string, string> = {
      name: validateField('name', regName) || '',
      email: validateField('email', regEmail) || '',
      phone: validateField('phone', regPhone) || '',
      cardNumber: validateField('cardNumber', regCardNumber) || '',
      cardExpiry: validateField('cardExpiry', regCardExpiry) || '',
      cardCvv: validateField('cardCvv', regCardCvv) || '',
      identity: validateField('identity', regIdentity) || '',
    }
    setRegErrors(errors)
    return !Object.values(errors).some((error) => error)
  }
  async function loadAdminUsers() {
    const res = await adminFetch('/admin/users')

    if (!res.ok) {
      throw new Error('Failed to load users')
    }

    const data = await res.json()
    setRegistrations(data)
  }

  function updateRegField(field: string, value: string): void {
    switch (field) {
      case 'name':
        setRegName(value)
        break
      case 'email':
        setRegEmail(value)
        break
      case 'phone':
        setRegPhone(value)
        break
      case 'cardNumber':
        setRegCardNumber(value)
        break
      case 'cardExpiry':
        setRegCardExpiry(value)
        break
      case 'cardCvv':
        setRegCardCvv(value)
        break
      case 'identity':
        setRegIdentity(value)
        break
    }
    if (regErrors[field]) {
      setRegErrors((prev) => ({ ...prev, [field]: validateField(field, value) || '' }))
    }
  }

  function validateFieldOnBlur(field: string): void {
    const value = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      cardNumber: regCardNumber,
      cardExpiry: regCardExpiry,
      cardCvv: regCardCvv,
      identity: regIdentity,
    }[field] as string
    setRegErrors((prev) => ({ ...prev, [field]: validateField(field, value) || '' }))
  }

  function validateRegistrationData(data: { name: string; email: string; phone?: string; cardNumber?: string; cardExpiry?: string; cardCvv?: string; identity?: string }): string | null {
    return validateField('name', data.name || '') ||
      validateField('email', data.email || '') ||
      validateField('phone', data.phone || '') ||
      validateField('cardNumber', data.cardNumber || '') ||
      validateField('cardExpiry', data.cardExpiry || '') ||
      validateField('cardCvv', data.cardCvv || '') ||
      validateField('identity', data.identity || '') || null
  }

  async function submitRegistration(data: { name: string; email: string; phone?: string; cardNumber?: string; cardExpiry?: string; cardCvv?: string; identity?: string }) {
    const validationError = validateRegistrationData(data)
    if (validationError) {
      setRegisterError(validationError)
      return
    }

    try {
      setRegisterError(null)
     // בדיקה אם המשתמש כבר קיים לפי טלפון
let userId: number

try {
  const existingUserRes = await fetchFromApi(
    `/users/phone/${encodeURIComponent(data.phone ?? '')}`
  )

  const existingUser = await existingUserRes.json()
  userId = existingUser.UserID
} catch {
  // המשתמש לא קיים - יוצרים אותו
  const userPayload = {
    Name: data.name,
    Phone: data.phone ?? '',
    Email: normalizeEmail(data.email),
    Credit: 0,
  }
console.log('Creating user', userPayload)
  const createUserRes = await fetchFromApi('/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload),
  })

  if (!createUserRes.ok) {
    throw new Error('יצירת משתמש נכשלה')
  }

  const createdUser = await createUserRes.json()
  userId = createdUser.UserID
}

// יצירת הרשמה לחופשה
const registrationPayload = {
  UserID: userId,
  VacationID: registerVacation!.VacationID,
  UpdateDate: new Date().toISOString().split('T')[0],
  GroupMemberNumber: null,
}
console.log('Registering vacation', registrationPayload)
const registrationRes = await fetchFromApi('/vacationers-customers/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registrationPayload),
})

if (!registrationRes.ok) {
  throw new Error('שגיאה בהרשמה לחופשה')
}

const reply = await registrationRes.json()
console.log(reply)
     
      alert(
        'הרשמתך לנופש ' +
          (registerVacation?.Program || 'הנופש') +
          ' תוקלטה בהצלחה. תאריכים: ' +
          (registerVacation?.StartV || '-') +
          ' - ' +
          (registerVacation?.EndV || '-') +
          '. אנו בקשר בקרוב!'
      )
      setShowRegisterDialog(false)
    } catch (e) {
      console.error(e)
      setRegisterError('שגיאה בשליחת הרשמה — בדוק שהשרת רץ')
    }
  }
 


 
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh',
                    backgroundImage: "url('/Img/background.jpg')",
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '45% auto',
                    backgroundPosition: 'top center',
                    paddingTop: 24,
                    paddingBottom: 48 }}>
       <div className="container" style={{ padding: 24 }}>
         <div className="left" style={{ background: 'transparent', borderRadius: 8, padding: 16 }}>
           {activeFlow === null && null}
          {isAdmin ? (
          <Box
  sx={{
    textAlign: 'center',
    py: 6,
    px: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 3,
    minHeight: '80vh',
    boxShadow: 3,
  }}
>
              <Typography variant="h4" sx={{ mb: 2, color: 'white', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>מנהלת יקרה שלום וברכה</Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => setAdminPage('registrants')} sx={{ minWidth: 150, borderRadius: 3 }}>
                  הצג נרשמות
                </Button>
                <Button variant="outlined" onClick={() => setAdminPage('placements')} sx={{ minWidth: 150, borderRadius: 3 }}>
                  טבלת שיבוצים
                </Button>
                <Button variant="outlined" color="error" onClick={() => setAdminPage('delete')} sx={{ minWidth: 150, borderRadius: 3 }}>
                  מחק נרשם
                </Button>
                <Button variant="outlined" onClick={() => { setIsAdmin(false); setAdminPage('welcome') }} sx={{ minWidth: 150, borderRadius: 3 }}>
                  יציאה מממשק מנהלת
                </Button>
              </Stack>

              <Box sx={{ mt: 4 }}>
                {adminPage === 'registrants' && (
                  <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>שם</TableCell>
                          <TableCell>טלפון</TableCell>
                          <TableCell>דוא"ל</TableCell>
                          <TableCell>זיכוי</TableCell>
                          <TableCell>פעולות</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registrations.map((r) => (
                          <TableRow key={r.UserID}>
                            <TableCell>{r.Name}</TableCell>
                            <TableCell>{r.Phone || '-'}</TableCell>
                            <TableCell>{r.Email || '-'}</TableCell>
                            <TableCell>{r.Credit != null ? r.Credit : '-'}</TableCell>
                            <TableCell>
                              <Button size="small" color="error" onClick={() => deleteUser(r.UserID)}>
                                מחק
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {adminPage === 'placements' && (
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
  <TableRow>
    <TableCell>PlacementID</TableCell>
    <TableCell>RoomID</TableCell>
    <TableCell>VacationersCustomersID</TableCell>
    <TableCell>Price</TableCell>
  </TableRow>
</TableHead>
                     <TableBody>
  {placements.map((p) => (
    <TableRow key={p.PlacementID}>
      <TableCell>{p.PlacementID}</TableCell>
      <TableCell>{p.RoomID}</TableCell>
      <TableCell>{p.VacationersCustomersID}</TableCell>
      <TableCell>{p.Price}</TableCell>
    </TableRow>
  ))}
</TableBody>
                    </Table>
                  </TableContainer>
                )}

                {adminPage === 'delete' && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      select
                      value={selectedDeleteRegistration}
                      SelectProps={{ native: true }}
                      label="בחר נרשמת למחיקה"
                      sx={{ minWidth: 260 }}
                      onChange={(e) => {
                        setSelectedDeleteRegistration(e.target.value)
                      }}
                    >
                      <option value="">-- בחרי --</option>
                      {registrations.map((r) => (
                        <option key={r.UserID} value={String(r.UserID)}>
                          {r.Name} | {r.Phone || r.Email || 'אין פרטי קשר'}
                        </option>
                      ))}
                    </TextField>
                    <Button
                      variant="contained"
                      color="error"
                      disabled={!selectedDeleteRegistration}
                      onClick={() => {
                        if (selectedDeleteRegistration) {
                          deleteUser(selectedDeleteRegistration)
                        }
                      }}
                    >
                      מחק נרשמת
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box
              className="home-hero"
              sx={{
                width: '100%',
                maxWidth: 1080,
                mx: 'auto',
                mt: { xs: 2, md: 3 },
                px: { xs: 1, md: 2 },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 6,
                  px: { xs: 2.5, md: 5 },
                  py: { xs: 4, md: 6 },
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.97) 45%, rgba(245,243,255,0.98) 100%)',
                  border: '1px solid rgba(148,163,184,0.18)',
                  boxShadow: '0 26px 80px rgba(15,23,42,0.12)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -70,
                    left: -50,
                    width: 220,
                    height: 220,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 72%)',
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -90,
                    right: -60,
                    width: 260,
                    height: 260,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 72%)',
                    pointerEvents: 'none',
                  }}
                />
                <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      px: 1.5,
                      py: 0.7,
                      borderRadius: 999,
                      bgcolor: 'rgba(37,99,235,0.1)',
                      color: '#1d4ed8',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Smart Stay · חוויית נופש חכמה ונעימה
                  </Box>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ pt: 1 }}
                  >
                    <Button
                      startIcon={<LocalOfferIcon />}
                      sx={accentHeroButtonSx}
                      onClick={() => setShowVacations(true)}
                    >
                      לצפייה בנופשים
                    </Button>
                    <Button
                      startIcon={<LoginIcon />}
                      sx={secondaryHeroButtonSx}
                      onClick={() => setShowLogin(true)}
                    >
                      כניסה / רישום
                    </Button>
                    <Button
                      startIcon={<InfoIcon />}
                      sx={secondaryHeroButtonSx}
                      onClick={handleOpenAbout}
                    >
                      מידע עלינו
                    </Button>
                  </Stack>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.25}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ pt: 1 }}
                  >
                    <Button
                      startIcon={
                        <svg viewBox="0 0 120 120" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <rect x="20" y="34" width="80" height="58" rx="16" fill="#edf4ff" stroke="#2196f3" strokeWidth="5"/>
                          <rect x="34" y="18" width="52" height="28" rx="12" fill="#2196f3"/>
                          <circle cx="40" cy="58" r="8" fill="#fff"/>
                          <circle cx="80" cy="58" r="8" fill="#fff"/>
                          <rect x="36" y="76" width="48" height="8" rx="4" fill="#2196f3"/>
                          <path d="M30 44c4-6 8-8 14-8s10 2 14 8" stroke="#1976d2" strokeWidth="4" fill="none" strokeLinecap="round"/>
                          <path d="M89 40c0-7-4-12-11-12H42c-7 0-11 5-11 12" stroke="#1976d2" strokeWidth="5" fill="none"/>
                          <rect x="48" y="86" width="24" height="24" rx="6" fill="#4fc3f7"/>
                          <path d="M38 100h44" stroke="#1976d2" strokeWidth="5" strokeLinecap="round"/>
                        </svg>
                      }
                      sx={{
                        ...primaryButtonSx,
                        alignSelf: 'flex-start',
                      }}
                      onClick={startBotChat}
                    >
                      שיחה עם הבוט
                    </Button>
                    <Button
                      startIcon={<InfoIcon />}
                      sx={{
                        ...primaryButtonSx,
                        alignSelf: 'flex-start',
                      }}
                      onClick={() => setShowAdminDialog(true)}
                    >
                      תפריט ניהול
                    </Button>
                    {user.name && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{
                          borderRadius: 999,
                          px: 2.4,
                          py: 1.1,
                          textTransform: 'none',
                          fontWeight: 700,
                        }}
                      >
                        התנתק/י
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}
          {activeFlow === 'sendItinerary' && <SendItineraryFlow user={user} onRequireEmail={(mail) => handleRequireEmail(mail)} />}
 
           {activeFlow === 'info' && <InfoFlow />}
           {activeFlow === 'offers' && <OffersFlow vacations={vacations} onRegisterOpen={(offer, vacation) => handleOpenRegister(offer, vacation)} />}
           {/* {activeFlow === 'groupOffers' && <GroupOffersFlow />}
  */}
           <div style={{ marginTop: 24, position: 'fixed', bottom: 12, left: 12, fontSize: 12, color: '#666', lineHeight: 1.2 }}>
             <div style={{ fontWeight: 700 }}>סטטוס משתמש</div>
             <div>{user.name ? 'מוזן: ' + user.name + ' | ' + (user.email || 'אין דוא"ל') : 'לא רשום/ה'}</div>
           </div>
         </div>
 
       </div>
     </div>

      {/* Login Dialog */}
      <Dialog open={showBotDialog} onClose={() => setShowBotDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          צ'אט עם הבוט
          <IconButton aria-label="close" onClick={() => setShowBotDialog(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 320, maxHeight: 420 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', pr: 1, flex: 1 }}>
              {botMessages.map((m, i) => (
                <Box key={i} sx={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', bgcolor: m.role === 'user' ? '#bbdefb' : '#f5f5f5', color: '#000', px: 2, py: 1.25, borderRadius: 3, maxWidth: '82%', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {m.text}
                </Box>
              ))}
              {botLoading && <CircularProgress size={20} sx={{ alignSelf: 'center', mt: 1 }} />}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="הקלד/י הודעה"
            value={botInput}
            onChange={(e) => setBotInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                sendBotMessage()
              }
            }}
          />
          <Button onClick={sendBotMessage} variant="contained" disabled={botLoading || !botInput.trim()}>
            שלח
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showLogin} onClose={() => setShowLogin(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          כניסה / רישום
          <IconButton aria-label="close" onClick={() => setShowLogin(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <LoginFlow onRegister={(n, e) => { handleRegister(n, e); setShowLogin(false); }} onLogout={() => { handleLogout(); setShowLogin(false); }} user={user} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogin(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* Vacations Dialog */}
      <Dialog open={showVacations} onClose={() => setShowVacations(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          הנופשים שלנו
          <IconButton aria-label="close" onClick={() => setShowVacations(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>רשימת נופש מהשרת</Typography>
            {vacationsLoading ? (
              <Typography color="text.secondary">טוען נופשים מהשרת...</Typography>
            ) : vacationsError ? (
              <Typography color="error">שגיאה בטעינת נופשים: {vacationsError}</Typography>
            ) : vacations.length > 0 ? (
              vacations.map((v) => (
                <Paper key={v.VacationID} sx={{ p: 1.5, mb: 1.5 }}>
                  <Typography fontWeight={700}>{v.Program}</Typography>
                  <Typography variant="body2">{v.StartV} - {v.EndV}</Typography>
                  <Typography variant="body2">₪{v.BasicCost}</Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">אין נתוני נופש זמינים כרגע.</Typography>
            )}
          </Box>
          <OffersFlow vacations={vacations} onRegisterOpen={(offer, vacation) => handleOpenRegister(offer, vacation)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVacations(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onClose={() => setShowAbout(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          עלינו
          <IconButton aria-label="close" onClick={() => setShowAbout(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <InfoFlow />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAbout(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* Admin password Dialog */}
      <Dialog open={showAdminDialog} onClose={() => setShowAdminDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          כניסה לממשק מנהלת
          <IconButton aria-label="close" onClick={() => setShowAdminDialog(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField label="סיסמת מנהלת" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
            {adminError && <Alert severity="error">{adminError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdminDialog(false)}>בטל</Button>
    <Button
  variant="contained"
  onClick={handleAdminLogin}
>
  כניסה
</Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onClose={() => setShowRegisterDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6, position: 'relative', textAlign: 'right' }}>
          טופס הרשמה
          <IconButton aria-label="close" onClick={() => setShowRegisterDialog(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="שם"
              value={regName}
              onChange={(e)=> updateRegField('name', e.target.value)}
              onBlur={(e)=> validateFieldOnBlur('name')}
              error={Boolean(regErrors.name)}
              helperText={regErrors.name || ''}
            />
            <TextField
              fullWidth
              label={'דוא"ל'}
              type="email"
              value={regEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegField('email', e.target.value)}
              onBlur={() => validateFieldOnBlur('email')}
              error={Boolean(regErrors.email)}
              helperText={regErrors.email || ''}
            />
            <TextField
              fullWidth
              label="טלפון"
              type="tel"
              inputMode="tel"
              value={regPhone}
              onChange={(e) => updateRegField('phone', e.target.value)}
              onBlur={() => validateFieldOnBlur('phone')}
              error={Boolean(regErrors.phone)}
              helperText={regErrors.phone || ''}
            />
            <TextField
              fullWidth
              label="מספר כרטיס"
              type="tel"
              inputMode="numeric"
              inputProps={{ maxLength: 19 }}
              placeholder="xxxx xxxx xxxx xxxx"
              value={regCardNumber}
              onChange={(e) => updateRegField('cardNumber', e.target.value)}
              onBlur={(e)=> validateFieldOnBlur('cardNumber')}
              error={Boolean(regErrors.cardNumber)}
              helperText={regErrors.cardNumber || ''}
            />
            <TextField
              fullWidth
              label="תוקף"
              inputMode="numeric"
              inputProps={{ maxLength: 5 }}
              placeholder="MM/YY"
              value={regCardExpiry}
              onChange={(e) => updateRegField('cardExpiry', e.target.value)}
              onBlur={() => validateFieldOnBlur('cardExpiry')}
              error={Boolean(regErrors.cardExpiry)}
              helperText={regErrors.cardExpiry || ''}
            />
            <TextField
              fullWidth
              label="CVV"
              type="tel"
              inputMode="numeric"
              inputProps={{ maxLength: 3 }}
              placeholder="123"
              value={regCardCvv}
              onChange={(e) => updateRegField('cardCvv', e.target.value)}
              onBlur={() => validateFieldOnBlur('cardCvv')}
              error={Boolean(regErrors.cardCvv)}
              helperText={regErrors.cardCvv || ''}
            />
            <TextField
              fullWidth
              label="תעודת זהות"
              type="tel"
              inputMode="numeric"
              inputProps={{ maxLength: 9 }}
              value={regIdentity}
              onChange={(e) => updateRegField('identity', e.target.value)}
              onBlur={() => validateFieldOnBlur('identity')}
              error={Boolean(regErrors.identity)}
              helperText={regErrors.identity || ''}
            />
          </Box>
          {registerError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {registerError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegisterDialog(false)}>בטל</Button>
          <Button variant="contained" onClick={() => {
            if (!validateAllFields()) {
              setRegisterError('אנא תקן את השדות המסומנים לפני השליחה')
              return
            }
            submitRegistration({
              name: regName,
              email: regEmail,
              phone: regPhone,
              cardNumber: regCardNumber,
              cardExpiry: regCardExpiry,
              cardCvv: regCardCvv,
              identity: regIdentity,
            })
          }}>סיים רישום</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )

}
async function adminFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token')
  const headers = new Headers(options.headers || {})

  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetchFromApi(url, {
    ...options,
    headers,
  })
}