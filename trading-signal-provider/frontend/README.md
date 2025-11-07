# Uwandeme AI Dashboard Frontend

A beautiful, modern React dashboard for viewing trading signals, forex calendar, and TradingView charts.

## Features

- 📊 Real-time trading signals display
- 📈 Integrated TradingView charts
- 📅 Forex calendar with upcoming news events
- 📱 Responsive design
- 🎨 Modern glassmorphism UI
- ⚡ Real-time updates every 30 seconds

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploy

The frontend can be deployed to:
- Vercel
- Netlify
- Render (static site)
- Any static hosting service

Make sure to set the `VITE_API_URL` environment variable to your backend API URL.

