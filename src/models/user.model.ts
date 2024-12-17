export interface UserModel {
    email: string
    password: string
    flights: {
        id: number
        status: 'reserved' | 'paid' | 'canceled'
        rating: number | null
    }[]
}