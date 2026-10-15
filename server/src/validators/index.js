import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferences: z.object({
    defaultCurrency: z.string().optional(),
    preferredTravelStyle: z.enum(['budget', 'balanced', 'comfort', 'luxury']).optional(),
    dietary: z.string().optional(),
  }).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const PlanTripSchema = z.object({
  origin: z.string().min(2, 'Starting city/location is required'),
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  adults: z.number().int().min(1, 'At least 1 adult traveler is required'),
  children: z.number().int().min(0).default(0),
  isRoundTrip: z.boolean().default(true),
  totalBudget: z.number().positive('Total budget must be a positive number'),
  currency: z.string().default('INR'),
  preferences: z.object({
    travelStyle: z.enum(['budget', 'balanced', 'comfort', 'luxury']).default('budget'),
    transportStrategy: z.enum(['cheapest', 'fastest', 'balanced', 'comfort']).default('balanced'),
    interests: z.array(z.string()).min(1, 'Select at least one travel interest'),
    accommodationType: z.enum(['hostel', 'budget_hotel', 'homestay', 'standard_hotel', 'guesthouse', 'flexible']).default('budget_hotel'),
    foodPreference: z.string().optional(),
    travelPace: z.enum(['relaxed', 'moderate', 'fast']).default('moderate'),
    preferredTransportModes: z.array(z.enum(['train', 'bus', 'flight', 'connecting'])).optional(),
    maxJourneyHours: z.number().optional(),
    acceptsTransfers: z.boolean().default(true),
    overnightAllowed: z.boolean().default(true),
    reservePercentage: z.number().min(0).max(50).default(10),
    accessibilityNeeds: z.string().optional(),
  }),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const TransportSearchSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  travelers: z.number().int().min(1).default(1),
  direction: z.enum(['outbound', 'return']).default('outbound'),
  strategy: z.enum(['cheapest', 'fastest', 'balanced', 'comfort']).default('balanced'),
  preferredModes: z.array(z.enum(['train', 'bus', 'flight', 'connecting'])).optional(),
});

export const AccommodationSearchSchema = z.object({
  destination: z.string().min(2),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  travelers: z.number().int().min(1).default(1),
  accommodationType: z.enum(['hostel', 'budget_hotel', 'homestay', 'standard_hotel', 'guesthouse', 'flexible']).default('flexible'),
  maxNightlyRate: z.number().optional(),
  minRating: z.number().min(0).max(5).optional(),
});

export const BudgetCalculateSchema = z.object({
  totalBudget: z.number().positive(),
  currency: z.string().default('INR'),
  durationDays: z.number().int().positive(),
  travelers: z.number().int().positive(),
  travelStyle: z.enum(['budget', 'balanced', 'comfort', 'luxury']).default('budget'),
  outboundFare: z.number().default(0),
  returnFare: z.number().default(0),
  accommodationTotal: z.number().default(0),
  reservePercentage: z.number().min(0).max(50).default(10),
  destination: z.string().default(''),
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  tripContext: z.record(z.string(), z.any()),
});
