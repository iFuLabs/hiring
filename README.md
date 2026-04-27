# iFu Labs — Cloud Engineer Assessment Portal

A web-based timed assessment portal for evaluating Junior Cloud Engineer candidates (AWS CCP level). Features auto-grading, email notifications, camera monitoring, and anti-cheat detection.

## Features

- **20 Questions**: 15 standard MCQs + 5 scenario-based questions
- **30-Minute Timer**: Auto-submits when time expires
- **Auto-Grading**: Instant scoring with performance bands (Strong / متوسط / ضعيف)
- **Email Notifications**: Results sent to admin via SMTP
- **Camera Monitoring**: Optional webcam feed with consent screen
- **Anti-Cheat**: Tab switch detection, fullscreen mode, warning banners
- **Randomized Questions**: Question order shuffled per session
- **Session Resume**: Candidates can resume if they refresh the page
- **Admin API**: View results and export as CSV
- **Mobile Responsive**: Optimized for desktop, works on mobile

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React 19, Vite              |
| Backend  | Node.js, Express            |
| Database | MongoDB (Mongoose)          |
| Email    | Resend                      |
| Security | Helmet, CORS, Rate Limiting |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
cd HIRING
npm run install:all
```

Or install separately:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ifu-assessment
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPLY_TO_EMAIL=info@ifulabs.com
ADMIN_EMAIL=info@ifulabs.com
API_SECRET=your-random-secret-key
```

**Resend Setup**: Get your API key from [resend.com/api-keys](https://resend.com/api-keys). To send from your own domain (e.g. `info@ifulabs.com`), verify the domain in Resend first. Otherwise emails will come from `onboarding@resend.dev`.

### 3. Run Development

Terminal 1 — Backend:
```bash
cd server && npm run dev
```

Terminal 2 — Frontend:
```bash
cd client && npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/assessment/start`   | Start a new session      |
| POST   | `/api/assessment/submit`  | Submit answers           |
| GET    | `/api/assessment/results` | View all results (admin) |
| GET    | `/api/assessment/export`  | Export CSV (admin)       |
| GET    | `/api/health`             | Health check             |

Admin endpoints require `?secret=YOUR_API_SECRET` query parameter.

## Deployment

### Frontend (Vercel / Netlify)

```bash
cd client && npm run build
```

Set the `VITE_API_URL` environment variable to your backend URL if deploying separately.

### Backend (Render / Railway)

1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Set `CLIENT_URL` to your frontend URL
4. Start command: `node index.js`

### Single Server (Production)

The backend serves the built frontend in production mode:

```bash
cd client && npm run build
cd ../server
NODE_ENV=production node index.js
```

## Project Structure

```
HIRING/
├── client/                  # React frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConsentScreen.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── QuestionView.jsx
│   │   │   ├── RegistrationForm.jsx
│   │   │   ├── ResultsScreen.jsx
│   │   │   ├── TimerBar.jsx
│   │   │   ├── WarningBanner.jsx
│   │   │   └── WebcamFeed.jsx
│   │   ├── hooks/
│   │   │   ├── useAntiCheat.js
│   │   │   ├── useTimer.js
│   │   │   └── useWebcam.js
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── server/                  # Express backend
│   ├── data/
│   │   └── questions.js     # Question bank + grading
│   ├── models/
│   │   ├── Session.js
│   │   └── Submission.js
│   ├── routes/
│   │   └── assessment.js
│   ├── services/
│   │   └── emailService.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
└── package.json
```

## Security

- Correct answers are **never** sent to the client
- Rate limiting on all API endpoints (stricter on submit)
- Helmet security headers
- Input validation on all endpoints
- Session-based access control
- CORS restricted in production
