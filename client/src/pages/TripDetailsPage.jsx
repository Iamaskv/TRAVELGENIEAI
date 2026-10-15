import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TripMap } from '../components/map/TripMap';
import { BudgetVisualizer } from '../components/budget/BudgetVisualizer';
import { AIChatDrawer } from '../components/chat/AIChatDrawer';
import {
  Sparkles,
  Calendar,
  Users,
  Wallet,
  Bookmark,
  Edit,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Star,
  Coffee,
  Check,
  Printer,
} from 'lucide-react';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeItineraryDay, setActiveItineraryDay] = useState(1);
  const [packingChecklist, setPackingChecklist] = useState([]);

  // Load trip plan
  useEffect(() => {
    async function fetchTrip() {
      if (id && id !== 'current') {
        try {
          const res = await api.getTripById(id);
          setPlan(res.trip);
        } catch (err) {
          console.error('Failed to load trip by id:', err);
        }
      } else {
        // Load from session storage
        const saved = sessionStorage.getItem('current_travel_plan');
        if (saved) {
          try {
            setPlan(JSON.parse(saved));
          } catch (e) {
            console.error('Error parsing session trip:', e);
          }
        }
      }
    }
    fetchTrip();
  }, [id]);

  // Load packing list when plan is loaded
  useEffect(() => {
    if (plan) {
      api
        .getPackingList(plan.destination, plan.durationDays, plan.preferences.travelStyle)
        .then((list) => {
          setPackingChecklist(list.map((c) => ({
            ...c,
            items: c.items.map((i) => ({ ...i, checked: false })),
          })));
        })
        .catch(() => {});
    }
  }, [plan?.destination, plan?.durationDays]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Active Trip Plan Found</h2>
          <p className="text-xs text-slate-500">
            Create a personalized travel plan using our multi-step AI planner.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
          >
            Launch Trip Planner
          </button>
        </div>
      </div>
    );
  }

  // Recalculate deterministic budget when user swaps an option
  const recalculateTripBudget = async (
    newOutbound,
    newReturn,
    newAccommodation
  ) => {
    try {
      const breakdown = await api.calculateBudget({
        totalBudget: plan.totalBudget,
        currency: plan.currency,
        durationDays: plan.durationDays,
        travelers: plan.travelers,
        travelStyle: plan.preferences.travelStyle,
        outboundFare: newOutbound.totalFare,
        returnFare: newReturn.totalFare,
        accommodationTotal: newAccommodation.totalPrice,
        reservePercentage: plan.preferences.reservePercentage ?? 10,
        destination: plan.destination,
      });

      const updatedPlan = {
        ...plan,
        selectedOutbound: newOutbound,
        selectedReturn: newReturn,
        selectedAccommodation: newAccommodation,
        budgetBreakdown: breakdown,
      };

      setPlan(updatedPlan);
      sessionStorage.setItem('current_travel_plan', JSON.stringify(updatedPlan));
    } catch (err) {
      console.error('Error recalculating budget:', err);
    }
  };

  const handleSelectOutbound = (option) => {
    recalculateTripBudget(option, plan.selectedReturn, plan.selectedAccommodation);
  };

  const handleSelectReturn = (option) => {
    recalculateTripBudget(plan.selectedOutbound, option, plan.selectedAccommodation);
  };

  const handleSelectAccommodation = (stay) => {
    recalculateTripBudget(plan.selectedOutbound, plan.selectedReturn, stay);
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.saveTrip(plan);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save trip');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const toggleChecklistItem = (catIdx, itemIdx) => {
    setPackingChecklist((prev) => {
      const copy = [...prev];
      copy[catIdx].items[itemIdx].checked = !copy[catIdx].items[itemIdx].checked;
      return copy;
    });
  };

  const currencySymbol = plan.currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Itinerary & Comprehensive Travel Plan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {plan.origin} <span className="text-emerald-400">→</span> {plan.destination}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {plan.startDate} to {plan.endDate} ({plan.durationDays} Days)
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {plan.travelers} Traveler(s)
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                Budget: {currencySymbol}{plan.totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={handleSaveTrip}
              disabled={isSaving}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved to My Trips!' : 'Save Trip'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={() => navigate('/plan')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 flex items-center gap-1.5 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Budget Status Alert Card */}
        {plan.budgetBreakdown && (
          <div
            className={`p-4 rounded-2xl mb-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              plan.budgetBreakdown.status === 'within_budget'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : plan.budgetBreakdown.status === 'tight_budget'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-red-50/80 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-current shrink-0" />
              <div>
                <span className="font-bold">
                  {plan.budgetBreakdown.status === 'within_budget'
                    ? 'Total Estimated Cost Fits Budget'
                    : plan.budgetBreakdown.status === 'tight_budget'
                    ? 'Budget Tight — Buffer Preserved'
                    : 'Over Budget Alert'}
                </span>
                <span className="ml-2 opacity-80">
                  Estimated {currencySymbol}
                  {plan.budgetBreakdown.totalEstimatedCost.toLocaleString('en-IN')} of {currencySymbol}
                  {plan.totalBudget.toLocaleString('en-IN')} (
                  {plan.budgetBreakdown.percentageUsed}%)
                </span>
              </div>
            </div>

            <div className="font-bold text-slate-800">
              Remaining Buffer:{' '}
              <span className="text-emerald-700">
                {currencySymbol}
                {plan.budgetBreakdown.remainingBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="no-print bg-white rounded-2xl border border-slate-200 p-1.5 mb-8 shadow-sm overflow-x-auto flex items-center gap-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'outbound', label: 'Outbound Transport' },
            { id: 'accommodation', label: 'Accommodation' },
            { id: 'itinerary', label: 'Day-wise Itinerary' },
            { id: 'return', label: 'Return Transport' },
            { id: 'budget', label: 'Budget Breakdown' },
            { id: 'map', label: 'Map & Routes' },
            { id: 'checklist', label: 'Travel Checklist' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selected Outbound Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="h-1 bg-sky-500 absolute top-0 left-0 right-0" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                      Selected Outbound
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 uppercase">
                      {plan.selectedOutbound?.mode}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {plan.selectedOutbound?.provider}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {plan.selectedOutbound?.departureLocation} → {plan.selectedOutbound?.arrivalLocation}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {plan.selectedOutbound?.departureTime} - {plan.selectedOutbound?.arrivalTime}
                    </span>
                    <span>({plan.selectedOutbound?.duration})</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Party Fare</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {currencySymbol}
                      {plan.selectedOutbound?.totalFare.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('outbound')}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    Change <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Selected Accommodation Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                      Selected Accommodation
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                      <span>{plan.selectedAccommodation?.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {plan.selectedAccommodation?.propertyName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {plan.selectedAccommodation?.location}
                  </div>
                  <div className="text-xs text-slate-600 mt-2 font-medium">
                    {plan.selectedAccommodation?.roomType}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Stay Price</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {currencySymbol}
                      {plan.selectedAccommodation?.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('accommodation')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Change <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Selected Return Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="h-1 bg-teal-500 absolute top-0 left-0 right-0" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                      Selected Return Journey
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 uppercase">
                      {plan.selectedReturn?.mode}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {plan.selectedReturn?.provider}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {plan.selectedReturn?.departureLocation} → {plan.selectedReturn?.arrivalLocation}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {plan.selectedReturn?.departureTime} - {plan.selectedReturn?.arrivalTime}
                    </span>
                    <span>({plan.selectedReturn?.duration})</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Return Fare</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {currencySymbol}
                      {plan.selectedReturn?.totalFare.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('return')}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    Change <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Trip Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Trip Synthesis</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{plan.itinerary?.overview}</p>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Trip Highlights & Design Principles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {plan.itinerary?.highlights?.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alternative Permutations & Combinations */}
            {plan.combinations && plan.combinations.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alternative Package Combinations</h3>
                  <p className="text-xs text-slate-500">
                    Calculated permutations of outbound, return, and stays evaluated for feasibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plan.combinations.slice(0, 3).map((combo, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {combo.label}
                        </span>
                        <div className="text-sm font-bold text-slate-900 mt-2">
                          {combo.accommodation.propertyName}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Outbound: {combo.outbound.mode} • Return: {combo.returnTrip.mode}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                          {combo.explanation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Total Est. Cost</div>
                          <div className="text-xs font-extrabold text-slate-900">
                            {currencySymbol}
                            {combo.breakdown.totalEstimatedCost.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            recalculateTripBudget(combo.outbound, combo.returnTrip, combo.accommodation)
                          }
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Apply This Combo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OUTBOUND TRANSPORT */}
        {activeTab === 'outbound' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Outbound Transport Search Results</h2>
                <p className="text-xs text-slate-500">
                  {plan.origin} → {plan.destination} on {plan.startDate}. Click "Select" to make any option active and recalculate budget.
                </p>
              </div>
              <div className="text-xs text-slate-400 italic">
                Demo search connected to official booking portals
              </div>
            </div>

            <div className="space-y-4">
              {plan.outboundOptions?.map((opt) => {
                const isSelected = opt.id === plan.selectedOutbound?.id;
                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Provider & Badge */}
                      <div className="space-y-1.5 lg:w-1/3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">
                            {opt.mode}
                          </span>
                          {opt.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                opt.badge === 'Cheapest'
                                  ? 'bg-green-100 text-green-800'
                                  : opt.badge === 'Fastest'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              ★ {opt.badge}
                            </span>
                          )}
                        </div>

                        <div className="font-extrabold text-base text-slate-900">{opt.provider}</div>
                        {opt.number && <div className="text-xs font-semibold text-slate-500">{opt.number}</div>}
                        {opt.baggageOrClass && (
                          <div className="text-xs text-slate-600">{opt.baggageOrClass}</div>
                        )}
                        {opt.reason && (
                          <div className="text-[11px] text-emerald-800 font-medium bg-emerald-100/50 p-2 rounded-lg">
                            {opt.reason}
                          </div>
                        )}
                      </div>

                      {/* Middle: Departure & Arrival */}
                      <div className="flex items-center justify-between sm:justify-start gap-6 lg:w-1/3">
                        <div>
                          <div className="text-lg font-extrabold text-slate-900">{opt.departureTime}</div>
                          <div className="text-xs text-slate-500">{opt.departureLocation}</div>
                        </div>

                        <div className="text-center px-2">
                          <div className="text-[11px] font-bold text-slate-400">{opt.duration}</div>
                          <div className="w-20 h-0.5 bg-slate-300 relative my-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {opt.stops === 0 ? 'Direct Non-stop' : `${opt.stops} stop / transit`}
                          </div>
                        </div>

                        <div>
                          <div className="text-lg font-extrabold text-slate-900">{opt.arrivalTime}</div>
                          <div className="text-xs text-slate-500">{opt.arrivalLocation}</div>
                        </div>
                      </div>

                      {/* Right: Fare & Action Buttons */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 lg:w-1/4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <div className="text-xs text-slate-500">
                            {currencySymbol}
                            {opt.farePerPerson.toLocaleString('en-IN')} / traveler
                          </div>
                          <div className="text-xl font-black text-slate-900">
                            {currencySymbol}
                            {opt.totalFare.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold">{opt.availabilityStatus}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={opt.bookingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                            title="Verify on provider portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleSelectOutbound(opt)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ACCOMMODATION */}
        {activeTab === 'accommodation' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Affordable Stays in {plan.destination}
                </h2>
                <p className="text-xs text-slate-500">
                  Calculated for {plan.durationDays - 1 || 1} Night(s) for {plan.travelers} Traveler(s).
                </p>
              </div>
              <div className="text-xs text-slate-400 italic">
                Nightly rates and stay totals include estimated taxes
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plan.accommodationOptions?.map((stay) => {
                const isSelected = stay.id === plan.selectedAccommodation?.id;
                return (
                  <div
                    key={stay.id}
                    className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={stay.image}
                          alt={stay.propertyName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold capitalize">
                          {stay.propertyType.replace('_', ' ')}
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{stay.rating}</span>
                          <span className="text-[9px] text-slate-300">({stay.reviewCount})</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {stay.propertyName}
                        </h3>
                        <div className="text-xs text-slate-500">{stay.location}</div>
                        <div className="text-xs font-semibold text-emerald-800">{stay.roomType}</div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {stay.amenities.slice(0, 4).map((am, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                            >
                              {am}
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] text-slate-400 pt-1">{stay.cancellationPolicy}</div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">
                          {currencySymbol}
                          {stay.nightlyRate}/night
                        </div>
                        <div className="text-base font-extrabold text-slate-900">
                          {currencySymbol}
                          {stay.totalPrice.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-slate-400">total</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={stay.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg"
                          title="Open Booking.com"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleSelectAccommodation(stay)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Choose'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DAY-WISE ITINERARY */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Day-by-Day AI Sightseeing Itinerary</h2>
                <p className="text-xs text-slate-500">
                  Chronologically synchronized with arrival ({plan.selectedOutbound?.arrivalTime}) and return departure ({plan.selectedReturn?.departureTime}).
                </p>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {plan.itinerary?.days?.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveItineraryDay(day.dayNumber)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeItineraryDay === day.dayNumber
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Day View */}
            {plan.itinerary?.days
              ?.filter((d) => d.dayNumber === activeItineraryDay)
              .map((day) => (
                <div key={day.dayNumber} className="space-y-6">
                  {/* Day Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                      Day {day.dayNumber} • {day.date}
                    </div>
                    <h3 className="text-xl font-extrabold mt-1">{day.title}</h3>
                    <div className="text-xs text-emerald-100 mt-1">Theme: {day.theme}</div>
                  </div>

                  {/* Activities List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Scheduled Activities & Sightseeing
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {day.activities?.map((act) => (
                        <div
                          key={act.id}
                          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {act.timeSlot}
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                Est. Cost: {currencySymbol}{act.costPerPerson}
                              </span>
                            </div>

                            <h5 className="font-bold text-base text-slate-900">{act.title}</h5>
                            <div className="text-xs text-slate-500 mt-0.5">{act.locationName}</div>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              {act.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                            {act.weatherBackupTip && (
                              <div className="text-amber-800 bg-amber-50 p-2 rounded-lg">
                                💡 Weather Tip: {act.weatherBackupTip}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span>Duration: {act.estimatedDuration}</span>
                              {act.transportRecommendation && (
                                <span className="text-slate-600 font-medium">
                                  Transit: {act.transportRecommendation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Food & Dining Recommendations for Day */}
                  {day.foodRecommendations && day.foodRecommendations.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Culinary Recommendations for Day {day.dayNumber}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {day.foodRecommendations.map((meal, mIdx) => (
                          <div key={mIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                            <span className="font-bold capitalize text-slate-700 block text-[10px] uppercase">
                              {meal.meal}
                            </span>
                            <span className="font-semibold text-slate-900 block mt-0.5">
                              {meal.dishOrCuisine}
                            </span>
                            <span className="text-slate-400 block text-[11px] mt-1">
                              {meal.suggestedSpot} (Est. {currencySymbol}{meal.estimatedCost})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* TAB 5: RETURN TRANSPORT */}
        {activeTab === 'return' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Return Journey Options</h2>
                <p className="text-xs text-slate-500">
                  {plan.destination} → {plan.origin} on {plan.endDate}. Evaluated independently from outbound mode.
                </p>
              </div>
              <div className="text-xs text-slate-400 italic">
                Compatible with accommodation checkout times
              </div>
            </div>

            <div className="space-y-4">
              {plan.returnOptions?.map((opt) => {
                const isSelected = opt.id === plan.selectedReturn?.id;
                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-teal-50/50 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Provider & Badge */}
                      <div className="space-y-1.5 lg:w-1/3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">
                            {opt.mode}
                          </span>
                          {opt.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                opt.badge === 'Cheapest'
                                  ? 'bg-green-100 text-green-800'
                                  : opt.badge === 'Fastest'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              ★ {opt.badge}
                            </span>
                          )}
                        </div>

                        <div className="font-extrabold text-base text-slate-900">{opt.provider}</div>
                        {opt.number && <div className="text-xs font-semibold text-slate-500">{opt.number}</div>}
                        {opt.baggageOrClass && (
                          <div className="text-xs text-slate-600">{opt.baggageOrClass}</div>
                        )}
                        {opt.reason && (
                          <div className="text-[11px] text-teal-800 font-medium bg-teal-100/50 p-2 rounded-lg">
                            {opt.reason}
                          </div>
                        )}
                      </div>

                      {/* Middle: Departure & Arrival */}
                      <div className="flex items-center justify-between sm:justify-start gap-6 lg:w-1/3">
                        <div>
                          <div className="text-lg font-extrabold text-slate-900">{opt.departureTime}</div>
                          <div className="text-xs text-slate-500">{opt.departureLocation}</div>
                        </div>

                        <div className="text-center px-2">
                          <div className="text-[11px] font-bold text-slate-400">{opt.duration}</div>
                          <div className="w-20 h-0.5 bg-slate-300 relative my-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {opt.stops === 0 ? 'Direct Non-stop' : `${opt.stops} stop / transit`}
                          </div>
                        </div>

                        <div>
                          <div className="text-lg font-extrabold text-slate-900">{opt.arrivalTime}</div>
                          <div className="text-xs text-slate-500">{opt.arrivalLocation}</div>
                        </div>
                      </div>

                      {/* Right: Fare & Action Buttons */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 lg:w-1/4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <div className="text-xs text-slate-500">
                            {currencySymbol}
                            {opt.farePerPerson.toLocaleString('en-IN')} / traveler
                          </div>
                          <div className="text-xl font-black text-slate-900">
                            {currencySymbol}
                            {opt.totalFare.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-teal-600 font-bold">{opt.availabilityStatus}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={opt.bookingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                            title="Verify on provider portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleSelectReturn(opt)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: BUDGET BREAKDOWN */}
        {activeTab === 'budget' && (
          <div className="animate-fade-in">
            {plan.budgetBreakdown && <BudgetVisualizer breakdown={plan.budgetBreakdown} />}
          </div>
        )}

        {/* TAB 7: MAP & ROUTES */}
        {activeTab === 'map' && (
          <div className="animate-fade-in space-y-4">
            <TripMap plan={plan} />
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Map powered by OpenStreetMap & Leaflet with verified attraction landmarks.</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.destination)}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                Open Destination on Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 8: TRAVEL CHECKLIST & PACKING */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pre-Trip Preparation & Packing</h2>
                <p className="text-xs text-slate-500">
                  Customized for {plan.destination} ({plan.durationDays} Days, {plan.preferences.travelStyle} style).
                </p>
              </div>
            </div>

            {/* Cultural & Travel Tips */}
            {plan.itinerary?.culturalTips && (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Destination Etiquette & Cultural Advice
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-950 list-disc list-inside">
                  {plan.itinerary.culturalTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categorized Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packingChecklist.map((cat, catIdx) => (
                <div key={catIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    {cat.category}
                  </h3>
                  <div className="space-y-2.5">
                    {cat.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        onClick={() => toggleChecklistItem(catIdx, itemIdx)}
                        className="flex items-start gap-2.5 cursor-pointer group"
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                            item.checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 group-hover:border-emerald-500'
                          }`}
                        >
                          {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="text-xs flex-1">
                          <span className={item.checked ? 'line-through text-slate-400' : 'text-slate-800'}>
                            {item.name}
                          </span>
                          {item.essential && (
                            <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-rose-50 text-rose-700 rounded">
                              Essential
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Assistant Trigger */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="no-print fixed bottom-6 right-6 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-2xl border border-emerald-500/40 flex items-center gap-2 hover:scale-105 transition-all z-40 group"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>AI Travel Assistant</span>
      </button>

      {/* Contextual AI Chat Drawer */}
      <AIChatDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        plan={plan}
        onPlanUpdate={(newPlan) => {
          setPlan(newPlan);
          sessionStorage.setItem('current_travel_plan', JSON.stringify(newPlan));
        }}
        onSwitchTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
};
