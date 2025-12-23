<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1VH_HtmboyWRrHN6QEFjBuKnOXWHSajKP

# VEE-THREE: Virtual Ecosystem Engineer

**VEE-THREE** is the central interface for the V3 Ecosystem, designed to act as a "Virtual Ecosystem Engineer." It combines AI-driven creativity, task management, and ecosystem integration into a single dashboard.

## Architecture Overview

VEE-THREE is a full-stack application:

*   **Frontend**: React + Vite + TailwindCSS. Handles the UI, Chat Interface, and simulated "Creative Archive".
*   **Backend**: Node.js + Express + TypeScript + PostgreSQL. Handles Authentication, API proxying, and Vector Memory.
*   **AI Engine**: Powered by Google Gemini.

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm
*   PostgreSQL (Local or hosted)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd VEE-THREE
    ```

2.  **Install Dependencies**:
    ```bash
    # Install frontend dependencies
    npm install

    # Install backend dependencies
    cd backend
    npm install
    cd ..
    ```

3.  **Configure Environment**:
    *   Copy `.env.template` to `.env`.
    *   **Required**: `GEMINI_API_KEY`, `DATABASE_URL`.
    *   **Auth**: `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID` (or use test mode).

4.  **Database Setup**:
    *   Start Postgres.
    *   Run Schema: `psql $DATABASE_URL -f backend/src/schema.sql`

5.  **Run the Application**:
    ```bash
    # Run both Frontend and Backend concurrently
    npm run dev:all
    ```
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:3001`

### Data Migration
If you have existing data in `core_memory.json`, refer to `MIGRATION.md`.

## Features
*   **Secure Authentication**: Google & GitHub OAuth.
*   **Persistent Memory**: Vector-based memory storage (Backend).
*   **Chat Interface**: Multimodal chat with file uploads (PDF, ZIP, Images).
*   **Creative Archive**: Simulated file storage for project assets.
