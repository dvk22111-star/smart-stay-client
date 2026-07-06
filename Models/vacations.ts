// Vacation model that accepts both legacy server shape and the newer shape.
export interface Vacation {
    // New shape (preferred)
    // vacationID?: number
    // destination?: string
    // startDate?: string
    // endDate?: string
    // price?: number

    // Legacy shape (kept for compatibility)
    VacationID?: number
    HotelID?: number
    StartV?: string
    EndV?: string
    Program?: string
    BasicCost?: number
    NumberOfRooms?: number
    NumberOfFloors?: number
}