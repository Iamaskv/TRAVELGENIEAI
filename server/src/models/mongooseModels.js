import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  preferences: {
    defaultCurrency: { type: String, default: 'INR' },
    preferredTravelStyle: { type: String, default: 'budget' },
    dietary: { type: String, default: '' },
  },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const TripSchema = new Schema({
  userId: { type: String, required: true, index: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  durationDays: { type: Number, required: true },
  travelers: { type: Number, required: true },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  isRoundTrip: { type: Boolean, default: true },
  totalBudget: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  preferences: { type: Schema.Types.Mixed, default: {} },
  selectedOutbound: { type: Schema.Types.Mixed },
  selectedReturn: { type: Schema.Types.Mixed },
  selectedAccommodation: { type: Schema.Types.Mixed },
  itinerary: { type: Schema.Types.Mixed },
  budgetBreakdown: { type: Schema.Types.Mixed },
  status: { type: String, default: 'saved' },
}, {
  timestamps: true,
});

export const TripModel = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
