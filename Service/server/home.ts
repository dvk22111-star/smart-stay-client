export interface Offer {
  id: string
  title: string
  location: string
  date: string
  description: string
  price: number
  kashrut?: string
  image?: string
  brochure?: string
}

export interface VacationInfo {
  dates?: string[]
  location?: string
  notes?: string
}

const API_BASE = 'http://127.0.0.1:8000'

export async function list_offers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/offers`)
  if (!res.ok) {
    throw new Error('שגיאה בטעינת הצעות מהשרת')
  }
  return res.json()
}

export async function get_vacation_info(): Promise<VacationInfo> {
  const res = await fetch(`${API_BASE}/vacation_info`)
  if (!res.ok) {
    throw new Error('שגיאה בטעינת מידע נופש מהשרת')
  }
  return res.json()
}
