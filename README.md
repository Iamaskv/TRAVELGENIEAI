# TravelGenie AI — Your Personal AI Travel Agent

> **"Your Journey. Your Budget. Your AI Travel Planner."**

TravelGenie AI is a production-style full-stack web application designed to plan complete, customized trips end-to-end. Rather than generating a static prototype or generic landing page, TravelGenie AI connects a modern React frontend, high-reliability Express/TypeScript backend, dual-mode persistent database, Google Gemini AI integration, independent outbound and return transport search architecture, verified accommodation tariff evaluation, a deterministic mathematical budget engine, and interactive OpenStreetMaps.

---

## 🌟 Key Features & Architecture

### 1. Dual Independent Transport Search
- **Outbound & Return Independence**: Users can choose to travel outbound by scenic train (e.g. 3A sleeper) and return via domestic flight or interstate Volvo bus without forced symmetric booking.
- **Multi-Modal Comparison**: Trains (IRCTC), Interstate Buses (RedBus/Zingbus), Domestic Flights (IndiGo, Air India), and Connecting Transits.
- **Smart Ranking Badges**: Distinctly identifies and badges:
  - **Cheapest**: Lowest overall fare per traveler.
  - **Fastest**: Shortest travel duration to maximize sightseeing hours.
  - **Best Overall Value**: Optimal balance of comfort, time, and budget.
- **Provider Booking Links**: Direct links to official booking search pages (IRCTC, RedBus, MakeMyTrip, Skyscanner) with clear demonstration data labeling.

### 2. Affordable Accommodation Finder
- **Categorized Stays**: Social backpacker hostels (e.g. Zostel), heritage homestays, boutique budget hotels, and standard hotels.
- **Complete Stay Accounting**: Automatically calculates total stay costs (`nights * nightlyRate * rooms + taxes`), verifying check-in and check-out dates.
- **Verified Details**: Guest ratings, review counts, verified amenities (WiFi, AC, Breakfast, Pool, Beach Access), cancellation policies, and Booking.com search links.

### 3. Deterministic Trip Budget Optimizer
- **Mathematical Backend Engine**: Deterministic calculations preventing AI hallucinations on prices:
  - Outbound Transport + Return Transport + Accommodation (with taxes)
  - Estimated Food (local thalis vs fine dining tiers)
  - Daily Local Transit (scooter rentals, autos, cabs)
  - Sightseeing entry tickets & activities
  - Protected Emergency Reserve Fund (user-configured: 5%, 10%, 15%, 20%)
  - Miscellaneous contingency buffer
- **Over-Budget Analysis**: When a trip exceeds the budget, the engine explains the exact shortfall and generates actionable suggestions (e.g. swap flight for overnight train, pick backpacker stay, adjust duration).
- **Interactive Visualizations**: Recharts Donut Chart (expense category breakdown) and Bar Chart (budget ceiling vs actual cost).
- **Combination Optimizer**: Permutes outbound, return, and stays to recommend top 3 packages: **Best Match**, **Cheapest Feasible**, and **Fastest Feasible**.

### 4. Chronological AI Itinerary Generator (Google Gen AI)
- **Time-Synchronized Schedule**: Respects actual arrival times (late arrivals get lighter check-in and sunset dinners) and return departure times.
- **Geographic Coherence**: Groups attractions by neighborhood to avoid traffic bottlenecks.
- **Weather-Aware Tips**: Backups for rain or noon heat.
- **Culinary Recommendations**: Authentic regional breakfast, lunch, and dinner suggestions with estimated costs.
- **Reliable Fallback**: Uses Google Gen AI (`@google/genai`); if the API key is unconfigured or rate-limited, an intelligent rule-engine crafts personalized itineraries based on deep geodata.

### 5. Interactive Map & Route Planning
- **Leaflet & OpenStreetMap**: Zero-configuration map rendering without third-party API billing requirements.
- **Interactive Markers**: Distinct color-coded markers for Arrival Terminals, Accommodation, and daily attractions.
- **Day Filtering**: Filter map sights by specific day or view all simultaneously.
- **Turn-by-Turn Navigation**: One-click "Get Directions" links opening destination coordinates directly on Google Maps.

### 6. Contextual AI Travel Assistant
- **Live Trip Drawer**: Slide-out chatbot available from any dashboard tab.
- **Context-Aware Prompts**: Understands active trip routes, budgets, and stays.
- **Action Execution**: Asking *"Can you make this trip cheaper?"* or *"Replace the flight with a train"* executes real plan option swaps and recalculates the budget.
- **Personalized Packing List**: Categorized checklists (Documents, Clothing, Toiletries, Electronics) with interactive checkboxes.

### 7. User Authentication & Travel Vault
- **Security**: JWT authentication, bcrypt password hashing, and user profile management.
- **Access Isolation**: Enforces strict user data ownership; users can only view, edit, or delete their own saved trips.
- **PDF Export**: Print-ready formatting for offline itinerary carrying.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v4, React Router DOM, Lucide React, Recharts, React Hook Form, Zod, Leaflet |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, MongoDB, JWT, bcryptjs, Zod, Morgan, CORS |
| **AI Integration** | Official Google Gen AI SDK (`@google/genai`) with server-side abstraction & deterministic fallback |
| **Testing** | Vitest unit and integration test suite |
| **Database** | Dual-mode: MongoDB connection with high-reliability in-memory / JSON store fallback |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB** (Optional): MongoDB service running on `mongodb://127.0.0.1:27017` (the backend automatically falls back to the high-reliability internal memory store if MongoDB is offline).

### 2. Install Dependencies
From the repository root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the `server` directory (a pre-configured `.env` is already included):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/travelgenie
JWT_SECRET=travelgenie_secure_jwt_secret_dev_2026
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
IS_DEMO_MODE=true
```

> **Note on Gemini API Key**: If `GEMINI_API_KEY` is left blank, TravelGenie AI activates its intelligent deterministic fallback generator, producing rich, destination-accurate itineraries without crashing or requiring API credits.

### 4. Run the Test Suite
Run the automated Vitest test suite covering the budget engine, validation rules, transport ranking, trip ownership isolation, and AI generation:
```bash
cd server
npm test
```

### 5. Start the Application
Run both servers concurrently or in separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Starts API server on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Starts Vite application on http://localhost:5173
```

Now open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 📋 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create a new user account with hashed password.
- `POST /api/auth/login`: Authenticate and receive a JWT Bearer token.
- `GET /api/auth/me`: Retrieve current logged-in user profile (Requires `Bearer <token>`).

### Trips (`/api/trips`)
- `POST /api/trips/plan`: Generate an end-to-end travel plan (outbound search, return search, accommodation search, deterministic budget, combination optimization, and AI itinerary).
- `POST /api/trips`: Save an itinerary to user profile (Requires Auth).
- `GET /api/trips`: List all saved trips for the authenticated user.
- `GET /api/trips/:id`: Retrieve trip by ID (with strict ownership verification).
- `PUT /api/trips/:id`: Update trip options and recalculate budget (Requires Auth).
- `DELETE /api/trips/:id`: Delete a saved trip (Requires Auth).

### Transport (`/api/transport`)
- `POST /api/transport/search`: Search multi-modal transport between two locations.
- `POST /api/transport/outbound`: Search outbound transport options.
- `POST /api/transport/return`: Search return transport options independently.

### Accommodations (`/api/accommodations`)
- `POST /api/accommodations/search`: Search hotels, hostels, and homestays with nightly and total-stay tariff calculations.

### Budget & Optimizer (`/api/budget`)
- `POST /api/budget/calculate`: Deterministic calculation of complete expenses, reserve, remaining budget, and shortfall insights.
- `POST /api/budget/optimize`: Evaluate combinations of outbound, return, and stays.

### AI Assistant (`/api/ai`)
- `POST /api/ai/chat`: Contextual chatbot conversation with action payload execution.
- `GET /api/ai/packing-list`: Categorized packing list generator based on destination, duration, and travel style.

---

## 🛡️ Security & Reliability Architecture
- **Password Protection**: Passwords are never stored in plaintext; salted and hashed with `bcryptjs`.
- **JWT Authorization**: All user trip vaults are guarded by signed JSON Web Tokens.
- **Ownership Verification**: Endpoints enforce that User A cannot view, mutate, or delete User B's itineraries.
- **Fail-Safe Database**: If MongoDB is unavailable or times out, the application transitions to an internal in-memory repository without crashing.
- **Safe Environment**: No secrets or private tokens are leaked to the client bundle.

---

## 📄 License
MIT License. Built for modern travelers and explorers.
