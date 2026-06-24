import { list_offers, Offer, get_vacation_info, VacationInfo } from '../Service/server/home'
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

const brochurePdfUrl = '/brochure.pdf'
import LoginIcon from '@mui/icons-material/Login'
import InfoIcon from '@mui/icons-material/Info'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import LogoutIcon from '@mui/icons-material/Logout'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CloseIcon from '@mui/icons-material/Close'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../Style/mainS'
import { isValidEmail, normalizeEmail } from './validation'
// Brizza component not used in this file

const navButtonSx = {
  mr: 1,
  bgcolor: 'primary.main',
  background: 'linear-gradient(135deg, #4FC3F7 0%, #2EBFF4 100%)',
  color: 'white',
  textTransform: 'none',
  borderRadius: 2,
  boxShadow: '0 6px 18px rgba(79,195,247,0.18)',
  '&:hover': {
    boxShadow: '0 8px 20px rgba(79,195,247,0.28)',
    transform: 'translateY(-2px)',
    background: 'linear-gradient(135deg, #59CFF9 0%, #39C0F6 100%)',
  },
}

const primaryButtonSx = {
  background: 'linear-gradient(135deg, #4FC3F7 0%, #2EBFF4 100%)',
  color: 'white',
  '&:hover': { background: 'linear-gradient(135deg, #59CFF9 0%, #39C0F6 100%)' },
}

const ADMIN_PASSWORD = 'manager123'

type Registrant = {
  id: string
  name: string
  email: string
  phone: string
  paid: string
  publication: string
  offer: string
}

type Placement = {
  id: string
  participant: string
  room: string
  date: string
  notes: string
}

const MOCK_REGISTRATIONS: Registrant[] = [
  { id: '1', name: 'ציפי כהן', email: 'tzippi@example.com', phone: '052-9991112', paid: '₪1,750', publication: 'פייסבוק', offer: 'נופש באילת' },
  { id: '2', name: 'רונית לוי', email: 'ronit@example.com', phone: '050-1234567', paid: '₪1,850', publication: 'אינסטגרם', offer: 'נופש בים המלח' },
  { id: '3', name: 'שרית ברק', email: 'sarit@example.com', phone: '054-7654321', paid: '₪1,950', publication: 'מייל', offer: 'נופש בחיפה' },
]

const MOCK_PLACEMENTS: Placement[] = [
  { id: 'p1', participant: 'ציפי כהן', room: 'חדר 101', date: '12-15 ביולי', notes: 'עדיפות חלון' },
  { id: 'p2', participant: 'רונית לוי', room: 'חדר 202', date: '13-16 ביולי', notes: 'קבוצה A' },
  { id: 'p3', participant: 'שרית ברק', room: 'חדר 303', date: '12-14 ביולי', notes: 'מבוקש חדר זוגי' },
]
 
type ActiveFlow = 'login' | 'sendItinerary' | 'info' | 'offers' | 'groupOffers' | null

type User = { id?: string | number | null; name: string | null; email: string | null }

interface LoginFlowProps {
  onRegister: (name: string, email: string) => Promise<void> | void
  onLogout: () => void
  user: User
}
const LoginFlow: React.FC<LoginFlowProps> = ({ onRegister, onLogout, user }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'join'>('login')
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
          רישום / כניסה      ת
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
     <div className="panel">
       <h3>שליחת תוכניה</h3>
       <p>לחצי לשליחת התוכניה. אם את רשומה - תשלח אוטומטית, אחרת תתבקשו להכניס דואר.</p>
      <div style={{ marginTop: 8 }}>
        <Button variant="contained" sx={primaryButtonSx} onClick={send}>שלח תוכניה</Button>
      </div>
     </div>
   )
 }
 
const MOCK_VACATION_INFO: VacationInfo = {
  dates: ['10/07/2026', '16/07/2026'],
  location: 'מלון הדגמה בראשון לציון',
  notes: 'זהו מידע לדוגמה המוצג כאשר השרת לא זמין.',
}

const InfoFlow: React.FC = () => {
  const [info, setInfo] = useState<VacationInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showMockWarning, setShowMockWarning] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await get_vacation_info()
        if (!mounted) return
        setInfo(res)
      } catch (e) {
        if (!mounted) return
        setInfo(MOCK_VACATION_INFO)
        setShowMockWarning(true)
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
      {showMockWarning && (
        <Typography color="warning.main" sx={{ mb: 1 }}>
          השרת לא זמין כרגע, מוצג מידע דוגמה.
        </Typography>
      )}
      <Typography>תאריכים: {info?.dates?.join(' - ')}</Typography>
      <Typography>מיקום: {info?.location || 'לא זמין'}</Typography>
      {info?.notes && <Typography>{info.notes}</Typography>}
    </Paper>
  )
}
const MOCK_OFFERS: Offer[] = [
  {
    id: 'mock-1',
    title: 'חבילת חוף דוגמא',
    location: 'מלון אל מול הים',
    date: '21/07/2026 - 27/07/2026',
    description: 'חופשה מרגיעה עם ארוחת בוקר ושימוש בחדר כושר ובריכה.',
    price: 2699,
    kashrut: 'כשר למהדרין',
    image: '/assets/mock-vacation.jpg',
    brochure: '/assets/תוכניה.pdf',
  },
  {
    id: 'mock-2',
    title: 'חבילת ספא דוגמא',
    location: 'מלון ספא יוקרה',
    date: '01/08/2026 - 05/08/2026',
    description: 'חופשה מושלמת עם טיפולי ספא זוגיים וחוף פרטי.',
    price: 3199,
    kashrut: 'כשר',
    image: '/assets/mock-vacation-2.jpg',
    brochure: '/assets/blank.pdf',
  },
]

const OffersFlow: React.FC<{ onRegisterOpen?: (offer: Offer) => void }> = ({ onRegisterOpen }) => {
  const [offers, setOffers] = useState<Offer[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showMockWarning, setShowMockWarning] = useState<boolean>(false)
  const [openBrochureUrl, setOpenBrochureUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await list_offers()
        if (!mounted) return
        setOffers(data)
      } catch (e) {
        if (!mounted) return
        setOffers(MOCK_OFFERS)
        setShowMockWarning(true)
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

  const openBrochure = (offer: Offer) => {
    const url = brochurePdfUrl
    setOpenBrochureUrl(url)
  }

  const closeBrochure = () => {
    setOpenBrochureUrl(null)
  }

  if (loading) return <div className="panel">טוען הצעות...</div>
  if (error) return <div className="panel">{error}</div>
  if (!offers || offers.length === 0) return <div className="panel">אין הצעות זמינות כרגע</div>

  return (
    <div>
      {showMockWarning && (
        <Typography sx={{ mb: 2, color: '#ffd54f' }}>
          השרת לא זמין כרגע, מציג הצעות דוגמה.
        </Typography>
      )}
      <div className="offers-grid">
        {offers.map((o) => (
          <div className="w3-card-4 w3-dark-grey offer-card" key={o.id}>
            <div className="w3-container w3-center">
              <h3>{o.title}</h3>
              {o.image && <img src={o.image} alt={o.title} />}
              <p>הנופש יתקיים בתאריך: <strong>{o.date}</strong></p>
              <p>הנופש יתקיים במלון: <strong>{o.location}</strong></p>
              <p>כשרות: <strong>{o.kashrut || 'לא צוינה'}</strong></p>
              <p>מחיר כרטיסיה: <strong>₪{o.price}</strong></p>
              <div className="offer-actions">
                <Button size="small" variant="contained" className="w3-button w3-green" onClick={() => openBrochure(o)}>
                  לצפיה בתוכניה
                </Button>
                <Button size="small" variant="contained" className="w3-button w3-light-blue" onClick={() => onRegisterOpen && onRegisterOpen(o)}>
                  לרישום לנופש
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={Boolean(openBrochureUrl)} onClose={closeBrochure} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pr: 4 }}>
          תוכניה
          <IconButton aria-label="close" onClick={closeBrochure} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
    </div>
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
  const [registerOffer, setRegisterOffer] = useState<Offer | null>(null)
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
  const [adminPassword, setAdminPassword] = useState<string>('')
  const [adminError, setAdminError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPage, setAdminPage] = useState<'welcome' | 'registrants' | 'placements' | 'delete'>('welcome')
  const [registrations, setRegistrations] = useState<Registrant[]>(MOCK_REGISTRATIONS)
  const [placements, setPlacements] = useState<Placement[]>(MOCK_PLACEMENTS)
 
  async function handleRegister(name: string, email: string): Promise<void> {
    try {
      const payload: any = { name }
      if (email) payload.email = email
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
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

  function handleLogout(): void {
    setUser({ name: null, email: null })
    alert('התנתקת')
  }

  function handleRequireEmail(mail: string): void {
    alert('התוכניה נשלחה ל: ' + mail)
  }

  function handleOpenRegister(offer: Offer) {
    setRegisterOffer(offer)
    setRegName(user.name || '')
    setRegEmail(user.email || '')
    setRegPhone('')
    setRegCardNumber('')
    setRegCardExpiry('')
    setRegCardCvv('')
    setRegIdentity('')
    setRegErrors({})
    setRegisterError(null)
    setShowRegisterDialog(true)
  }

  function validateField(field: string, value: string): string | null {
    const trimmed = value.trim()
    switch (field) {
      case 'name':
        return trimmed ? null : 'אנא הזן שם מלא'
      case 'email': {
        const normalized = normalizeEmail(value || '')
        return normalized && isValidEmail(normalized) ? null : 'אנא הזן דוא"ל תקין'
      }
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
      const payload: any = {
        userId: user?.id,
        email: normalizeEmail(data.email || ''),
        phone: data.phone,
        offerId: registerOffer?.id,
        cardNumber: data.cardNumber,
        cardExpiry: data.cardExpiry,
        cardCvv: data.cardCvv,
        identity: data.identity,
      }
      // Do NOT send raw card data to demo endpoint; in production use secure PCI flow
      const res = await fetch('http://127.0.0.1:8000/itinerary/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('שגיאה בשליחת הרשמה')
      const reply = await res.json()
      console.log('itinerary reply', reply)
      alert('הרשמתך נקלטה. סטטוס: ' + (reply.status || 'OK'))
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
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h4" sx={{ mb: 2, color: 'white', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>מנהלת יקרה שלום וברכה</Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                <Button variant="contained" onClick={() => setAdminPage('registrants')}>הצג נרשמות</Button>
                <Button variant="contained" onClick={() => setAdminPage('placements')}>טבלת שיבוצים</Button>
                <Button variant="contained" color="error" onClick={() => setAdminPage('delete')}>מחק נרשם</Button>
                <Button variant="outlined" onClick={() => { setIsAdmin(false); setAdminPage('welcome') }}>יציאה מממשק מנהלת</Button>
              </Stack>

              <Box sx={{ mt: 4 }}>
                {adminPage === 'registrants' && (
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>שם</TableCell>
                          <TableCell>טלפון</TableCell>
                          <TableCell>דוא"ל</TableCell>
                          <TableCell>כמה שילמה</TableCell>
                          <TableCell>פרסום</TableCell>
                          <TableCell>הצעה</TableCell>
                          <TableCell>פעולות</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registrations.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>{r.phone}</TableCell>
                            <TableCell>{r.email}</TableCell>
                            <TableCell>{r.paid}</TableCell>
                            <TableCell>{r.publication}</TableCell>
                            <TableCell>{r.offer}</TableCell>
                            <TableCell>
                              <Button size="small" color="error" onClick={() => setRegistrations((prev) => prev.filter((x) => x.id !== r.id))}>מחק</Button>
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
                          <TableCell>משתתפת</TableCell>
                          <TableCell>חדר</TableCell>
                          <TableCell>תאריכים</TableCell>
                          <TableCell>הערות</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {placements.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.participant}</TableCell>
                            <TableCell>{p.room}</TableCell>
                            <TableCell>{p.date}</TableCell>
                            <TableCell>{p.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {adminPage === 'delete' && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <TextField select value="" SelectProps={{ native: true }} label="בחר נרשמת למחיקה" sx={{ minWidth: 260 }} onChange={(e) => setRegistrations((prev) => prev.filter((x) => x.id !== e.target.value))}>
                      <option value="">-- בחרי --</option>
                      {registrations.map((r) => (
                        <option key={r.id} value={r.id}>{r.name} | {r.phone}</option>
                      ))}
                    </TextField>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <div className="btn-group" style={{ display: 'flex', flexWrap: 'wrap', gap: 0, width: '100%', alignItems: 'center', marginTop: 4, justifyContent: 'flex-start', paddingLeft: 24 }}>
              <Button className="button" startIcon={<LoginIcon />} sx={{ ...navButtonSx as any, padding: '8px 12px', fontSize: 12 }} onClick={() => setShowLogin(true)}>כניסה / רישום</Button>
              <Button className="button" startIcon={<LocalOfferIcon />} sx={{ ...navButtonSx as any, padding: '8px 12px', fontSize: 12 }} onClick={() => setShowVacations(true)}>הנופשים שלנו</Button>
              <Button className="button" startIcon={<InfoIcon />} sx={{ ...navButtonSx as any, padding: '8px 12px', fontSize: 12 }} onClick={() => window.open('/about.html', '_blank')}>עלינו</Button>
              <Button startIcon={
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
                  } className="button" sx={{ ...navButtonSx as any, padding: '8px 12px', fontSize: 12 }} onClick={() => setActiveFlow('login')}>שיחה עם הבוט</Button>
              <Button className="button" startIcon={<InfoIcon />} sx={{ ...navButtonSx as any, padding: '8px 12px', fontSize: 12, ml: 1 }} onClick={() => setShowAdminDialog(true)}>
                תפריט ניהול
              </Button>
              {user.name && (
                <Button className="button" variant="outlined" color="secondary" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ padding: '8px 12px', fontSize: 12 }}>
                  התנתק/י
                </Button>
              )}
            </div>
          )}
          {activeFlow === 'sendItinerary' && <SendItineraryFlow user={user} onRequireEmail={(mail) => handleRequireEmail(mail)} />}
 
           {activeFlow === 'info' && <InfoFlow />}
           {activeFlow === 'offers' && <OffersFlow />}
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
      <Dialog open={showLogin} onClose={() => setShowLogin(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 4 }}>
          כניסה / רישום
          <IconButton aria-label="close" onClick={() => setShowLogin(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
        <DialogTitle sx={{ pr: 4 }}>
          הנופשים שלנו
          <IconButton aria-label="close" onClick={() => setShowVacations(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <OffersFlow onRegisterOpen={(o) => handleOpenRegister(o)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVacations(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onClose={() => setShowAbout(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 4 }}>
          עלינו
          <IconButton aria-label="close" onClick={() => setShowAbout(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
        <DialogTitle sx={{ pr: 4 }}>
          כניסה לממשק מנהלת
          <IconButton aria-label="close" onClick={() => setShowAdminDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
          <Button variant="contained" onClick={() => {
            if (adminPassword === ADMIN_PASSWORD) {
              setAdminError(null)
              setIsAdmin(true)
              setShowAdminDialog(false)
              setAdminPassword('')
              setAdminPage('welcome')
            } else {
              setAdminError('סיסמה לא נכונה')
            }
          }}>כניסה</Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onClose={() => setShowRegisterDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 4 }}>
          טופס הרשמה
          <IconButton aria-label="close" onClick={() => setShowRegisterDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="שם"
              value={regName}
              onChange={(e) => updateRegField('name', e.target.value)}
              onBlur={() => validateFieldOnBlur('name')}
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
              onBlur={() => validateFieldOnBlur('cardNumber')}
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