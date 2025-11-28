# Workflow Automation Map (Git-Based)

**Date**: 2025-11-27
**Strategy**: 100% Git-Centric Control. No external SaaS dependencies.

## 🏭 1. The Feature Factory (Speed: 2h 22m vs 40h)
*From Markdown Task to Production*

| Step | Actor | Action | Tool | Time |
|------|-------|--------|------|------|
| 1 | **Anh** | Adds task to `task.md` & creates feature branch | Git / Bash | 5 min |
| 2 | **ProductAgent** | Reads `task.md`, creates spec in `docs/specs/` | LLM + Git | 10 min |
| 3 | **DevAgent** | Reads spec, generates code, runs tests | Cursor AI | 2h 00m |
| 4 | **Claude** | Reviews diff (`git diff main..feature`) | API | 5 min |
| 5 | **DevAgent** | Commits fix, pushes to origin | Git | 15 min |
| 6 | **CI/CD** | Auto-deploys on merge to main | Vercel | 2 min |
| 7 | **OpsAgent** | Updates `task.md` status to `[x]` | Git | 1 min |
| **TOTAL** | **Agents** | **Production Ready Feature** | **Cost: $15** | **2h 38m** |

## 🚀 2. The Growth Loop (Speed: Daily vs Weekly)
*From Markdown Content to Customer*

| Step | Actor | Action | Tool | Frequency |
|------|-------|--------|------|-----------|
| 1 | **ProductAgent** | Creates topic file in `content/ideas/` | Git | Daily |
| 2 | **MarketAgent** | Writes draft in `content/drafts/YYYY-MM-DD-topic.md` | LLM + Git | Daily |
| 3 | **Anh** | Reviews & Merges PR to `content/published/` | GitHub | Daily |
| 4 | **MarketAgent** | Detects merge, posts to X/LinkedIn | API | Daily |
| 5 | **MarketAgent** | Logs metrics to `marketing/metrics.csv` | Git | 24/7 |
| **RESULT** | **Swarm** | **10k Impressions -> 50 Leads** | **Cost: $2** | **Auto** |

## 🛡️ 3. The Support Loop (Speed: <1m vs 24h)
*From Git Issue to Resolution*

| Step | Actor | Action | Tool | Time |
|------|-------|--------|------|------|
| 1 | **User** | Submits issue (via form -> GitHub Issue) | GitHub | 0s |
| 2 | **SupportAgent** | Reads issue, checks `docs/` knowledge base | RAG | 5s |
| 3 | **SupportAgent** | Comments with solution or labels "bug" | GitHub API | 10s |
| 4 | **DevAgent** | If "bug": Creates branch, fixes, PRs | Git | Auto |
| 5 | **SupportAgent** | Closes issue when PR merged | GitHub API | 5s |
| **RESULT** | **Swarm** | **Issue Closed** | **Cost: $0.10** | **< 30s** |

## 💰 4. The Sales Loop (Speed: 24/7 Hunting)
*From Lead File to Deal*

| Step | Actor | Action | Tool |
|------|-------|--------|------|
| 1 | **SalesAgent** | Appends leads to `sales/leads.csv` | Git |
| 2 | **SalesAgent** | Enriches data, updates CSV | Clay/Git |
| 3 | **SalesAgent** | Sends outreach, logs ID in CSV | API |
| 4 | **Anh** | Checks `sales/leads.csv` for "Qualified" | Git |
| 5 | **Human** | Takes the Demo Call | Zoom |

---
*Next: Cost Optimization Plan*