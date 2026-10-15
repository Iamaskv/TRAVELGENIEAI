export class AccommodationService {
  static async searchAccommodations(params) {
    const {
      destination,
      checkIn,
      checkOut,
      travelers,
      accommodationType = 'flexible',
      maxNightlyRate,
      minRating = 0,
      travelStyle = 'budget',
    } = params;

    const nights = this.calculateNights(checkIn, checkOut);
    const rooms = Math.ceil(travelers / 2); // 2 people per room for hotel, or 1 bed per person for hostel

    const rawList = this.generateAccommodations(destination, nights, travelers, rooms);

    // Apply filtering
    let filtered = rawList.filter((item) => {
      if (accommodationType !== 'flexible' && item.propertyType !== accommodationType) {
        return false;
      }
      if (maxNightlyRate && item.nightlyRate > maxNightlyRate) {
        return false;
      }
      if (item.rating < minRating) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      filtered = rawList; // fallback so the user always sees options
    }

    // Sort by relevance to travel style
    return this.rankAccommodations(filtered, travelStyle);
  }

  static calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  static rankAccommodations(items, travelStyle) {
    return [...items].sort((a, b) => {
      if (travelStyle === 'budget') {
        const scoreA = (10000 / a.nightlyRate) * 0.7 + a.rating * 10 * 0.3;
        const scoreB = (10000 / b.nightlyRate) * 0.7 + b.rating * 10 * 0.3;
        return scoreB - scoreA;
      } else if (travelStyle === 'comfort' || travelStyle === 'luxury') {
        const scoreA = a.rating * 20 + a.amenities.length * 5 - a.nightlyRate * 0.005;
        const scoreB = b.rating * 20 + b.amenities.length * 5 - b.nightlyRate * 0.005;
        return scoreB - scoreA;
      }
      // Balanced
      const scoreA = a.rating * 15 + (5000 / a.nightlyRate) * 15;
      const scoreB = b.rating * 15 + (5000 / b.nightlyRate) * 15;
      return scoreB - scoreA;
    });
  }

  static generateAccommodations(destination, nights, travelers, rooms) {
    const now = new Date().toISOString();
    const destClean = destination.toLowerCase();

    const properties = [
      {
        name: 'Zostel Backpacker Hub & Co-Living',
        type: 'hostel',
        neighborhood: destClean.includes('goa') ? 'Anjuna Beach' : 'Central Quarter',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 2340,
        nightlyRate: 750,
        roomType: 'Deluxe AC Dormitory Bed with Privacy Curtain',
        occupancy: `${travelers} Bed(s)`,
        amenities: ['High-speed 100Mbps WiFi', 'Air Conditioning', 'Rooftop Cafe', 'Lockers & Power Socket', 'Common Kitchen', 'Community Events', 'Luggage Storage'],
        distance: '400m from beach promenade',
        cancel: 'Free cancellation up to 48 hours before check-in',
        taxPercent: 0.12,
      },
      {
        name: 'The Palm Grove Heritage Homestay',
        type: 'homestay',
        neighborhood: destClean.includes('goa') ? 'Candolim / Calangute' : 'Heritage Lane',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 920,
        nightlyRate: 1450,
        roomType: 'Garden View Heritage Deluxe Room',
        occupancy: `${rooms} Private Room(s) (${travelers} Guests)`,
        amenities: ['Free Home-cooked Breakfast', 'Air Conditioning', 'Free WiFi', 'Lush Tropical Garden', 'Scooter Rental Assistance', '24/7 Hot Water'],
        distance: '900m from shoreline / attractions',
        cancel: 'Free cancellation up to 3 days before check-in',
        taxPercent: 0.12,
      },
      {
        name: 'SeaBreeze Boutique Budget Hotel',
        type: 'budget_hotel',
        neighborhood: destClean.includes('goa') ? 'Baga Beach Circle' : 'City Center',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',
        rating: 4.5,
        reviewCount: 1650,
        nightlyRate: 1950,
        roomType: 'Superior King Room with Balcony',
        occupancy: `${rooms} Room(s) (${travelers} Guests)`,
        amenities: ['Outdoor Swimming Pool', 'Free Breakfast', 'AC', 'Satellite Smart TV', 'In-room Electric Kettle', 'Daily Housekeeping', '24hr Front Desk'],
        distance: '650m from main market',
        cancel: 'Pay at property, free cancellation until 24h prior',
        taxPercent: 0.12,
      },
      {
        name: 'The Nest Eco-Friendly Guesthouse',
        type: 'guesthouse',
        neighborhood: destClean.includes('goa') ? 'Vagator Cliff' : 'Old Town',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 780,
        nightlyRate: 1250,
        roomType: 'Standard Double Room with Veranda',
        occupancy: `${rooms} Room(s) (${travelers} Guests)`,
        amenities: ['Free WiFi', 'Ceiling Fan & Air Cooler', 'Organic Kitchen', 'Yoga Terrace', 'Bicycle Lending', 'Filtered Drinking Water'],
        distance: '1.2 km from main sunset point',
        cancel: 'Free cancellation up to 5 days prior',
        taxPercent: 0.05,
      },
      {
        name: 'Grand Azure Resort & Spa',
        type: 'standard_hotel',
        neighborhood: destClean.includes('goa') ? 'Sinquerim Beach' : 'Resort Strip',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewCount: 3100,
        nightlyRate: 3800,
        roomType: 'Premium Ocean/Pool View Suite',
        occupancy: `${rooms} Suite(s) (${travelers} Guests)`,
        amenities: ['Infinity Swimming Pool', 'Multi-cuisine Buffet Breakfast', 'Ayurvedic Spa', 'Fitness Gym', 'Airport Shuttle', 'Cocktail Lounge', '24hr Room Service'],
        distance: '200m direct beach access',
        cancel: 'Free cancellation up to 7 days before check-in',
        taxPercent: 0.18,
      },
    ];

    return properties.map((prop, idx) => {
      const isHostel = prop.type === 'hostel';
      const multiplier = isHostel ? travelers : rooms;
      const subtotal = prop.nightlyRate * nights * multiplier;
      const taxesAndFees = Math.round(subtotal * prop.taxPercent);
      const totalPrice = subtotal + taxesAndFees;

      return {
        id: `acc_${idx}_${Date.now()}`,
        providerPropertyId: `PRP-${1000 + idx}`,
        propertyName: prop.name,
        propertyType: prop.type,
        location: `${prop.neighborhood}, ${destination}`,
        neighborhood: prop.neighborhood,
        image: prop.image,
        rating: prop.rating,
        reviewCount: prop.reviewCount,
        nightlyRate: prop.nightlyRate,
        totalNights: nights,
        roomCount: multiplier,
        totalPrice,
        taxesAndFees,
        currency: 'INR',
        roomType: prop.roomType,
        occupancyDescription: prop.occupancy,
        amenities: prop.amenities,
        distanceFromCenter: prop.distance,
        cancellationPolicy: prop.cancel,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination + ' ' + prop.name)}`,
        lastCheckedAt: now,
        isDemoData: true,
      };
    });
  }
}
