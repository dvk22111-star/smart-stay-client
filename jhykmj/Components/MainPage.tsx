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
} from '@mui/material'
import { styled } from '@mui/system'
import LoginIcon from '@mui/icons-material/Login'
import SendIcon from '@mui/icons-material/Send'
import InfoIcon from '@mui/icons-material/Info'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import GroupIcon from '@mui/icons-material/Group'
import LogoutIcon from '@mui/icons-material/Logout'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../Style/mainS'
import { isValidEmail, normalizeEmail } from './validation'
import Brizza from '../Components/brizza'

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
 
type ActiveFlow = 'login' | 'sendItinerary' | 'info' | 'offers' | 'groupOffers' | null

type User = { name: string | null; email: string | null }

interface LoginFlowProps {
  onRegister: (name: string, email: string) => void
  onLogout: () => void
  user: User
}
function Page() {
  return <div className="page"></div>;
}

const LoginFlow: React.FC<LoginFlowProps> = ({ onRegister, onLogout, user }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'join'>('login')
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [groupCode, setGroupCode] = useState<string>('')

  function handleRegisterSubmit() {
    if (!name) return alert('אנא הזיני שם')
    if (!email) return alert('אנא הזיני דוא"ל')
    const mail = normalizeEmail(email)
    if (!isValidEmail(mail)) return alert('כתובת דוא"ל לא תקינה')
    onRegister(name, mail)
  }

  function handleLogin() {
    if (!name) return alert('אנא הזיני שם')
    const mail = email ? normalizeEmail(email) : ''
    if (mail && !isValidEmail(mail)) return alert('כתובת דוא"ל לא תקינה')
    onRegister(name, mail || '')
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
        רישום / כניסה / הצטרפות
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant={mode === 'login' ? 'contained' : 'outlined'} onClick={() => setMode('login')}>
          כניסה
        </Button>
        <Button variant={mode === 'register' ? 'contained' : 'outlined'} onClick={() => setMode('register')}>
          רישום
        </Button>
        <Button variant={mode === 'join' ? 'contained' : 'outlined'} onClick={() => setMode('join')}>
          הצטרפות
        </Button>
      </Stack>

      {mode === 'login' && (
        <Box component="form" noValidate sx={{ display: 'grid', gap: 1 }}>
          <TextField label="שם" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="דואל (אופציונלי)" value={email} onChange={(e) => setEmail(e.target.value)} />
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
      } catch (e) {
        if (!mounted) return
        setError('שגיאה בטעינת מידע הנופש')
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
      <Typography>תאריכים: {info?.dates?.join(' - ')}</Typography>
      <Typography>מיקום: {info?.location || 'לא זמין'}</Typography>
      {info?.notes && <Typography>{info.notes}</Typography>}
    </Paper>
  )
}
 
const OffersFlow: React.FC = () => {
  const [offers, setOffers] = useState<Offer[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await list_offers()
        if (!mounted) return
        setOffers(data)
      } catch (e) {
        if (!mounted) return
        setError('שגיאה בטעינת הצעות')
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

  if (loading) return <div className="panel">טוען הצעות...</div>
  if (error) return <div className="panel">{error}</div>
  if (!offers || offers.length === 0) return <div className="panel">אין הצעות זמינות כרגע</div>

  return (
    <div className="panel">
      <h3>הצעות מחיר</h3>
      <ul>
        {offers.map((o) => (
          <li key={o.id}>
            <strong>{o.title}</strong> — ₪{o.price}
            {o.description && <div>{o.description}</div>}
          </li>
        ))}
      </ul>
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
 
  function handleRegister(name: string, email: string): void {
    setUser({ name, email })
    alert('נרשמת בהצלחה כ: ' + name)
  }

  function handleLogout(): void {
    setUser({ name: null, email: null })
    alert('התנתקת')
  }

  function handleRequireEmail(mail: string): void {
    alert('התוכניה נשלחה ל: ' + mail)
  }
 
  // הוראות Live Share קצרות + כפתור העתקה ללוח
  const liveShareSteps = [
    '1) התקן VS Code ו־Live Share extension (by Microsoft).',
    '2) פתח את התיקייה: h:\\בן חמו\\ליבי\\ReactProject',
    '3) בחר Live Share → Start collaboration session (התחבר/י עם חשבון).',
    '4) העתק/י את הקישור שנוצר ושלח/י למשתף/ת.',
    '5) במידת הצורך אפשר לשתף פורט/טרמינל דרך ה‑Live Share controls.'
  ]

  const copyLiveShare = async () => {
    const text = liveShareSteps.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      alert('ההוראות הועתקו ללוח')
    } catch {
      alert('לא ניתן להעתיק אוטומטית — העתק/י ידנית מהתיבה.')
    }
  }
 
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
       <div className="nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, fontWeight: 600 }}>נופש חכם - רישום ושיבוץ</div>
        <Button startIcon={<LoginIcon />} sx={navButtonSx as any} onClick={() => setActiveFlow('login')}>Log In / רישום</Button>
        <Button startIcon={<SendIcon />} sx={navButtonSx as any} onClick={() => setActiveFlow('sendItinerary')}>שליחת תוכניה</Button>
        <Button startIcon={<InfoIcon />} sx={navButtonSx as any} onClick={() => setActiveFlow('info')}>מידע על הנופש</Button>
        <Button startIcon={<LocalOfferIcon />} sx={navButtonSx as any} onClick={() => setActiveFlow('offers')}>הצעות מחיר</Button>
        {/* <Button startIcon={<GroupIcon />} sx={navButtonSx as any} onClick={() => setActiveFlow('groupOffers')}>הצעות לקבוצות</Button> */}
        {user.name && (
          <Button variant="outlined" color="secondary" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ ml: 1 }}>
            Log Out
          </Button>
        )}
       </div>
 
       <div className="container">
         <div className="left">
           {activeFlow === null && (
             <div className="panel">
               <h2>ברוכים הבאים לנופש החכם</h2>
               <p className="small">לחצו על כפתור בניווט לשיחה עם הבוט על מנת לבצע רישום, לשלוח תוכניה או לקבל הצעת מחיר.</p>
             </div>
           )}
 
          {activeFlow === 'login' && <LoginFlow onRegister={handleRegister} onLogout={handleLogout} user={user} />}
 
          {activeFlow === 'sendItinerary' && <SendItineraryFlow user={user} onRequireEmail={(mail) => handleRequireEmail(mail)} />}
 
           {activeFlow === 'info' && <InfoFlow />}
           {activeFlow === 'offers' && <OffersFlow />}
           {/* {activeFlow === 'groupOffers' && <GroupOffersFlow />}
  */}
           <div className="info-box panel">
             <h4>סטטוס משתמש</h4>
            <div>{user.name ? 'מוזן: ' + user.name + ' | ' + (user.email || 'אין דוא"ל') : 'לא רשום/ה'}</div>
           </div>
         </div>
 
        <div style={{ width: 360 }}>
          <div className="panel">
            <h4>שיתוף Live Share</h4>
            <p className="small">הוראות מהירות לשיתוף סביבת העבודה שלך עם משתף/ת:</p>
            <Box component="pre" sx={{ background: '#f5f5f5', p: 1, borderRadius: 1, overflowX: 'auto' }}>
              {liveShareSteps.join('\n')}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button variant="contained" size="small" startIcon={<ContentCopyIcon />} sx={primaryButtonSx} onClick={copyLiveShare}>העתק הוראות</Button>
                <Button variant="outlined" size="small" startIcon={<HelpOutlineIcon />} sx={{ color: 'primary.main', borderColor: 'primary.main' }} onClick={() => alert('הוראות: התקן Live Share, התחבר, Start session, העתק קישור וספק למשתף.')}>מה זה?</Button>
            </Box>
            <p className="small" style={{ marginTop: 8 }}>שימי לב: אל תשתפי קבצי סוד או מפתחות דרך הסשן.</p>
          </div>
         </div>
       </div>
     </div>
    </ThemeProvider>
  )
}