# Quick Start Guide

## Run Locally with Python

### Option 1: Using run.py (Recommended)

```bash
cd trading-signal-provider
python run.py
```

The server will start at `http://127.0.0.1:8000`

### Option 2: Using uvicorn directly

```bash
cd trading-signal-provider
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Option 3: Using the main.py directly

```bash
cd trading-signal-provider
python -m backend.main
```

## Test the API

Once the server is running, open your browser or use curl:

```bash
# Get recent signals
curl http://127.0.0.1:8000/signals

# Or open in browser
http://127.0.0.1:8000/signals

# View API docs
http://127.0.0.1:8000/docs
```

## Environment Variables for Render

When deploying to Render, add these environment variables in your Render dashboard:

### Required Variables:

```
TRADINGVIEW_API_URL=https://api.tradingview.example
TRADINGVIEW_API_KEY=your_key_here
FOREX_CALENDAR_API_URL=https://api.forexcalendar.example
FOREX_CALENDAR_API_KEY=your_key_here
SYMBOLS=EURUSD,GBPUSD,USDJPY
POLL_INTERVAL_SECONDS=60
NEWS_AVOID_MINUTES=15
DB_PATH=signals.db
ENV=production
```

### Where to Add in Render:

1. Go to your Render service dashboard
2. Click on **Environment** tab
3. Click **Add Environment Variable**
4. Add each variable one by one, or use **Bulk Edit** to paste all at once

### Render Service Settings:

- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Python Version**: 3.11 or 3.12

## Troubleshooting

### Server won't start locally

1. Make sure you're in the `trading-signal-provider` directory
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Check if port 8000 is already in use: Try `python run.py` on a different port by setting `PORT=8001 python run.py`

### Import errors

Make sure you have the `backend/__init__.py` file (it should be created automatically)

### Database errors

The SQLite database will be created automatically on first run. Make sure the directory is writable.

## Next Steps

1. Replace mock data in `backend/data_fetcher.py` with real API calls
2. Configure your API keys in `.env` file (or Render environment variables)
3. Customize signal strategy in `backend/signal_engine.py`
4. Monitor logs for signal generation

