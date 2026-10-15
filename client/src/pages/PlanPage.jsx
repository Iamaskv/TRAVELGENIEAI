import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import {
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Train,
  Plane,
  AlertCircle,
  Zap,
  Compass,
} from 'lucide-react';

const formSchema = z.object({
  origin: z.string().min(2, 'Starting location is required'),
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().min(1, 'Departure date is required'),
  endDate: z.string().min(1, 'Return date is required'),
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0).default(0),
  isRoundTrip: z.boolean().default(true),
  totalBudget: z.number().positive('Please enter a budget greater than 0'),
  currency: z.string().default('INR'),
  travelStyle: z.enum(['budget', 'balanced', 'comfort', 'luxury']).default('budget'),
  accommodationType: z.enum(['hostel', 'budget_hotel', 'homestay', 'standard_hotel', 'guesthouse', 'flexible']).default('budget_hotel'),
  foodPreference: z.string().optional(),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  travelPace: z.enum(['relaxed', 'moderate', 'fast']).default('moderate'),
  accessibilityNeeds: z.string().optional(),
  transportStrategy: z.enum(['cheapest', 'fastest', 'balanced', 'comfort']).default('balanced'),
  preferredTransportModes: z.array(z.enum(['train', 'bus', 'flight', 'connecting'])).default(['train', 'flight', 'bus', 'connecting']),
  maxJourneyHours: z.number().optional(),
  acceptsTransfers: z.boolean().default(true),
  overnightAllowed: z.boolean().default(true),
  reservePercentage: z.number().min(0).max(30).default(10),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'Return date must be on or after departure date',
  path: ['endDate'],
});

export const PlanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStage, setPlanningStage] = useState('');
  const [apiError, setApiError] = useState(null);

  // Default dates: next week
  const today = new Date();
  const defaultStart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultEnd = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: searchParams.get('origin') || 'Bhubaneswar',
      destination: searchParams.get('destination') || 'Goa',
      startDate: defaultStart,
      endDate: defaultEnd,
      adults: 1,
      children: 0,
      isRoundTrip: true,
      totalBudget: 15000,
      currency: 'INR',
      travelStyle: 'budget',
      accommodationType: 'budget_hotel',
      foodPreference: 'Authentic local seafood and thalis',
      interests: ['Beaches', 'Sightseeing', 'Food and Culture'],
      travelPace: 'moderate',
      accessibilityNeeds: '',
      transportStrategy: 'balanced',
      preferredTransportModes: ['train', 'flight', 'bus', 'connecting'],
      acceptsTransfers: true,
      overnightAllowed: true,
      reservePercentage: 10,
    },
  });

  const formValues = watch();

  // Preset button handler
  const loadPreset = (preset) => {
    setValue('origin', preset.origin);
    setValue('destination', preset.dest);
    setValue('totalBudget', preset.budget);
    setValue('travelStyle', preset.style);
    setValue('accommodationType', preset.acc);
    setValue('interests', preset.interests);

    const s = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    const e = new Date(s.getTime() + (preset.days - 1) * 24 * 60 * 60 * 1000);
    setValue('startDate', s.toISOString().split('T')[0]);
    setValue('endDate', e.toISOString().split('T')[0]);
  };

  const handleInterestToggle = (interest) => {
    const current = formValues.interests || [];
    if (current.includes(interest)) {
      if (current.length > 1) {
        setValue('interests', current.filter((i) => i !== interest));
      }
    } else {
      setValue('interests', [...current, interest]);
    }
  };

  const handleModeToggle = (mode) => {
    const current = formValues.preferredTransportModes || [];
    if (current.includes(mode)) {
      if (current.length > 1) {
        setValue('preferredTransportModes', current.filter((m) => m !== mode));
      }
    } else {
      setValue('preferredTransportModes', [...current, mode]);
    }
  };

  const onNextStep = async () => {
    setApiError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const onPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setIsPlanning(true);
    setApiError(null);

    try {
      setPlanningStage('Searching and comparing outbound trains, buses, and flights...');
      await new Promise((r) => setTimeout(r, 600));

      setPlanningStage('Analyzing return journey schedules independently...');
      await new Promise((r) => setTimeout(r, 600));

      setPlanningStage('Finding verified affordable stays and checking nightly tariffs...');
      await new Promise((r) => setTimeout(r, 600));

      setPlanningStage('Calculating complete deterministic budget and reserves...');
      await new Promise((r) => setTimeout(r, 600));

      setPlanningStage('Gemini AI generating personalized day-by-day itinerary...');

      const planResult = await api.planTrip({
        origin: data.origin,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        adults: data.adults,
        children: data.children,
        isRoundTrip: data.isRoundTrip,
        totalBudget: data.totalBudget,
        currency: data.currency,
        preferences: {
          travelStyle: data.travelStyle,
          transportStrategy: data.transportStrategy,
          interests: data.interests,
          accommodationType: data.accommodationType,
          foodPreference: data.foodPreference,
          travelPace: data.travelPace,
          preferredTransportModes: data.preferredTransportModes,
          acceptsTransfers: data.acceptsTransfers,
          overnightAllowed: data.overnightAllowed,
          reservePercentage: data.reservePercentage,
          accessibilityNeeds: data.accessibilityNeeds,
        },
      });

      // Store current plan in session for instant dashboard access
      sessionStorage.setItem('current_travel_plan', JSON.stringify(planResult));

      navigate('/trip/current');
    } catch (err) {
      console.error('Plan trip error:', err);
      setApiError(err.response?.data?.error || err.message || 'Failed to generate trip plan. Please try again.');
      setIsPlanning(false);
    }
  };

  const calculateDays = () => {
    if (!formValues.startDate || !formValues.endDate) return 1;
    const s = new Date(formValues.startDate);
    const e = new Date(formValues.endDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Travel Wizard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Plan Your Complete Trip
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Independent transport comparison, affordable stays, budget optimization, and AI day-by-day itineraries.
          </p>
        </div>

        {/* Quick Example Presets */}
        <div className="mb-8 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Quick Examples:
          </span>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                origin: 'Bhubaneswar',
                dest: 'Goa',
                budget: 15000,
                days: 7,
                style: 'budget',
                acc: 'budget_hotel',
                interests: ['Beaches', 'Sightseeing', 'Food and Culture'],
              })
            }
            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
          >
            🏖️ Bhubaneswar → Goa (7 Days, ₹15,000)
          </button>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                origin: 'Delhi',
                dest: 'Manali',
                budget: 12000,
                days: 5,
                style: 'balanced',
                acc: 'homestay',
                interests: ['Mountains', 'Adventure', 'Food and Culture'],
              })
            }
            className="text-xs px-3 py-1.5 bg-sky-50 text-sky-700 font-semibold rounded-lg hover:bg-sky-100 transition-colors"
          >
            🏔️ Delhi → Manali (5 Days, ₹12,000)
          </button>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                origin: 'Mumbai',
                dest: 'Jaipur',
                budget: 10000,
                days: 4,
                style: 'budget',
                acc: 'hostel',
                interests: ['Heritage', 'Sightseeing', 'Food and Culture'],
              })
            }
            className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors"
          >
            🏰 Mumbai → Jaipur (4 Days, ₹10,000)
          </button>
        </div>

        {/* Progress Bar Indicator */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[
              { num: 1, label: 'Trip Details' },
              { num: 2, label: 'Budget & Stays' },
              { num: 3, label: 'Transport Strategy' },
              { num: 4, label: 'Review & Launch' },
            ].map((step) => (
              <div
                key={step.num}
                onClick={() => !isPlanning && setCurrentStep(step.num)}
                className={`cursor-pointer text-center p-2 rounded-xl transition-all ${
                  currentStep === step.num
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : currentStep > step.num
                    ? 'bg-emerald-100 text-emerald-800 font-semibold'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">Step {step.num}</div>
                <div className="text-xs truncate">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Error alert if any */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Error Generating Trip Plan</div>
              <div>{apiError}</div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 transition-all">
            {/* STEP 1: TRIP DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Step 1 — Where & When</h2>
                  <p className="text-xs text-slate-500">
                    Define your starting point, target destination, dates, and traveling party.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Starting City / Airport / Station
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <input
                        type="text"
                        {...register('origin')}
                        placeholder="e.g. Bhubaneswar"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    {errors.origin?.message && <p className="text-xs text-red-600 mt-1">{String(errors.origin.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Destination City / Region
                    </label>
                    <div className="relative">
                      <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600" />
                      <input
                        type="text"
                        {...register('destination')}
                        placeholder="e.g. Goa"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    {errors.destination?.message && <p className="text-xs text-red-600 mt-1">{String(errors.destination.message)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Departure Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        {...register('startDate')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    {errors.startDate?.message && <p className="text-xs text-red-600 mt-1">{String(errors.startDate.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Return Date ({calculateDays()} Days Total)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        {...register('endDate')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    {errors.endDate?.message && <p className="text-xs text-red-600 mt-1">{String(errors.endDate.message)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Adults (Age 12+)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      {...register('adults', { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Children (Under 12)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      {...register('children', { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUDGET & PREFERENCES */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Step 2 — Budget & Stay Style</h2>
                  <p className="text-xs text-slate-500">
                    Set your expenditure limits and comfort requirements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Total Trip Budget (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-emerald-600">
                        ₹
                      </span>
                      <input
                        type="number"
                        step={500}
                        {...register('totalBudget', { valueAsNumber: true })}
                        placeholder="15000"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Covers outbound transport, return transport, stays, food, and local activities.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Emergency Reserve %
                    </label>
                    <select
                      {...register('reservePercentage', { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={5}>5% (Minimal buffer)</option>
                      <option value={10}>10% (Recommended safe reserve)</option>
                      <option value={15}>15% (Extra safety cushion)</option>
                      <option value={20}>20% (Conservative buffer)</option>
                    </select>
                  </div>
                </div>

                {/* Travel Style Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Travel Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'budget', label: 'Budget-Friendly', desc: 'Hostels, local food, sleeper/3A trains' },
                      { id: 'balanced', label: 'Balanced', desc: 'Cozy hotels, mixed dining, value flights' },
                      { id: 'comfort', label: 'Comfort-First', desc: 'Boutique stays, cabs, fast flights' },
                      { id: 'luxury', label: 'Luxury & Spa', desc: '5-star resorts, private transfers' },
                    ].map((style) => (
                      <div
                        key={style.id}
                        onClick={() => setValue('travelStyle', style.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          formValues.travelStyle === style.id
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{style.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{style.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stay Type Preference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Accommodation Preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { id: 'hostel', label: 'Backpacker Hostel' },
                      { id: 'budget_hotel', label: 'Budget Hotel' },
                      { id: 'homestay', label: 'Heritage Homestay' },
                      { id: 'standard_hotel', label: 'Standard Hotel' },
                      { id: 'flexible', label: 'Any / Flexible' },
                    ].map((acc) => (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => setValue('accommodationType', acc.id)}
                        className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                          formValues.accommodationType === acc.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel Interests (Multi-select) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Travel Interests & Sights (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Beaches',
                      'Sightseeing',
                      'Food and Culture',
                      'Adventure & Treks',
                      'Relaxation',
                      'Heritage & Forts',
                      'Nightlife & Shacks',
                      'Nature & Wildlife',
                      'Shopping & Flea Markets',
                    ].map((interest) => {
                      const isSelected = formValues.interests?.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Food Preferences & Pace */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Food & Dining Preference
                    </label>
                    <input
                      type="text"
                      {...register('foodPreference')}
                      placeholder="e.g. Authentic local seafood thalis, Vegetarian"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Travel Pace
                    </label>
                    <select
                      {...register('travelPace')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="relaxed">Relaxed (1-2 main sights/day, lots of downtime)</option>
                      <option value="moderate">Moderate (Balanced sightseeing and leisure)</option>
                      <option value="fast">Fast (See everything possible in minimum time)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TRANSPORT PREFERENCES */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Step 3 — Transport Optimization</h2>
                  <p className="text-xs text-slate-500">
                    Tell us how you prioritize speed vs affordability. Outbound and return journeys are analyzed independently.
                  </p>
                </div>

                {/* Transport Strategy */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Optimization Strategy
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'cheapest', title: 'Cheapest Option', desc: 'Prioritizes sleeper/3A trains and buses for maximum savings' },
                      { id: 'fastest', title: 'Fastest Travel Time', desc: 'Prioritizes flights to maximize destination sightseeing hours' },
                      { id: 'balanced', title: 'Best Overall Value (Recommended)', desc: 'Balances travel duration, comfort class, and ticket price' },
                      { id: 'comfort', title: 'Comfort-First', desc: 'Direct flights or 2A/1A AC sleeper berths' },
                    ].map((strat) => (
                      <div
                        key={strat.id}
                        onClick={() => setValue('transportStrategy', strat.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          formValues.transportStrategy === strat.id
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-900">{strat.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{strat.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allowed Modes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Allowed Transport Modes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { mode: 'train', label: 'Indian Railways (Train)', icon: Train },
                      { mode: 'flight', label: 'Domestic Flights', icon: Plane },
                      { mode: 'bus', label: 'Interstate Buses', icon: Compass },
                      { mode: 'connecting', label: 'Connecting Transits', icon: Zap },
                    ].map((item) => {
                      const isIncluded = formValues.preferredTransportModes?.includes(item.mode);
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.mode}
                          onClick={() => handleModeToggle(item.mode)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                            isIncluded
                              ? 'bg-emerald-50 border-emerald-500 text-slate-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isIncluded ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-xs">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Checkbox Options */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('acceptsTransfers')}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Allow 1 connection or transfer if it saves substantial money or time
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('overnightAllowed')}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Allow overnight sleeper journeys (saves 1 full night of hotel accommodation)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & LAUNCH */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Step 4 — Review Your Travel Plan</h2>
                  <p className="text-xs text-slate-500">
                    Verify all parameters before launching the real-time AI itinerary and transport evaluation.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                    <div>
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Route</div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {formValues.origin} → {formValues.destination}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration & Dates</div>
                      <div className="text-sm font-bold text-slate-800">
                        {calculateDays()} Days ({formValues.startDate} to {formValues.endDate})
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Total Budget:</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        ₹{formValues.totalBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Travelers:</span>
                      <span className="font-bold text-slate-900">
                        {formValues.adults} Adult(s) {formValues.children > 0 ? `+ ${formValues.children} Child` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Travel Style:</span>
                      <span className="font-bold text-slate-900 capitalize">{formValues.travelStyle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Stay Category:</span>
                      <span className="font-bold text-slate-900 capitalize">
                        {formValues.accommodationType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 text-xs">
                    <span className="text-slate-500 block mb-1">Interests:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formValues.interests?.map((i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading state indicator */}
                {isPlanning && (
                  <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-3">
                    <div className="w-10 h-10 mx-auto border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <div className="font-bold text-emerald-900 text-sm">{planningStage}</div>
                    <p className="text-xs text-emerald-700">
                      TravelGenie AI is connecting transport fares, verified stays, and generating a customized day-by-day plan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  disabled={isPlanning}
                  onClick={onPrevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={onNextStep}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPlanning}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Complete Trip Plan</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
