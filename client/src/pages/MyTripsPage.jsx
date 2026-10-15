import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bookmark,
  Calendar,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const MyTripsPage = () => {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserTrips() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getSavedTrips();
        setTrips(res.trips);
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserTrips();
  }, [isAuthenticated]);

  const handleDeleteTrip = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      await api.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete trip');
    }
  };

  const handleOpenTrip = (trip) => {
    sessionStorage.setItem('current_travel_plan', JSON.stringify(trip));
    navigate(`/trip/${trip.id || 'current'}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Trips</h2>
          <p className="text-xs text-slate-500">
            Log in to access your saved itineraries, transport options, and optimized travel budgets.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Personal Travel Vault
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Saved Trips
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as {user?.email} • {trips.length} Saved Itineraries
            </p>
          </div>

          <button
            onClick={() => navigate('/plan')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan New Trip</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-slate-500">Loading your travel vault...</div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Saved Trips Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use our AI planner to compare trains, buses, flights, and affordable hotels, then click "Save Trip" to keep it in your collection.
            </p>
            <button
              onClick={() => navigate('/plan')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              Start Planning Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleOpenTrip(trip)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {trip.durationDays} Days Plan
                    </span>
                    <button
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {trip.origin} → {trip.destination}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.startDate} to {trip.endDate}</span>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Budget</span>
                      <span className="font-bold text-slate-900">
                        ₹{trip.totalBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Est. Expenditure</span>
                      <span className="font-bold text-emerald-600">
                        ₹{trip.budgetBreakdown?.totalEstimatedCost.toLocaleString('en-IN') || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>View Details & Itinerary</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
