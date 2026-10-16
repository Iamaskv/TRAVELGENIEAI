// Type declarations for TravelGenie AI Server

export interface IUser {
  id?: string;
  name?: string;
  email: string;
  password?: string;
}

export interface ITrip {
  id?: string;
  userId?: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: number;
  totalBudget: number;
  currency?: string;
  status?: string;
}
