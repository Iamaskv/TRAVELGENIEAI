# Knowpedia AI — An AI-Powered Knowledge Encyclopedia

> **Explore Anything. Understand Everything.**  
> A modern, responsive, Wikipedia-inspired knowledge platform powered by Google Gemini API, engineered to deliver structured, authoritative, and beautiful encyclopedia entries.

Inspired by the academic rigor of **Wikipedia**, the analytical clarity of **Perplexity**, and the structured beauty of **Notion**.

---

## 🌟 Key Features

- **Authoritative Encyclopedia Articles**: Formatted with executive summaries, hierarchical headings (`#`, `##`, `###`), structured definitions, historical milestones, comparative tables, and takeaways.
- **Dynamic Table of Contents**: Automatically parsed from article headings with scroll-spy highlighting and smooth-scrolling section navigation.
- **Google Gemini Official SDK**: Powered by `@google/genai` with configurable models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`), server-side prompt engineering, and rate limiting.
- **Interactive Markdown Presentation**: Safe, responsive rendering of tables, formulas, blockquotes, code blocks, and lists via `react-markdown` and `@tailwindcss/typography`.
- **Offline / Curated Fallback Archive**: Ships with instant, rich encyclopedia entries for core topics so the application works seamlessly out-of-the-box even before entering your Gemini API key.
- **Local Bookmarks & Search History**: Save articles for offline reading, view recent inquiries, and manage history locally with zero third-party tracking.
- **Web Share & Clipboard Integration**: One-click article markdown copying and native mobile/desktop Web Share API with clipboard fallback.
- **Sleek Light & Dark Themes**: Handcrafted color palette with high-contrast typography, subtle glassmorphism, and smooth transitions.
- **Explore Catalog**: Browse curated topics across Science & Cosmos, Technology & AI, History & Civilizations, Mathematics & Logic, Philosophy & Mind, and Earth & Environment.

---

## 🏗️ Architecture & Technology Stack

```
knowpedia-ai/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, SearchBar, ArticleRenderer, TableOfContents, etc.
│   │   ├── pages/              # Home, Article, Explore, SavedArticles, About
│   │   ├── services/           # Axios API client (api.js)
│   │   ├── context/            # ThemeContext, HistoryContext
│   │   ├── utils/              # slugify.js, formatting helpers
│   │   ├── App.jsx             # React Router structure & search modal
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Design tokens, typography & scrollbar styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend (Node.js + Express + Google Gen AI SDK)
│   ├── controllers/            # articleController.js
│   ├── routes/                 # articleRoutes.js
│   ├── services/               # geminiService.js (official @google/genai SDK)
│   ├── prompts/                # articlePrompt.js (reusable prompt engineering)
│   ├── middleware/             # errorHandler.js, rateLimiter.js
│   ├── app.js                  # Express middleware, Helmet, CORS
│   ├── server.js               # Server bootstrap & graceful shutdown
│   ├── package.json
│   └── .env.example
├── package.json                # Root orchestration (concurrently dev scripts)
├── .gitignore
└── README.md
```

### Frontend Stack
- **React 19** with **Vite** for near-instant HMR
- **Tailwind CSS v3** with `@tailwindcss/typography`
- **React Router DOM v7** for deep-linking (`/article/:topic`, `/explore`, `/saved`, `/about`)
- **Axios** for API communication with interceptors and timeout management
- **Lucide React** for clean, accessible icons
- **React Markdown** with `remark-gfm` for safe, rich table and markdown rendering

### Backend Stack
- **Node.js** (v20+ or v24+) with native ES Modules
- **Express.js** for MVC REST API
- **Google Gen AI SDK** (`@google/genai`)
- **Helmet** for secure HTTP headers
- **express-rate-limit** for API abuse and quota protection
- **dotenv** for clean environment variable management
- **CORS** configured for local development and production origins

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### 1. Clone & Install Dependencies

From the project root:

```bash
# Install root orchestration tools
npm install

# Install both backend and frontend dependencies in one command
npm run install:all
```

Or install them individually:
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

---

## 🔑 Configuring your Google Gemini API Key

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Copy the example environment file in the `server` directory:

```bash
# In Windows PowerShell:
Copy-Item server/.env.example server/.env

# In macOS/Linux:
cp server/.env.example server/.env
```

3. Open `server/.env` and insert your API key:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Paste your Gemini API key here
GEMINI_API_KEY=AIzaSy...your_actual_key_here

# Recommended model (gemini-2.5-flash or gemini-2.0-flash)
GEMINI_MODEL=gemini-2.5-flash

REQUEST_TIMEOUT_MS=35000
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=60
```

> **Note**: If you run without a `GEMINI_API_KEY`, Knowpedia AI automatically serves pre-compiled offline encyclopedia articles for featured topics (Quantum Computing, Artificial Intelligence, etc.), so you can test the full UI immediately.

---

## 💻 Running the Application

### Running Both Frontend & Backend Concurrently (Recommended)

From the root directory:

```bash
npm run dev
```

This launches:
- **Backend API Server**: `http://localhost:5000`
- **Frontend Client**: `http://localhost:5173`

### Running Individually

**Backend Server**:
```bash
npm run dev:server
# or
cd server && npm run dev
```

**Frontend Client**:
```bash
npm run dev:client
# or
cd client && npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📦 Production Build

To build the client for production:

```bash
npm run build
```

The optimized static assets will be compiled to `client/dist/`.

To run the production backend server:
```bash
npm start
```

---

## 📡 API Specification

### 1. Generate Article
- **Endpoint**: `POST /api/articles/generate`
- **Rate Limit**: 60 requests per 15 minutes per IP

#### Request
```http
POST /api/articles/generate HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "topic": "Quantum Computing"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "title": "Quantum Computing",
  "topic": "Quantum Computing",
  "summary": "Quantum computing is a rapidly-advancing branch of computer science and quantum physics that harnesses superposition and entanglement...",
  "article": "# Quantum Computing\n\n> Quantum computing is a rapidly-advancing branch...\n\n## 1. Overview & Fundamentals\n\n...",
  "relatedTopics": [
    "Quantum Entanglement",
    "Shor's Algorithm",
    "Post-Quantum Cryptography",
    "Superconducting Qubits",
    "Quantum Teleportation",
    "Quantum Supremacy"
  ],
  "isFallback": false
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Topic is required and must be a valid text string."
}
```

### 2. Health Check
- **Endpoint**: `GET /api/health`

#### Response (200 OK)
```json
{
  "status": "ok",
  "service": "Knowpedia AI Backend",
  "timestamp": "2026-10-14T16:05:44.245Z",
  "geminiConfigured": true,
  "model": "gemini-2.5-flash",
  "uptime": 128.4
}
```

---

## 🧠 Server-Side Prompt Engineering

Located in `server/prompts/articlePrompt.js`:
- **Role**: World-class encyclopedia writer combining Wikipedia's objectivity, Perplexity's analytical clarity, and Notion's structured typography.
- **Safety**: Treats user inputs strictly as topics of inquiry, preventing prompt injections or instruction overrides.
- **Structure**: Enforces an executive definition blockquote, numbered sections, analytical tables, key takeaways, and 4-6 related disciplinary topics.
- **Neutrality**: Strictly prohibits fabricated citations, fake quotes, or speculative assertions.

---

## 🛠️ Troubleshooting Common Gemini API Errors

| Error Code / Message | Root Cause | Solution |
| :--- | :--- | :--- |
| **`API_KEY_INVALID` (401)** | The key in `server/.env` is missing or incorrect. | Verify you copied the complete key string from [Google AI Studio](https://aistudio.google.com/app/apikey). |
| **`RESOURCE_EXHAUSTED` (429)** | Exceeded free-tier Gemini API request rate limit. | Wait 60 seconds before retrying. Alternatively, change `GEMINI_MODEL=gemini-2.5-flash` which has generous rate limits. |
| **`NOT_FOUND` (404)** | Configured model name does not exist. | Ensure `GEMINI_MODEL=gemini-2.5-flash` or `gemini-2.0-flash` in `server/.env`. |
| **`ECONNREFUSED` on port 5000** | Express server is not running. | Run `npm run dev:server` in terminal. |
| **`CORS Error` in Browser** | Client origin does not match `FRONTEND_ORIGIN`. | Ensure `FRONTEND_ORIGIN=http://localhost:5173` matches the Vite dev server port. |

---

## 🔒 Security Best Practices Implemented

- **Backend-Only Credentials**: The Gemini API key never touches the browser or client bundles.
- **Input Sanitization**: Length validation (2-250 characters) and HTML tag stripping.
- **Rate Limiting**: Protected against denial-of-service and quota drain via `express-rate-limit`.
- **HTTP Security Headers**: Powered by `helmet`.
- **Safe Markdown Rendering**: `react-markdown` strictly escapes unvetted HTML scripts.

---

## 📄 License

MIT License. Open-source educational software.
#   T R A V E L G E N I E A I  
 