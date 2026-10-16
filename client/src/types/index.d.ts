export interface ITripPlan {
  id?: string;
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  travelers?: number;
  totalBudget?: number;
  currency?: string;
  outboundTransport?: any;
  returnTransport?: any;
  accommodation?: any;
  budgetBreakdown?: any;
  itinerary?: any;
  [key: string]: any;
}

export interface IChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  suggestedAction?: any;
  metadata?: any;
}

export interface IUser {
  id?: string;
  email?: string;
  name?: string;
}

export interface ITripInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers?: number;
  totalBudget?: number;
  [key: string]: any;
}

export interface ITransportOption {
  [key: string]: any;
}

export interface IAccommodationOption {
  [key: string]: any;
}

export interface IBudgetBreakdown {
  [key: string]: any;
}

export interface IItineraryDay {
  [key: string]: any;
}

export const TRANSPORT_MODES: string[];
export const DIRECTION_TYPES: string[];
export const ACCOMMODATION_TYPES: string[];
export const TRAVEL_STYLES: string[];
export const STRATEGY_TYPES: string[];
