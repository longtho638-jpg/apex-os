# Apex Financial OS - Project Structure

This document outlines the "Monolithic Modular" structure of the Apex Financial OS project.

## Root Directory (`/`)
- **`src/`**: Frontend Application (Next.js 14).
    - **`app/`**: App Router pages and layouts.
    - **`components/`**: React components (UI, Apps, OS).
    - **`lib/`**: Utility functions and frontend state (Zustand).
- **`backend/`**: Backend Application (Python FastAPI).
    - **`api/`**: API Endpoints exposed to the frontend.
    - **`agents/`**: The "Wolf Pack" - Autonomous agents.
    - **`core/`**: Configuration, Database, and Security.
- **`public/`**: Static assets.

## Backend Detail (`backend/`)
### Agents (`backend/agents/`)
- **`collector.py`**: **The Collector**. Connects to exchanges (Binance, Bybit) via `ccxt` to fetch trade data.
- **`auditor.py`**: **The Auditor**. Analyzes trade data for discrepancies and calculates rebates.
- **`guardian.py`**: **The Guardian**. AI-powered risk analysis and alerts.

### API (`backend/api/`)
- **`main.py`**: Entry point for the FastAPI server.
- **`routes.py`**: API route definitions.

## Key Technologies
- **Frontend**: Next.js, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Python, FastAPI, CCXT, Pandas.
- **Database**: Supabase (PostgreSQL).
