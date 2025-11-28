# System Architecture

```mermaid
graph TD
    User[User / Client] -->|HTTPS| CDN[Vercel Edge Network]
    CDN -->|Next.js App| FE[Frontend (React/Tailwind)]
    
    subgraph "Apex OS Cloud"
        FE -->|API Routes| API[Next.js API Layer]
        
        subgraph "Backend Services"
            API -->|Auth/Data| DB[(Supabase PostgreSQL)]
            API -->|Rate Limit| Redis[(Redis)]
            API -->|Tasks| Queue[Job Queue]
            
            Agent[AI Agents (Python)] -->|Read/Write| DB
            Agent -->|Analysis| ML[ML Models]
        end
        
        subgraph "External Integrations"
            Binance[Binance API] <--> Agent
            Binance <--> API
            Polar[Polar.sh] -->|Webhooks| API
            Sentry[Sentry] <--|Logs| FE
            Sentry <--|Logs| API
        end
    end
```
