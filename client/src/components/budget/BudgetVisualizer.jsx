import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ShieldAlert, CheckCircle, Info } from 'lucide-react';

export const BudgetVisualizer = ({ breakdown }) => {
  const currencySymbol = breakdown.currency === 'INR' ? '₹' : '$';

  // Category data for Donut Chart
  const pieData = [
    { name: 'Outbound Transport', value: breakdown.outboundTransportCost, color: '#0284c7' },
    { name: 'Return Transport', value: breakdown.returnTransportCost, color: '#38bdf8' },
    { name: 'Accommodation', value: breakdown.accommodationCost, color: '#059669' },
    { name: 'Food & Dining', value: breakdown.foodCost, color: '#f59e0b' },
    { name: 'Sightseeing & Activities', value: breakdown.activitiesCost, color: '#8b5cf6' },
    { name: 'Local Transfers & Transit', value: breakdown.localTransportCost, color: '#10b981' },
    { name: 'Emergency Reserve', value: breakdown.emergencyReserve, color: '#64748b' },
    { name: 'Miscellaneous & Taxes', value: breakdown.miscellaneousCost + breakdown.taxesAndFees, color: '#ec4899' },
  ].filter((item) => item.value > 0);

  // Bar Chart data comparing total budget vs actual breakdown
  const barData = [
    { name: 'Total Budget Limit', amount: breakdown.totalBudget, fill: '#10b981' },
    {
      name: 'Total Estimated Cost',
      amount: breakdown.totalEstimatedCost,
      fill: breakdown.status === 'exceeds_budget' ? '#ef4444' : '#0284c7',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
          <div className="font-bold">{data.name}</div>
          <div className="text-emerald-400 font-extrabold text-sm">
            {currencySymbol}
            {data.value.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.round((data.value / breakdown.totalEstimatedCost) * 100)}% of estimated trip expenditure
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          breakdown.status === 'within_budget'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : breakdown.status === 'tight_budget'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        <div className="flex items-start gap-3">
          {breakdown.status === 'within_budget' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">
              {breakdown.status === 'within_budget'
                ? 'Trip Comfortably Within Budget'
                : breakdown.status === 'tight_budget'
                ? 'Budget Tight — Buffer Maintained'
                : 'Budget Overrun Detected'}
            </div>
            <div className="text-xs mt-0.5 leading-relaxed opacity-90">
              {breakdown.status === 'within_budget'
                ? `You have a surplus buffer of ${currencySymbol}${breakdown.remainingBudget.toLocaleString('en-IN')} remaining beyond all expenses and emergency reserves.`
                : breakdown.status === 'tight_budget'
                ? `Estimated expenses use ${breakdown.percentageUsed}% of budget with ${currencySymbol}${breakdown.remainingBudget.toLocaleString('en-IN')} left over.`
                : `Total expenses exceed your budget ceiling by ${currencySymbol}${(breakdown.shortfallAmount || 0).toLocaleString('en-IN')}. Review optimization suggestions below.`}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs uppercase tracking-wider font-bold opacity-75">Used of Budget</div>
          <div className="text-2xl font-extrabold">{breakdown.percentageUsed}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Expense Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expense Allocation Breakdown</h3>
              <p className="text-[11px] text-slate-500">Distribution across travel components</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total:</span>{' '}
              <span className="text-sm font-extrabold text-slate-900">
                {currencySymbol}
                {breakdown.totalEstimatedCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend Tags */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Budget Ceiling vs Actual Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Budget vs Estimated Cost</h3>
                <p className="text-[11px] text-slate-500">Financial headroom analysis</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Cost Per Person:</span>
              <span className="text-base font-bold text-slate-900">
                {currencySymbol}
                {breakdown.costPerPerson.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Cost Per Day:</span>
              <span className="text-base font-bold text-slate-900">
                {currencySymbol}
                {breakdown.costPerDay.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Deterministic Itemized Expense Ledger
          </h3>
          <span className="text-xs text-slate-500">All figures in {breakdown.currency}</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Outbound Journey (Selected Mode)</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {breakdown.outboundTransportCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Return Journey (Selected Mode)</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {breakdown.returnTransportCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Accommodation (Entire Stay + Hotel Taxes)</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {breakdown.accommodationCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Estimated Food & Dining (Breakfast, Lunch, Dinner)</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {breakdown.foodCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Sightseeing Entry & Activities Tickets</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {breakdown.activitiesCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Local Daily Transit (Scooter / Autos / Cabs)</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {breakdown.localTransportCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
            <span className="text-slate-700 font-medium">Miscellaneous Buffer & Contingencies</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}
              {(breakdown.miscellaneousCost + breakdown.taxesAndFees).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between bg-slate-50/80 font-bold">
            <span className="text-emerald-800">Protected Emergency Reserve Fund</span>
            <span className="text-emerald-800">
              {currencySymbol}
              {breakdown.emergencyReserve.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-4 flex items-center justify-between bg-slate-900 text-white font-extrabold text-sm">
            <span>Total Estimated Expenditure</span>
            <span className="text-emerald-400">
              {currencySymbol}
              {breakdown.totalEstimatedCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations List */}
      {breakdown.optimizationSuggestions && breakdown.optimizationSuggestions.length > 0 && (
        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Budget Advisory & Optimization Insights</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
            {breakdown.optimizationSuggestions.map((sug, i) => (
              <li key={i} className="leading-relaxed">
                {sug}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
