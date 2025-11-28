# Sentry Setup - Quick Guide

**Status**: ✅ Code integrated, need DSN configuration

---

## ✅ What's Done:

1. ✅ Installed `@sentry/nextjs` package
2. ✅ Created 3 config files:
   - `sentry.client.config.ts` (frontend errors)
   - `sentry.server.config.ts` (backend errors)
   - `sentry.edge.config.ts` (middleware errors)
3. ✅ Integrated with Next.js build (`next.config.ts`)
4. ✅ Committed to Git

---

## 🎯 Next Steps (Anh làm):

### Step 1: Create Sentry Account (2 phút)

1. Mở browser: https://sentry.io/signup/
2. Sign up với email

### Step 2: Create Project (1 phút)

1. Chọn **Next.js** platform
2. Project name: `apex-os-saas`
3. Team: `apex-os` (or your name)
4. Click **Create Project**

### Step 3: Get DSN (30 giây)

Sentry dashboard sẽ show DSN string như này:
```
https://xxxxxxxxxxx@oxxxxx.ingest.sentry.io/xxxxxx
```

### Step 4: Add to Environment (30 giây)

```bash
# Create .env.local (nếu chưa có)
touch .env.local

# Add DSN
echo "NEXT_PUBLIC_SENTRY_DSN=your_dsn_here" >> .env.local

# Replace 'your_dsn_here' with actual DSN from Sentry
```

### Step 5: Test (1 phút)

```bash
# Restart dev server
npm run dev

# Trigger a test error:
# - Go to any page
# - Open browser console
# - Type: throw new Error("Sentry test error")
# - Check Sentry dashboard for the error!
```

---

## 🔥 Why This Matters:

**Before Sentry**:
- Errors happen in production
- Users complain
- Anh không biết gì
- Debugging khó

**After Sentry**:
- Error → instant notification
- Full stack trace
- User context (browser, OS, etc.)
- Replay session to see what happened
- Fix trước khi users complain!

---

## 📊 What Sentry Tracks:

- ✅ Frontend errors (React crashes)
- ✅ Backend errors (API failures)
- ✅ Performance issues (slow pages)
- ✅ User sessions (replay what they did)
- ✅ Release tracking (which deploy caused issues)

---

## ⚡ Quick Start:

If anh muốn skip Sentry setup ngay:

```bash
# Just add this to .env.local (will work but no error tracking)
echo "NEXT_PUBLIC_SENTRY_DSN=" >> .env.local

# App will run normally, but errors won't be tracked
# Can setup Sentry later khi có time
```

---

**Week 1 Action #1: 90% COMPLETE!** ✅

Chỉ còn DSN configuration! 🎯
