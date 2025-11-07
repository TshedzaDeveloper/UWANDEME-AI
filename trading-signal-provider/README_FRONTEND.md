# Frontend Dashboard Setup

## Quick Start

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Update `.env` with your backend URL:**
```
VITE_API_URL=http://localhost:8000
```

5. **Start development server:**
```bash
npm run dev
```

6. **Open browser:**
Visit `http://localhost:3000`

## Features

### 📊 Real-time Trading Signals
- View all generated trading signals
- Filter by currency pair
- See buy/sell signals with stop loss and take profit levels
- Historical signal tracking

### 📈 TradingView Charts
- Interactive charts for each currency pair
- Pre-loaded with EMA (8, 21) and RSI (14) indicators
- Switch between different pairs
- Real-time price updates

### 📅 Forex Calendar
- Upcoming news events
- Impact levels (High, Medium, Low)
- Event times and currencies
- Color-coded by impact

### 📱 Responsive Design
- Works on desktop, tablet, and mobile
- Modern glassmorphism UI
- Dark theme optimized for trading

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variable `VITE_API_URL` to your backend URL

### Option 2: Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to Netlify

3. Set environment variable `VITE_API_URL` in Netlify dashboard

### Option 3: Deploy to Render

1. Create a new Static Site service
2. Connect your GitHub repository
3. Set:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Environment variable: `VITE_API_URL=https://your-backend.onrender.com`

## Environment Variables

- `VITE_API_URL`: Your backend API URL (default: http://localhost:8000)

## Troubleshooting

### TradingView Chart Not Loading
- Make sure you have an internet connection
- Check browser console for errors
- TradingView requires an active internet connection

### API Connection Errors
- Verify your backend is running
- Check `VITE_API_URL` in `.env`
- Ensure CORS is enabled on the backend

### Build Errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --force`

