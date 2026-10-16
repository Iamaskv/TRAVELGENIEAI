// TravelGenie AI - Types and Constants (JavaScript)

export const TRANSPORT_MODES = ['train', 'bus', 'flight', 'connecting'];
export const DIRECTION_TYPES = ['outbound', 'return'];
export const ACCOMMODATION_TYPES = ['hostel', 'budget_hotel', 'homestay', 'standard_hotel', 'guesthouse', 'flexible'];
export const TRAVEL_STYLES = ['budget', 'balanced', 'comfort', 'luxury'];
export const STRATEGY_TYPES = ['cheapest', 'fastest', 'balanced', 'comfort'];

// Compatibility exports for any lingering TypeScript imports
export const ITripPlan = {};
export const IChatMessage = {};
export const IUser = {};
export const ITripInput = {};
export const ITransportOption = {};
export const IAccommodationOption = {};
export const IBudgetBreakdown = {};
export const IItineraryDay = {};

export default {
  TRANSPORT_MODES,
  DIRECTION_TYPES,
  ACCOMMODATION_TYPES,
  TRAVEL_STYLES,
  STRATEGY_TYPES,
};
