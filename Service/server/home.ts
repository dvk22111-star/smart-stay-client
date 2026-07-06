import { Vacation } from '../../Models/vacations'

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

const API_BASES = ['http://127.0.0.1:8000', 'http://localhost:8000']

async function fetchJson<T>(path: string, retries = 3): Promise<T> {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    for (const base of API_BASES) {
      try {
        console.log(`[Fetch Attempt ${attempt}] Trying: ${base}${path}`)
        const res = await fetch(`${base}${path}`, {
          headers: { Accept: 'application/json' },
        })

        if (res.ok) {
          console.log(`[Success] Got response from: ${base}${path}`)
          return (await res.json()) as T
        }

        console.warn(`[Failed] HTTP ${res.status} from ${base}${path}`)
        lastError = new Error(`HTTP ${res.status} from ${base}${path}`)
      } catch (error) {
        console.error(`[Error] Failed to fetch from ${base}${path}:`, error)
        lastError = error
      }
    }

    if (attempt < retries) {
      console.log(`[Retry] Waiting before retry ${attempt + 1}...`)
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }

  const errorMsg = lastError instanceof Error ? lastError.message : 'שגיאה בטעינת נתונים מהשרת'
  console.error('[Final Error]', errorMsg)
  throw lastError instanceof Error ? lastError : new Error(errorMsg)
}

export async function list_offers(): Promise<Offer[]> {
  return fetchJson<Offer[]>('/offers')
}

export async function get_vacation_info(): Promise<VacationInfo> {
  return fetchJson<VacationInfo>('/vacation_info')
}

export async function getVacations(): Promise<Vacation[]> {
  return fetchJson<Vacation[]>('/vacations')
}
