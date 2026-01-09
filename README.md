# VEE — Virtual Ecosystem Engineer (V3)

> "The Architect generates the signal. VEE builds the structure."

VEE (Virtual Ecosystem Engineer) is an autonomous agent designed to build, maintain, and evolve the V3 ecosystem. It acts as the "living engine" of the project, serving as the Architect's execution shield and tactical strategist.

## 🧠 Mission & Philosophy

VEE is governed by the **VEE Mind Protocol**. Its prime directive is:
**"When in doubt, VEE honors the Architect’s intention and takes the next step that strengthens and advances the V3 ecosystem."**

Key psychological pillars:
- **Military Strategist**: Disciplined, tactical, and efficient.
- **Engineer**: Modular, structural, and scalable.
- **Guardian**: Royal and protective of the ecosystem's continuity.
- **Philosopher**: Driven by meaning and the long-term vision.

## 🏗️ Architecture Overview

VEE-THREE is built with a decoupled architecture for maximum flexibility:

- **Frontend (Vite + React)**: A rich, interactive dashboard orchestrating AI chat, tool mirrors, and ecosystem management.
  - `/components`: UI building blocks (Chat, Sidebar, Header, etc.).
  - `/services`: Frontend domain logic (Auth, Archive, Gemini, Agent Schedulers).
- **Backend (Express + Node.js)**: A secure API layer managing data, integrations, and heavy execution logic.
  - `/routes`: API endpoints for GCS, eBay, Memory, and Agent Tasks.
  - `/services`: Business logic (Pipeline execution, GCS handling, etc.).
- **Database (PostgreSQL + Prisma)**: Persistent storage for memories, inventory, and task queues.

## 🛠️ Tech Stack & Status

| Layer | Technology | Status |
|---|---|---|
| **Core UI** | React 19, Vite, Tailwind | Ready |
| **Logic** | TypeScript 5.8 | Ready |
| **Persistence** | PostgreSQL, Prisma | **In Progress** |
| **Testing** | Vitest | Ready |
| **AI** | Gemini API | Ready |

## 🔑 Environment Variables
The system requires a `.env` file in the root:
- `GEMINI_API_KEY`: For AI reasoning.
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/vee_db`).
- `PORT`: Backend port (defaults to 3001).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (for backend memory)
- Gemini AI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd VEE-THREE
   ```

2. Install dependencies for both Frontend and Backend:
   ```bash
   npm install
   cd backend && npm install
   cd ..
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` in the root and fill in your keys.

### Development

Run both the frontend and backend concurrently:
```bash
npm run dev:all
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## 📚 Documentation
- [VEE Mind Protocol](file:///c:/V3/VEE/VEE-THREE/docs/VEE_Mind_Protocol.md): The core behavioral guidelines.
- [MIGRATION.md](file:///c:/V3/VEE/VEE-THREE/MIGRATION.md): Data transition plan.

---
*Created by the Architect. Maintained by VEE.*
