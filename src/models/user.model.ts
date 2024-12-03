import { FlightModel } from "./flight.model"

export interface UserModel {
    email: string
    password: string
    flights: {
        id: number
        model: FlightModel | null
        status: 'reserved' | 'paid' | 'canceled'
        rating: number
    }[]
}