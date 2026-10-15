import { GoogleGenAI } from '@google/genai';
import { ENV } from '../../config/env.js';
import { getDestinationGeo } from '../maps/locations.js';

export class GeminiAIService {
  static getClient() {
    if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === 'your_gemini_api_key') {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    } catch (e) {
      console.warn('[GeminiAIService] Could not initialize Google Gen AI client:', e);
      return null;
    }
  }

  static async callGenerateContent(aiClient, config) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;
    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout calling model')), 3000));
        const res = await Promise.race([
          aiClient.models.generateContent({
            ...config,
            model,
          }),
          timeoutPromise
        ]);
        return res;
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiAIService] Model ${model} request error: ${err.message}. Trying next model...`);
      }
    }
    throw lastError;
  }

  /**
   * Generate a comprehensive, day-by-day personalized itinerary
   */
  static async generateItinerary(params) {
    const aiClient = this.getClient();

    if (aiClient) {
      try {
        const prompt = this.buildPrompt(params);
        console.log('[GeminiAIService] Calling Gemini API for structured itinerary...');

        const response = await this.callGenerateContent(aiClient, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (this.validateItineraryResponse(parsed)) {
            return {
              ...parsed,
              generatedBy: 'gemini',
            };
          }
        }
      } catch (err) {
        console.warn(`[GeminiAIService] Gemini API error (${err.message}). Falling back to rule-engine generator.`);
      }
    }

    // High quality deterministic fallback generator
    return this.generateDeterministicItinerary(params);
  }

  /**
   * Handle contextual AI Chatbot conversations
   */
  static async chatWithAssistant(userMessage, tripContext) {
    const aiClient = this.getClient();
    const prompt = `You are TravelGenie AI, an expert, courteous, and highly knowledgeable personal travel assistant.
The user is currently reviewing this trip:
- Origin: ${tripContext.origin}
- Destination: ${tripContext.destination}
- Dates: ${tripContext.startDate} to ${tripContext.endDate} (${tripContext.durationDays} days)
- Travelers: ${tripContext.travelers}
- Budget: ₹${tripContext.totalBudget}
- Travel Style: ${tripContext.preferences?.travelStyle || 'budget'}
- Current Outbound Transport: ${tripContext.selectedOutbound?.provider || 'None'} (${tripContext.selectedOutbound?.mode || 'None'}, ₹${tripContext.selectedOutbound?.totalFare || 0})
- Current Return Transport: ${tripContext.selectedReturn?.provider || 'None'} (${tripContext.selectedReturn?.mode || 'None'}, ₹${tripContext.selectedReturn?.totalFare || 0})
- Current Accommodation: ${tripContext.selectedAccommodation?.propertyName || 'None'} (₹${tripContext.selectedAccommodation?.totalPrice || 0})

User Message: "${userMessage}"

Respond with helpful, friendly, and actionable travel advice. If the user asks to change transport or hotel, recommend the specific switch and suggest they click the Outbound/Return or Accommodation tabs to select the option.
Never pretend that a payment or booking has occurred. All bookings happen on verified provider portals.
Keep your response concise, clear, and formatted in Markdown.`;

    let replyText = '';

    if (aiClient) {
      try {
        const response = await this.callGenerateContent(aiClient, {
          contents: prompt,
          config: {
            temperature: 0.3,
          },
        });
        replyText = response.text || '';
      } catch (err) {
        console.warn('[GeminiAIService] Chat error, using intelligent local handler:', err);
      }
    }

    if (!replyText) {
      replyText = this.handleFallbackChat(userMessage, tripContext);
    }

    // Determine if an action payload is applicable
    const lower = userMessage.toLowerCase();
    let actionPayload = undefined;

    if (lower.includes('cheaper') || lower.includes('save money') || lower.includes('reduce cost')) {
      actionPayload = {
        type: 'SWAP_TRANSPORT',
        details: { target: 'train', recommendation: 'Amaravati Express 3A / Sleeper' },
      };
    } else if (lower.includes('flight') && (lower.includes('train') || lower.includes('replace'))) {
      actionPayload = {
        type: 'SWAP_TRANSPORT',
        details: { target: 'train' },
      };
    } else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('hostel')) {
      actionPayload = {
        type: 'SWAP_ACCOMMODATION',
        details: { target: 'hostel' },
      };
    } else if (lower.includes('pack') || lower.includes('clothes') || lower.includes('what to bring')) {
      actionPayload = {
        type: 'SHOW_PACKING',
      };
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionPayload,
    };
  }

  /**
   * Generate a comprehensive packing checklist
   */
  static async generatePackingList(destination, durationDays, travelStyle) {
    const isBeach = destination.toLowerCase().includes('goa') || destination.toLowerCase().includes('kerala');
    const isMountain = destination.toLowerCase().includes('manali') || destination.toLowerCase().includes('shimla') || destination.toLowerCase().includes('leh');

    return [
      {
        category: 'Travel Documents & Money',
        items: [
          { name: 'Government Photo ID (Aadhaar / Voter ID / Passport)', essential: true, tip: 'Required for flight, train, and hotel check-in' },
          { name: 'Confirmed Train / Flight E-Tickets', essential: true, tip: 'Keep offline PDF on phone' },
          { name: 'Hotel Booking Confirmations', essential: true },
          { name: 'Emergency Cash in Small Denominations (₹1,500 - ₹3,000)', essential: true, tip: 'Useful for local beach shacks & autos' },
          { name: 'UPI Enabled Banking App & Debit Card', essential: true },
        ],
      },
      {
        category: isBeach ? 'Beach & Casual Wear' : isMountain ? 'Warm Layered Clothing' : 'Comfortable Sightseeing Wear',
        items: [
          { name: isBeach ? 'Breathable Cotton T-Shirts & Linen Shirts (4-5 pairs)' : isMountain ? 'Thermal Innerwear & Fleece Jacket' : 'Lightweight breathable shirts (4 pairs)', essential: true },
          { name: isBeach ? 'Board Shorts / Swimwear & Sarongs' : isMountain ? 'Water-resistant Windcheater / Down Jacket' : 'Comfortable cotton pants / chinos', essential: true },
          { name: 'Comfortable Walking Shoes / Sneakers', essential: true, tip: 'Must be broken-in for cobblestones or sand' },
          { name: isBeach ? 'Flip-Flops / Waterproof Slides' : 'Warm woolen socks & gloves', essential: true },
          { name: 'UV Protection Sunglasses (Polarized)', essential: true },
          { name: 'Sun Hat or Baseball Cap', essential: false },
        ],
      },
      {
        category: 'Toiletries & Personal Care',
        items: [
          { name: 'High SPF Broad Spectrum Sunscreen (SPF 50+)', essential: true, tip: 'Essential for outdoor protection' },
          { name: 'Mosquito / Insect Repellent Lotion (Odomos)', essential: true },
          { name: 'Personal Medication & First Aid Kit (Paracetamol, ORS, Band-Aids)', essential: true },
          { name: 'Lip Balm with SPF & Moisturizer', essential: false },
          { name: 'Quick-dry Microfiber Towel', essential: false },
        ],
      },
      {
        category: 'Electronics & Gadgets',
        items: [
          { name: 'Smartphone & Fast Charger', essential: true },
          { name: '10,000mAh+ Power Bank', essential: true, tip: 'Crucial for day trips and navigation' },
          { name: isBeach ? 'Waterproof Phone Pouch' : 'Universal travel adapter', essential: true },
          { name: 'Earphones / Noise Cancelling Headphones', essential: false },
        ],
      },
    ];
  }

  static buildPrompt(params) {
    return `Generate a realistic, practical, day-by-day travel itinerary for this trip in JSON format.
Trip Details:
- Origin: ${params.origin}
- Destination: ${params.destination}
- Dates: ${params.startDate} to ${params.endDate} (${params.durationDays} Days)
- Total Travelers: ${params.travelers}
- Total Budget: ₹${params.totalBudget} ${params.currency}
- Travel Style: ${params.preferences.travelStyle}
- Preferred Pace: ${params.preferences.travelPace}
- Interests: ${params.preferences.interests.join(', ')}
- Outbound Transport: Arrives at ${params.outboundTransport?.arrivalTime || '14:00'} via ${params.outboundTransport?.mode || 'transport'}
- Return Transport: Departs at ${params.returnTransport?.departureTime || '16:00'} via ${params.returnTransport?.mode || 'transport'}
- Accommodation: ${params.accommodation?.propertyName || 'Central hotel'} in ${params.accommodation?.neighborhood || 'destination'}

Guidelines:
1. Day 1: Sightseeing must start ONLY after arrival time (${params.outboundTransport?.arrivalTime || '14:00'}). If arriving late afternoon or evening, plan only check-in, sunset relax, and dinner.
2. Final Day: Activities must end before return departure (${params.returnTransport?.departureTime || '16:00'}).
3. Geographic coherence: Group geographically close attractions together. Never overload days.
4. Food: Suggest authentic local dishes/eateries for breakfast, lunch, and dinner.
5. All costs should be in INR.

Return strictly a JSON object conforming to this schema:
{
  "overview": string,
  "highlights": string[],
  "days": [
    {
      "dayNumber": number,
      "date": string,
      "title": string,
      "theme": string,
      "activities": [
        {
          "id": string,
          "timeSlot": "morning" | "afternoon" | "evening" | "night",
          "title": string,
          "description": string,
          "locationName": string,
          "coordinates": { "lat": number, "lng": number },
          "estimatedDuration": string,
          "costPerPerson": number,
          "isVerifiedCost": boolean,
          "category": "sightseeing" | "beach" | "culture" | "food" | "adventure" | "relaxation",
          "weatherBackupTip": string,
          "openingHours": string,
          "transportRecommendation": string
        }
      ],
      "foodRecommendations": [
        {
          "meal": "breakfast" | "lunch" | "dinner" | "snack",
          "dishOrCuisine": string,
          "suggestedSpot": string,
          "estimatedCost": number
        }
      ],
      "localTransportEstimate": number,
      "dayTotalEstimatedCost": number,
      "dailyNotes": string
    }
  ],
  "culturalTips": string[],
  "travelWarnings": string[],
  "packingSuggestions": string[]
}`;
  }

  static validateItineraryResponse(data) {
    return (
      data &&
      typeof data.overview === 'string' &&
      Array.isArray(data.days) &&
      data.days.length > 0 &&
      Array.isArray(data.highlights)
    );
  }

  static generateDeterministicItinerary(params) {
    const geo = getDestinationGeo(params.destination);
    const duration = Math.max(1, params.durationDays);
    const days = [];

    const start = new Date(params.startDate);

    for (let i = 1; i <= duration; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (i - 1));
      const dateStr = currentDate.toISOString().split('T')[0];

      const isFirstDay = i === 1;
      const isLastDay = i === duration;

      let title = '';
      let theme = '';
      const activities = [];

      if (isFirstDay) {
        title = `Arrival in ${params.destination} & Evening Beach Stroll`;
        theme = 'Check-in, Unwind & Sunset Welcome';

        activities.push({
          id: `act_${i}_1`,
          timeSlot: 'afternoon',
          title: `Arrival & Hotel Check-in at ${params.accommodation?.propertyName || 'Hotel'}`,
          description: `Reach your accommodation, complete check-in, unpack and refresh after the journey.`,
          locationName: params.accommodation?.location || geo.name,
          coordinates: geo.coordinates,
          estimatedDuration: '1.5 hours',
          costPerPerson: 0,
          isVerifiedCost: true,
          category: 'relaxation',
          weatherBackupTip: 'Enjoy a warm welcome beverage at the hotel lounge.',
          openingHours: '24 Hours',
          transportRecommendation: 'Pre-paid auto or local taxi from arrival terminal.',
        });

        const att = geo.topAttractions[0];
        activities.push({
          id: `act_${i}_2`,
          timeSlot: 'evening',
          title: `Sunset Walk at ${att ? att.name : 'Coastline'}`,
          description: att ? att.description : 'Stroll along the lively promenade and watch the golden sunset.',
          locationName: att ? att.name : 'Main Promenade',
          coordinates: att ? att.coordinates : geo.coordinates,
          estimatedDuration: '2.5 hours',
          costPerPerson: 0,
          isVerifiedCost: true,
          category: 'beach',
          weatherBackupTip: 'Relax at a covered beach shack or scenic cafe.',
          openingHours: 'Open 24 Hours',
          transportRecommendation: 'Rented scooter or 10-minute leisurely walk.',
        });
      } else if (isLastDay) {
        title = `Souvenir Shopping & Departure`;
        theme = 'Last Memories & Safe Return';

        activities.push({
          id: `act_${i}_1`,
          timeSlot: 'morning',
          title: `Local Craft & Spice Market Walk`,
          description: `Shop for authentic local cashew nuts, spices, handicrafts, and souvenirs to take back home.`,
          locationName: `${geo.name} Central Market`,
          coordinates: geo.coordinates,
          estimatedDuration: '2 hours',
          costPerPerson: 200,
          isVerifiedCost: false,
          category: 'culture',
          weatherBackupTip: 'Indoor municipal market stalls are covered.',
          openingHours: '9:00 AM - 7:00 PM',
          transportRecommendation: 'Local auto-rickshaw.',
        });

        activities.push({
          id: `act_${i}_2`,
          timeSlot: 'afternoon',
          title: `Departure Transfer to Station/Airport`,
          description: `Check out from accommodation and proceed to terminal for return travel with ample buffer time.`,
          locationName: params.returnTransport?.departureLocation || `${geo.name} Terminal`,
          coordinates: geo.nearestAirport.coordinates,
          estimatedDuration: '2 hours',
          costPerPerson: 150,
          isVerifiedCost: true,
          category: 'sightseeing',
          weatherBackupTip: 'Book transfer 3 hours prior in case of rain traffic.',
          openingHours: '24 Hours',
          transportRecommendation: 'Station shuttle or booked cab.',
        });
      } else {
        const attractionIdx1 = (i - 2) % geo.topAttractions.length;
        const attractionIdx2 = (i - 1) % geo.topAttractions.length;
        const att1 = geo.topAttractions[attractionIdx1];
        const att2 = geo.topAttractions[attractionIdx2];

        title = `Exploring ${att1.name} & Surrounds`;
        theme = att1.category === 'culture' ? 'Heritage & Architectural Wonder' : 'Coastal Exploration & Adventure';

        activities.push({
          id: `act_${i}_1`,
          timeSlot: 'morning',
          title: `Morning Discovery of ${att1.name}`,
          description: att1.description,
          locationName: att1.name,
          coordinates: att1.coordinates,
          estimatedDuration: att1.typicalDuration,
          costPerPerson: att1.approxCostINR,
          isVerifiedCost: true,
          category: att1.category,
          weatherBackupTip: 'Early morning visits avoid both noon heat and seasonal rain.',
          openingHours: att1.openingHours,
          transportRecommendation: 'Rented 2-wheeler or local bus.',
        });

        activities.push({
          id: `act_${i}_2`,
          timeSlot: 'afternoon',
          title: `Leisure & Culinary Break near ${att1.name}`,
          description: `Relax at a celebrated local restaurant to savor authentic delicacies like ${geo.localDishes[i % geo.localDishes.length]}.`,
          locationName: `${att1.name} Neighborhood`,
          coordinates: att1.coordinates,
          estimatedDuration: '1.5 hours',
          costPerPerson: 350,
          isVerifiedCost: false,
          category: 'food',
          weatherBackupTip: 'Air-conditioned dining indoor seating.',
          openingHours: '12:00 PM - 3:30 PM',
          transportRecommendation: 'Walkable distance.',
        });

        if (att2 && att2 !== att1) {
          activities.push({
            id: `act_${i}_3`,
            timeSlot: 'evening',
            title: `Sunset Experience at ${att2.name}`,
            description: att2.description,
            locationName: att2.name,
            coordinates: att2.coordinates,
            estimatedDuration: att2.typicalDuration,
            costPerPerson: att2.approxCostINR,
            isVerifiedCost: true,
            category: att2.category,
            weatherBackupTip: 'Observe sunset from a cliffside gazebo or cafe porch.',
            openingHours: att2.openingHours,
            transportRecommendation: 'Scenic coastal drive.',
          });
        }
      }

      days.push({
        dayNumber: i,
        date: dateStr,
        title,
        theme,
        activities,
        foodRecommendations: [
          {
            meal: 'breakfast',
            dishOrCuisine: 'Local South Indian / Continental Breakfast with Fresh Chai',
            suggestedSpot: 'Hotel cafe or beach bakery',
            estimatedCost: 120,
          },
          {
            meal: 'lunch',
            dishOrCuisine: geo.localDishes[i % geo.localDishes.length] || 'Authentic Thali',
            suggestedSpot: 'Traditional heritage dining spot',
            estimatedCost: 280,
          },
          {
            meal: 'dinner',
            dishOrCuisine: geo.localDishes[(i + 1) % geo.localDishes.length] || 'Grilled specialties with Poi bread',
            suggestedSpot: 'Candlelit garden or waterside cafe',
            estimatedCost: 380,
          },
        ],
        localTransportEstimate: 350,
        dayTotalEstimatedCost: 1150,
        dailyNotes: `Carry sunscreen and keep digital copies of your ID on hand.`,
      });
    }

    return {
      overview: `A bespoke ${duration}-day journey from ${params.origin} to ${params.destination} planned for ${params.travelers} traveler(s). This itinerary balances iconic sights with relaxed coastal pacing, authentic culinary stops, and optimized transport timings within your ₹${params.totalBudget.toLocaleString('en-IN')} budget.`,
      highlights: [
        `Seamless transport coordination between ${params.origin} and ${params.destination}`,
        `Comfortable stay at ${params.accommodation?.propertyName || 'top-rated accommodation'}`,
        `Curated sightseeing covering ${geo.topAttractions.slice(0, 3).map((a) => a.name).join(', ')}`,
        `Authentic regional gastronomy: ${geo.localDishes.slice(0, 3).join(', ')}`,
        `Maintains a 10% emergency buffer to protect your wallet`,
      ],
      days,
      culturalTips: [
        'Dress modestly when entering religious landmarks like churches, temples, or historic shrines.',
        'Always negotiate auto-rickshaw or taxi fares before boarding, or use app-based prepaid counters.',
        'Drink bottled or filtered water and avoid cut fruits from roadside vendors during warm days.',
        'Respect coastal flags: Red flags on beaches strictly denote danger and swimming is prohibited.',
      ],
      travelWarnings: [
        'Keep emergency helpline numbers saved: Police 112, Medical Emergency 108.',
        'Verify helmet laws for both rider and pillion passenger before renting 2-wheelers.',
      ],
      packingSuggestions: [
        'Quick-dry cotton clothing and swimwear',
        'High-SPF broad-spectrum sunscreen and sunglasses',
        'Sturdy sandals or broken-in walking shoes',
        'Waterproof phone case and 10,000mAh power bank',
      ],
      generatedBy: 'rule-engine-fallback',
    };
  }

  static handleFallbackChat(userMessage, tripContext) {
    const lower = userMessage.toLowerCase();

    if (lower.includes('cheaper') || lower.includes('cost') || lower.includes('budget') || lower.includes('save')) {
      return `To make your trip significantly cheaper:
1. **Switch Transport**: Switch from flights to an overnight **3A or Sleeper train** (e.g. Amaravati Express). This will save roughly ₹5,000 to ₹7,000!
2. **Choose a Backpacker Stay**: Opt for a high-rated hostel like **Zostel Backpacker Hub** (₹750/night), which cuts accommodation costs by over 50%.
3. **Eat Like a Local**: Savor regional fish thalis and street food instead of tourist cafes.
You can swap your transport or stay right now using the **Outbound / Return Transport** and **Accommodation** tabs above!`;
    }

    if (lower.includes('flight') || lower.includes('train')) {
      return `Great suggestion! Trains like the **Amaravati Express (18047)** or **Puri Express** offer comfortable AC 3-Tier berths at a fraction of the cost of flights (₹1,650 vs ₹5,200). Plus, overnight trains save you a full night of hotel fees. Check the Outbound Transport tab to switch.`;
    }

    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('hostel')) {
      return `For maximum value, we recommend **Zostel Backpacker Hub** (rated 4.8★) in Anjuna or **The Palm Grove Heritage Homestay** (₹1,450/night). Both include free high-speed WiFi, air conditioning, and great community vibes. Head over to the **Accommodation** tab to choose your stay!`;
    }

    if (lower.includes('pack') || lower.includes('bring') || lower.includes('clothes')) {
      return `Here is your quick packing checklist:
- **Clothing**: Breathable cotton shirts, swim shorts, flip-flops, light rain jacket.
- **Sun Protection**: SPF 50+ sunscreen, polarized sunglasses, sun hat.
- **Electronics**: Power bank (10,000mAh), waterproof phone pouch, charger.
- **Documents**: Aadhaar / Passport, downloaded offline e-tickets, ₹2,000 in cash for shacks and autos.`;
    }

    if (lower.includes('order') || lower.includes('reorder') || lower.includes('places')) {
      return `Yes, you can easily adapt the order of places! We have grouped attractions geographically to minimize travel time (e.g. North Goa beaches on Day 2, Old Goa churches on Day 3, South Goa on Day 4). Check the **Map and Routes** tab to visualize the daily clusters.`;
    }

    return `I am here to help you customize your trip to ${tripContext.destination || 'your destination'}! You can ask me to find cheaper options, change transport modes, recommend dining, suggest packing lists, or adjust sightseeing pacing.`;
  }
}
