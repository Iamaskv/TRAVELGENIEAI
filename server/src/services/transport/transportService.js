export class TransportService {
  /**
   * Search for transport options between two locations for a specific date
   */
  static async searchTransport(params) {
    const { origin, destination, date, travelers, direction, strategy = 'balanced', preferredModes } = params;

    const rawOptions = this.generateRealisticTransportOptions(origin, destination, date, travelers, direction);

    // Filter by preferred modes if specified
    let filtered = rawOptions;
    if (preferredModes && preferredModes.length > 0) {
      filtered = rawOptions.filter((opt) => preferredModes.includes(opt.mode));
      if (filtered.length === 0) filtered = rawOptions; // fallback if all filtered out
    }

    // Rank and assign badges: Cheapest, Fastest, Best Overall Value
    const withRankings = this.rankAndBadgeTransportOptions(filtered, strategy);

    const recommendedCheapest = withRankings.find((o) => o.badge === 'Cheapest') || withRankings[0];
    const recommendedFastest = withRankings.find((o) => o.badge === 'Fastest') || withRankings[0];
    const recommendedBestValue = withRankings.find((o) => o.badge === 'Best Overall Value') || withRankings[0];

    return {
      options: withRankings,
      recommendedCheapest,
      recommendedFastest,
      recommendedBestValue,
    };
  }

  /**
   * Generate realistic schedules and fares based on real transport networks
   */
  static generateRealisticTransportOptions(origin, destination, date, travelers, direction) {
    const now = new Date().toISOString();
    const isOutbound = direction === 'outbound';

    const originCode = this.getStationOrAirportCode(origin, 'train');
    const destCode = this.getStationOrAirportCode(destination, 'train');
    const originAirport = this.getStationOrAirportCode(origin, 'flight');
    const destAirport = this.getStationOrAirportCode(destination, 'flight');

    // Approximate distance factor
    const distanceKm = this.estimateDistanceKm(origin, destination);

    const options = [];

    // 1. Train Option A: Budget Sleeper / 3A Express
    const trainNumber1 = isOutbound ? '18047' : '18048';
    const trainName1 = isOutbound ? 'Amaravati Express' : 'Amaravati Return Express';
    const trainAFarePerPerson = Math.max(680, Math.round(distanceKm * 0.75));
    options.push({
      id: `trn_${direction}_1_${Date.now()}`,
      direction,
      mode: 'train',
      provider: 'Indian Railways (IRCTC)',
      operatorLogo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80',
      number: `${trainNumber1} ${trainName1}`,
      departureLocation: `${origin} (${originCode})`,
      departureStationCode: originCode,
      arrivalLocation: `${destination} (${destCode})`,
      arrivalStationCode: destCode,
      departureTime: isOutbound ? '06:30' : '11:45',
      arrivalTime: isOutbound ? '14:15' : '19:30',
      departureDate: date,
      arrivalDate: date,
      duration: '31h 45m',
      durationMinutes: 1905,
      stops: 8,
      transfers: [],
      farePerPerson: trainAFarePerPerson,
      totalFare: trainAFarePerPerson * travelers,
      currency: 'INR',
      baggageOrClass: 'SL (Sleeper Class)',
      availabilityStatus: 'Available',
      bookingUrl: `https://www.irctc.co.in/nget/train-search?src=${originCode}&dest=${destCode}&date=${date}`,
      lastCheckedAt: now,
      isDemoData: true,
    });

    // 2. Train Option B: Premium Superfast AC 3-Tier (3A)
    const trainNumber2 = isOutbound ? '12843' : '12844';
    const trainName2 = 'Puri Superfast Express';
    const trainBFarePerPerson = Math.max(1650, Math.round(distanceKm * 1.55));
    options.push({
      id: `trn_${direction}_2_${Date.now()}`,
      direction,
      mode: 'train',
      provider: 'Indian Railways (IRCTC)',
      operatorLogo: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=100&auto=format&fit=crop&q=80',
      number: `${trainNumber2} ${trainName2}`,
      departureLocation: `${origin} (${originCode})`,
      departureStationCode: originCode,
      arrivalLocation: `${destination} (${destCode})`,
      arrivalStationCode: destCode,
      departureTime: isOutbound ? '17:40' : '15:20',
      arrivalTime: isOutbound ? '22:10' : '20:00',
      departureDate: date,
      arrivalDate: date,
      duration: '28h 30m',
      durationMinutes: 1710,
      stops: 5,
      transfers: [],
      farePerPerson: trainBFarePerPerson,
      totalFare: trainBFarePerPerson * travelers,
      currency: 'INR',
      baggageOrClass: '3A (AC 3 Tier) Comfort Sleeper',
      availabilityStatus: 'Available',
      bookingUrl: `https://www.irctc.co.in/nget/train-search?src=${originCode}&dest=${destCode}&date=${date}`,
      lastCheckedAt: now,
      isDemoData: true,
    });

    // 3. Flight Option A: Value Direct/1-Stop Flight (IndiGo)
    const flightNumber1 = isOutbound ? '6E-542 / 6E-208' : '6E-319 / 6E-651';
    const flightFare1 = Math.max(4800, Math.round(distanceKm * 3.4));
    options.push({
      id: `flt_${direction}_1_${Date.now()}`,
      direction,
      mode: 'flight',
      provider: 'IndiGo Airlines',
      operatorLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop&q=80',
      number: flightNumber1,
      departureLocation: `${origin} (${originAirport})`,
      departureStationCode: originAirport,
      arrivalLocation: `${destination} (${destAirport})`,
      arrivalStationCode: destAirport,
      departureTime: isOutbound ? '08:15' : '18:10',
      arrivalTime: isOutbound ? '13:05' : '23:15',
      departureDate: date,
      arrivalDate: date,
      duration: '4h 50m',
      durationMinutes: 290,
      stops: 1,
      transfers: ['HYD (Hyderabad Connection 1h 20m)'],
      farePerPerson: flightFare1,
      totalFare: flightFare1 * travelers,
      currency: 'INR',
      baggageOrClass: 'Economy (Cabin 7kg + Check-in 15kg)',
      availabilityStatus: 'Fast Filling',
      bookingUrl: `https://www.makemytrip.com/flight/search?itinerary=${originAirport}-${destAirport}-${date}`,
      lastCheckedAt: now,
      isDemoData: true,
    });

    // 4. Flight Option B: Air India Express / Akasa Air
    const flightNumber2 = isOutbound ? 'IX-872' : 'IX-873';
    const flightFare2 = Math.max(5400, Math.round(distanceKm * 3.8));
    options.push({
      id: `flt_${direction}_2_${Date.now()}`,
      direction,
      mode: 'flight',
      provider: 'Air India / Express',
      operatorLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=80',
      number: flightNumber2,
      departureLocation: `${origin} (${originAirport})`,
      departureStationCode: originAirport,
      arrivalLocation: `${destination} (${destAirport})`,
      arrivalStationCode: destAirport,
      departureTime: isOutbound ? '14:20' : '09:30',
      arrivalTime: isOutbound ? '18:40' : '13:55',
      departureDate: date,
      arrivalDate: date,
      duration: '4h 20m',
      durationMinutes: 260,
      stops: 1,
      transfers: ['BLR (Bengaluru Connection 1h 10m)'],
      farePerPerson: flightFare2,
      totalFare: flightFare2 * travelers,
      currency: 'INR',
      baggageOrClass: 'Economy Flex (Cabin 7kg + Check-in 20kg)',
      availabilityStatus: 'Available',
      bookingUrl: `https://www.airindia.com`,
      lastCheckedAt: now,
      isDemoData: true,
    });

    // 5. Bus Option: Multi-Axle Volvo AC Sleeper
    const busFare = Math.max(1200, Math.round(distanceKm * 1.1));
    options.push({
      id: `bus_${direction}_1_${Date.now()}`,
      direction,
      mode: 'bus',
      provider: 'Zingbus / Intrcity SmartBus',
      operatorLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&auto=format&fit=crop&q=80',
      number: 'Volvo 9600 Multi-Axle Sleeper',
      departureLocation: `${origin} Inter State Bus Terminus`,
      arrivalLocation: `${destination} Central Bus Stand`,
      departureTime: isOutbound ? '19:30' : '18:00',
      arrivalTime: isOutbound ? '12:00' : '10:30',
      departureDate: date,
      arrivalDate: date,
      duration: '16h 30m',
      durationMinutes: 990,
      stops: 3,
      transfers: [],
      farePerPerson: busFare,
      totalFare: busFare * travelers,
      currency: 'INR',
      baggageOrClass: 'AC Sleeper Berth (1 Luggage + 1 Handbag)',
      availabilityStatus: 'Available',
      bookingUrl: `https://www.redbus.in/bus-tickets/${origin.toLowerCase()}-to-${destination.toLowerCase()}?date=${date}`,
      lastCheckedAt: now,
      isDemoData: true,
    });

    // 6. Connecting Journey: Express Train + AC Shuttle Cab
    const connectingFare = Math.max(2100, Math.round(distanceKm * 1.7));
    options.push({
      id: `con_${direction}_1_${Date.now()}`,
      direction,
      mode: 'connecting',
      provider: 'Express Train + Pre-booked AC Transit',
      operatorLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=80',
      number: 'InterCity + Direct Transfer',
      departureLocation: `${origin} (${originCode})`,
      arrivalLocation: `${destination} Hotel Delivery Zone`,
      departureTime: isOutbound ? '07:15' : '10:00',
      arrivalTime: isOutbound ? '18:45' : '21:30',
      departureDate: date,
      arrivalDate: date,
      duration: '11h 30m',
      durationMinutes: 690,
      stops: 1,
      transfers: ['Hubli / Pune Interchange (45m transit)'],
      farePerPerson: connectingFare,
      totalFare: connectingFare * travelers,
      currency: 'INR',
      baggageOrClass: 'AC Chair Car + Private AC Hatchback',
      availabilityStatus: 'Guaranteed',
      bookingUrl: `https://www.makemytrip.com`,
      lastCheckedAt: now,
      isDemoData: true,
    });

    return options;
  }

  /**
   * Sort and assign recommendation badges
   */
  static rankAndBadgeTransportOptions(options, strategy) {
    if (options.length === 0) return [];

    // Find absolute cheapest
    let cheapest = options[0];
    for (const opt of options) {
      if (opt.totalFare < cheapest.totalFare) {
        cheapest = opt;
      }
    }

    // Find absolute fastest
    let fastest = options[0];
    for (const opt of options) {
      if (opt.durationMinutes < fastest.durationMinutes) {
        fastest = opt;
      }
    }

    // Best Value: weighted combination of price, duration, comfort
    let bestValue = options[0];
    let bestScore = -Infinity;

    for (const opt of options) {
      const priceFactor = 1 / Math.max(100, opt.totalFare);
      const durationFactor = 1 / Math.max(60, opt.durationMinutes);
      const modeBonus = opt.mode === 'train' && opt.baggageOrClass?.includes('3A') ? 1.2 :
                        opt.mode === 'flight' ? 1.4 : 1.0;

      const score = (priceFactor * 0.55 + durationFactor * 0.45) * modeBonus;
      if (score > bestScore) {
        bestScore = score;
        bestValue = opt;
      }
    }

    return options.map((opt) => {
      const copy = { ...opt };
      if (opt.id === cheapest.id) {
        copy.badge = 'Cheapest';
        copy.reason = `Lowest overall fare of ₹${opt.farePerPerson.toLocaleString('en-IN')}/person. Best for strict budget preservation.`;
      } else if (opt.id === fastest.id) {
        copy.badge = 'Fastest';
        copy.reason = `Shortest travel time of ${opt.duration}. Maximizes your sightseeing and relaxation time at the destination.`;
      } else if (opt.id === bestValue.id) {
        copy.badge = 'Best Overall Value';
        copy.reason = `Optimal balance of travel comfort, swift travel duration (${opt.duration}), and reasonable cost.`;
      }
      return copy;
    });
  }

  static getStationOrAirportCode(name, type) {
    const clean = name.toLowerCase().trim();
    if (clean.includes('bhubaneswar')) return type === 'train' ? 'BBS' : 'BBI';
    if (clean.includes('goa')) return type === 'train' ? 'MAO' : 'GOI';
    if (clean.includes('delhi')) return type === 'train' ? 'NDLS' : 'DEL';
    if (clean.includes('mumbai')) return type === 'train' ? 'CSMT' : 'BOM';
    if (clean.includes('jaipur')) return type === 'train' ? 'JP' : 'JAI';
    if (clean.includes('bangalore') || clean.includes('bengaluru')) return type === 'train' ? 'SBC' : 'BLR';
    if (clean.includes('manali')) return type === 'train' ? 'CDG' : 'KUU';
    if (clean.includes('kolkata')) return type === 'train' ? 'HWH' : 'CCU';
    return type === 'train' ? 'STN' : 'APT';
  }

  static estimateDistanceKm(origin, destination) {
    const orig = origin.toLowerCase();
    const dest = destination.toLowerCase();

    if ((orig.includes('bhubaneswar') && dest.includes('goa')) || (orig.includes('goa') && dest.includes('bhubaneswar'))) {
      return 1550;
    }
    if ((orig.includes('delhi') && dest.includes('goa')) || (orig.includes('goa') && dest.includes('delhi'))) {
      return 1850;
    }
    if ((orig.includes('mumbai') && dest.includes('goa')) || (orig.includes('goa') && dest.includes('mumbai'))) {
      return 580;
    }
    if ((orig.includes('delhi') && dest.includes('manali')) || (orig.includes('manali') && dest.includes('delhi'))) {
      return 540;
    }
    if ((orig.includes('jaipur') && dest.includes('delhi')) || (orig.includes('delhi') && dest.includes('jaipur'))) {
      return 280;
    }
    return 1100;
  }
}
