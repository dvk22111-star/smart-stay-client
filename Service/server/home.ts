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
        const res = await fetch(`${base}${path}`, {
          headers: { Accept: 'application/json' },
        })

        if (res.ok) {
          return (await res.json()) as T
        }

        lastError = new Error(`HTTP ${res.status}`)
      } catch (error) {
        lastError = error
      }
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('שגיאה בטעינת נתונים מהשרת')
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
