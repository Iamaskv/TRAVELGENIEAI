export class BudgetEngine {
  /**
   * Deterministic calculation of complete trip budget breakdown
   */
  static calculateBreakdown(input) {
    const {
      totalBudget,
      currency = 'INR',
      durationDays = 1,
      travelers = 1,
      travelStyle = 'budget',
      outboundFare = 0,
      returnFare = 0,
      accommodationTotal = 0,
      reservePercentage = 10,
    } = input;

    const days = Math.max(1, durationDays);
    const people = Math.max(1, travelers);

    // Baseline food cost estimates per person per day by travel style
    const foodDailyRates = {
      budget: 450, // Street food, local thalis, dhaba meals
      balanced: 850, // Mix of casual cafes, beach shacks, thalis
      comfort: 1600, // Good restaurants, specialty dining, drinks
      luxury: 3200, // Fine dining, beach clubs, premium buffets
    };

    // Baseline local transport cost per day (scooter rental, auto/buses, cabs)
    const localTransportDailyRates = {
      budget: 350, // Activa/bike rental (₹350/day) or local bus
      balanced: 650, // Auto-rickshaws + shared cab or bike
      comfort: 1400, // Dedicated AC cab / self-drive car
      luxury: 2800, // Chauffeur-driven premium sedan/SUV
    };

    // Baseline sightseeing / activities entrance tickets per day per person
    const activitiesDailyRates = {
      budget: 200, // Monuments, free beaches, scenic viewpoints
      balanced: 450, // Watersports, museums, boat ride
      comfort: 900, // Scuba/parasailing, guided tours, heritage passes
      luxury: 1800, // Private yacht, luxury watersports, VIP entry
    };

    const foodCost = (foodDailyRates[travelStyle] || 450) * days * people;
    const localTransportCost = (localTransportDailyRates[travelStyle] || 350) * days;
    const activitiesCost = input.customActivitiesCost !== undefined
      ? input.customActivitiesCost
      : (activitiesDailyRates[travelStyle] || 200) * days * people;

    // Fixed miscellaneous buffer (sim card, souvenirs, emergency medical, water bottles)
    const miscellaneousCost = 300 * days;

    // Known taxes and service fees buffer on food & activities (approx 5%)
    const taxesAndFees = Math.round((foodCost + activitiesCost) * 0.05);

    // Emergency reserve
    const safeReservePercent = Math.min(30, Math.max(0, reservePercentage));
    const emergencyReserve = Math.round((totalBudget * safeReservePercent) / 100);

    // Subtotal of all real expenses
    const subtotalExpenses =
      outboundFare +
      returnFare +
      accommodationTotal +
      foodCost +
      localTransportCost +
      activitiesCost +
      miscellaneousCost +
      taxesAndFees;

    const totalEstimatedCost = subtotalExpenses + emergencyReserve;
    const remainingBudget = totalBudget - totalEstimatedCost;
    const percentageUsed = Math.min(999, Math.round((totalEstimatedCost / totalBudget) * 100));

    let status = 'within_budget';
    let shortfallAmount = 0;
    const optimizationSuggestions = [];

    if (totalEstimatedCost > totalBudget) {
      status = 'exceeds_budget';
      shortfallAmount = totalEstimatedCost - totalBudget;

      optimizationSuggestions.push(
        `Your estimated trip cost of ₹${totalEstimatedCost.toLocaleString('en-IN')} exceeds your budget by ₹${shortfallAmount.toLocaleString('en-IN')}.`
      );

      if (outboundFare + returnFare > totalBudget * 0.45) {
        optimizationSuggestions.push(
          'Transport accounts for over 45% of your total budget. Switching from flights to overnight 3A / Sleeper train can save up to ₹5,000–₹8,000.'
        );
      }

      if (accommodationTotal > totalBudget * 0.4) {
        optimizationSuggestions.push(
          'Accommodation is high relative to your budget. Choosing a high-rated backpacker hostel or cozy homestay can reduce accommodation expense by 40–60%.'
        );
      }

      if (days > 5 && shortfallAmount > totalBudget * 0.25) {
        optimizationSuggestions.push(
          `Consider adjusting trip duration from ${days} days to ${days - 2} days to comfortably align with your budget of ₹${totalBudget.toLocaleString('en-IN')}.`
        );
      }

      optimizationSuggestions.push(
        'Opt for local scooter rentals and authentic local thalis instead of tourist-targeted dining.'
      );
    } else if (remainingBudget < totalBudget * 0.1) {
      status = 'tight_budget';
      optimizationSuggestions.push(
        `Trip fits within budget with a modest buffer of ₹${remainingBudget.toLocaleString('en-IN')}. Keep your emergency reserve intact.`
      );
    } else {
      status = 'within_budget';
      optimizationSuggestions.push(
        `Excellent! Your trip is comfortably within budget with ₹${remainingBudget.toLocaleString('en-IN')} in surplus savings.`
      );
    }

    return {
      currency,
      totalBudget,
      outboundTransportCost: outboundFare,
      returnTransportCost: returnFare,
      accommodationCost: accommodationTotal,
      foodCost,
      activitiesCost,
      localTransportCost,
      emergencyReserve,
      miscellaneousCost,
      taxesAndFees,
      totalEstimatedCost,
      remainingBudget,
      percentageUsed,
      costPerPerson: Math.round(totalEstimatedCost / people),
      costPerDay: Math.round(totalEstimatedCost / days),
      status,
      shortfallAmount: shortfallAmount > 0 ? shortfallAmount : undefined,
      optimizationSuggestions,
    };
  }

  /**
   * Combination Optimizer:
   * Evaluates valid combinations of Outbound, Return, and Accommodation options,
   * ranking them by budget feasibility, total trip cost, journey duration, and convenience.
   */
  static optimizeCombinations(
    outboundOptions,
    returnOptions,
    accommodations,
    baseInput
  ) {
    const results = [];

    // Evaluate combinations
    for (const outbound of outboundOptions) {
      for (const returnTrip of returnOptions) {
        for (const stay of accommodations) {
          const breakdown = this.calculateBreakdown({
            ...baseInput,
            outboundFare: outbound.totalFare,
            returnFare: returnTrip.totalFare,
            accommodationTotal: stay.totalPrice,
          });

          // Compute feasibility score: higher is better
          let score = 1000;
          if (breakdown.status === 'within_budget') {
            score += 500 + breakdown.remainingBudget * 0.05;
          } else if (breakdown.status === 'tight_budget') {
            score += 250;
          } else {
            score -= (breakdown.shortfallAmount || 0) * 0.5;
          }

          // Journey duration penalty
          const totalDurationMinutes = outbound.durationMinutes + returnTrip.durationMinutes;
          score -= totalDurationMinutes * 0.1;

          // Stay rating bonus
          score += stay.rating * 40;

          results.push({
            outbound,
            returnTrip,
            accommodation: stay,
            breakdown,
            feasibilityScore: Math.round(score),
            label: breakdown.status === 'exceeds_budget' ? 'Over Budget Alternative' : 'Best Match',
            explanation: breakdown.status === 'exceeds_budget'
              ? `Exceeds budget by ₹${(breakdown.shortfallAmount || 0).toLocaleString('en-IN')}. Good reference for premium travel.`
              : `Fully feasible. Remaining buffer: ₹${breakdown.remainingBudget.toLocaleString('en-IN')}.`,
          });
        }
      }
    }

    // Sort by feasibility score descending
    results.sort((a, b) => b.feasibilityScore - a.feasibilityScore);

    // Categorize top results
    const feasibleOnly = results.filter((r) => r.breakdown.status !== 'exceeds_budget');
    if (feasibleOnly.length > 0) {
      const cheapest = [...feasibleOnly].sort(
        (a, b) => a.breakdown.totalEstimatedCost - b.breakdown.totalEstimatedCost
      )[0];
      cheapest.label = 'Cheapest Feasible';
      cheapest.explanation = `Lowest overall expenditure (₹${cheapest.breakdown.totalEstimatedCost.toLocaleString('en-IN')}) while fully preserving your emergency reserve.`;

      const fastest = [...feasibleOnly].sort(
        (a, b) => (a.outbound.durationMinutes + a.returnTrip.durationMinutes) -
                  (b.outbound.durationMinutes + b.returnTrip.durationMinutes)
      )[0];
      if (fastest !== cheapest) {
        fastest.label = 'Fastest Feasible';
        fastest.explanation = `Fastest round-trip travel time that still fits within your ₹${baseInput.totalBudget.toLocaleString('en-IN')} budget.`;
      }

      if (results[0]) {
        results[0].label = 'Best Match';
        results[0].explanation = 'Recommended best overall balance of budget compliance, comfort, and convenience.';
      }
    }

    return results.slice(0, 5);
  }
}
