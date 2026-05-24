# 🚖 CabTrack — Employee Cab Ride Manager

A full-stack web app to manage employee cab rides.
Employees check in/out, durations are auto-calculated, and admins can export everything to Excel.

---

## 📁 Folder Structure

```
cabtrack/
├── backend/          ← Node.js + Express API
│   ├── db/           ← PostgreSQL pool & schema
│   ├── middleware/   ← JWT auth
│   ├── routes/       ← auth, rides, admin
│   └── server.js     ← Entry point
├── frontend/
│   └── index.html    ← Complete UI (single file)
├── setup.sh          ← One-click local setup
├── netlify.toml      ← Netlify config
└── .github/          ← Auto-deploy on git push
```

---

## 🖥 Run Locally (5 minutes)

### Requirements
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/)

### Steps

```bash
# 1. Run the setup script
bash setup.sh

# 2. Create the database
createdb cabtrack
# OR if that doesn't work:
psql -U postgres -c "CREATE DATABASE cabtrack;"

# 3. Start the server (it auto-creates all tables on first run)
cd backend
npm run dev

# 4. Open the frontend
# Just double-click frontend/index.html
# OR open http://localhost:3001 if you want to serve it from backend
```

**Admin login:**
| Field | Value |
|---|---|
| Email | admin@company.com |
| Emp ID | ADMIN |
| Password | Admin@123 |

---

## 🚀 Deploy Free in 3 Steps

### Step 1 — Push to GitHub

1. Create a free account at [github.com](https://github.com)
2. Click **New Repository** → name it `cabtrack` → **Create**
3. Run these commands in your terminal:

```bash
cd cabtrack
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cabtrack.git
git push -u origin main
```

---

### Step 2 — Deploy Backend on Railway (free)

Railway hosts your Node.js backend + PostgreSQL database for free.

1. Go to [railway.app](https://railway.app) → **Sign up with GitHub**

2. Click **New Project** → **Deploy from GitHub repo** → select `cabtrack`

3. When it asks for the root directory, type: `backend`

4. Click **Add Service** → **Database** → **PostgreSQL**
   Railway will auto-connect the database.

5. Go to your **backend service** → **Variables** tab → add:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | *(generate one: run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)* |
   | `FRONTEND_URL` | `*` *(update after Netlify step)* |

6. Go to **Settings** → **Start Command** → set to: `node server.js`

7. Click **Deploy**. After it goes green, copy your Railway URL.
   It looks like: `https://cabtrack-production.up.railway.app`

8. The server auto-creates the database tables on first boot ✅

---

### Step 3 — Deploy Frontend on Netlify (free)

1. Go to [netlify.com](https://netlify.com) → **Sign up with GitHub**

2. Click **Add new site** → **Import from GitHub** → select `cabtrack`

3. Set:
   - **Base directory:** `frontend`
   - **Build command:** *(leave empty)*
   - **Publish directory:** `frontend`

4. Click **Deploy site**

5. Netlify gives you a URL like `https://cabtrack-xyz.netlify.app`

6. **Last step:** Go back to Railway → your backend → **Variables** → update:
   ```
   FRONTEND_URL = https://cabtrack-xyz.netlify.app
   ```

---

## ✅ You're Live!

Share the **Netlify URL** with all your employees. That's the only link they need.

| What | URL |
|---|---|
| App (share this) | `https://cabtrack-xyz.netlify.app` |
| Backend API | `https://cabtrack-production.up.railway.app/api` |

---

## 🔐 Admin Account

Default credentials (change after first login by re-seeding or adding a reset endpoint):

| Field | Value |
|---|---|
| Email | admin@company.com |
| Employee ID | ADMIN |
| Password | Admin@123 |

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register employee |
| POST | /api/auth/login | Login |
| POST | /api/rides/checkin | Employee check-in |
| POST | /api/rides/checkout | Employee check-out |
| GET | /api/rides/mine | My ride history |
| GET | /api/rides/stats | My stats |
| GET | /api/admin/stats | Admin overview |
| GET | /api/admin/rides | All rides (filterable) |
| GET | /api/admin/rides/export | Export data for Excel |
| GET | /api/admin/employees | All employees |

---

## 🆘 Common Issues

**"Cannot connect to database"**
→ Make sure PostgreSQL is running and DATABASE_URL in `.env` is correct.

**"Invalid token" after page refresh**
→ Token is stored in localStorage. Clear it and log in again.

**CORS error in browser**
→ Set `FRONTEND_URL` in Railway variables to your exact Netlify URL.

**Railway build fails**
→ Make sure Root Directory is set to `backend` in Railway settings.
