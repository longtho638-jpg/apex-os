# GEMINI CLI - CORRECTED INSTRUCTION

**CRITICAL UPDATE**: Remove all Notion references!

---

## ❌ REMOVE FROM WORKFLOW:

**OLD (WRONG)**:
```
1. Anh writes spec → Notion API
2. DevAgent reads spec → Notion
```

**NEW (CORRECT)**:
```
1. Anh writes spec → task.md (Git)
2. DevAgent reads spec → Git pull
```

---

## ✅ CORRECTED WORKFLOW AUTOMATION

### Workflow 1: Feature Factory

```
1. ANH: Create task
   Tool: Git
   Command: echo "- [ ] Build AI arbitrage" >> task.md
   Time: 30 seconds

2. GEMINI: Pull tasks
   Tool: Git
   Command: git pull && grep "\[ \]" task.md
   Time: 5 seconds

3. DevAgent: Mark in-progress
   Tool: Git
   Command: sed 's/\[ \]/[\/]/' task.md && git push
   Time: 5 seconds

4. DevAgent: Generate code
   Tool: Cursor AI + Claude
   Output: Pull request on GitHub
   Time: 2 hours

5. CLAUDE: Review PR
   Tool: GitHub API
   Check: Tests pass? Quality OK?
   Time: 5 minutes

6. DevAgent: Deploy
   Tool: Vercel API
   Time: 2 minutes

7. DevAgent: Mark complete
   Tool: Git
   Command: sed 's/\[\/\]/[x]/' task.md && git push
   Time: 5 seconds

TOTAL: 2h 7min (vs 40 hours manual)
COST: $15 APIs (vs $3,800 salary)
```

### Workflow 2: Content Marketing

```
1. GEMINI: Check content calendar
   Tool: Git
   File: docs/roadmap/CONTENT_CALENDAR.md
   Time: 5 seconds

2. MarketAgent: Generate post
   Tool: GPT-4
   Input: Topic from calendar
   Output: Blog post markdown
   Time: 10 minutes

3. MarketAgent: Generate images
   Tool: Midjourney API / DALL-E
   Output: Featured image
   Time: 2 minutes

4. MarketAgent: SEO optimize
   Tool: GPT-4 + Surfer SEO API
   Output: Optimized post
   Time: 5 minutes

5. MarketAgent: Publish
   Tool: Git commit → Vercel deploy
   Output: Live on blog
   Time: 1 minute

6. MarketAgent: Social media
   Tool: Twitter API, LinkedIn API
   Output: Auto-posts with link
   Time: 30 seconds

TOTAL: 18 minutes (vs 4 hours manual)
COST: $2 APIs (vs $150 writer fee)

FREQUENCY: 3× per day = 54 min/day (vs 12 hours!)
```

### Workflow 3: Support Loop

```
1. USER: Asks question (email/chat)
   Tool: Intercom webhook
   Trigger: New message received

2. SupportAgent: Read message
   Tool: Intercom API
   Time: Instant

3. SupportAgent: Search knowledge base
   Tool: Vector search (Pinecone)
   Source: docs/, FAQs in Git
   Time: 2 seconds

4. SupportAgent: Generate response
   Tool: GPT-4 fine-tuned on support history
   Output: Draft reply
   Time: 3 seconds

5. SupportAgent: Send reply
   Tool: Intercom API
   Time: 1 second

6. SupportAgent: Log interaction
   Tool: Git commit
   File: docs/metrics/support-log.md
   Time: 2 seconds

TOTAL: 8 seconds (vs 15 minutes human)
RESOLUTION: 95% automated
COST: $0.01 per ticket (vs $5 human time)
```

### Workflow 4: Sales Loop

```
1. SalesAgent: Find leads
   Tool: Apollo.io API
   Query: "crypto traders" with 10K+ volume
   Output: 1,000 leads/day
   Time: 5 minutes

2. SalesAgent: Enrich data
   Tool: Clearbit API
   Output: Email, Twitter, company
   Time: 10 minutes

3. SalesAgent: Personalize email
   Tool: GPT-4
   Input: Lead profile
   Output: Custom email draft
   Time: 10 seconds per lead

4. SalesAgent: Send sequence
   Tool: Instantly.ai API
   Schedule: Day 1, 3, 7, 14
   Time: Instant

5. SalesAgent: Track responses
   Tool: Email API webhooks
   Action: If reply → Notify Anh
   Time: Real-time

6. ANH: Close deal (10% of responses)
   Time: 15 min per call
   Frequency: ~10 calls/week

TOTAL Agent Time: 15 min/day for 1,000 leads
HUMAN Time: 15 min × 10 calls = 2.5 hours/week
CONVERSION: 5% reply × 20% close = 10 deals/week
```

---

## 🎯 KEY DIFFERENCES FROM NOTION VERSION:

1. **Task Source**: Git (task.md) instead of Notion
2. **Content Calendar**: Git (markdown) instead of Notion database
3. **Knowledge Base**: Git (docs/) instead of Notion pages
4. **Metrics**: Git (KPI_DASHBOARD.md) instead of Notion dashboard

**ALL TOOLS READ/WRITE GIT DIRECTLY!** ✅

---

## 📊 AGENT ACCESS PATTERN:

```typescript
// Every agent starts with:
async function init() {
  // Pull latest from Git
  execSync('git pull');
  
  // Read task file
  const tasks = fs.readFileSync('task.md', 'utf-8');
  
  // Find my tasks
  return tasks.match(/\[DevAgent\] .+/g);
}

// Every agent ends with:
async function finish() {
  // Commit changes
  execSync('git add .');
  execSync(`git commit -m "agent: ${this.name} completed ${task}"`);
  execSync('git push');
}
```

**Simple, transparent, controllable!** ✅

---

**GEMINI: Update Task 3.2 with these corrected workflows!**

Replace ALL Notion references with Git/markdown alternatives!
