## Trading Signal Provider (Python + FastAPI)

Simple signal provider that:
- Pulls real-time candles (TradingView or equivalent API)
- Pulls Forex calendar news (impact levels, timestamps)
- Generates EMA(8/21) crossover + RSI confirmation signals
- Avoids trading around high-impact news (configurable minutes)
- Detects sessions (London, New York) heuristically
- Persists signals to SQLite
- Exposes REST endpoint `/signals`
- Background worker polls every 30-60s (configurable)

### Project Structure

```
trading-signal-provider/
├─ backend/
│  ├─ main.py
│  ├─ signal_engine.py
│  ├─ data_fetcher.py
│  ├─ db.py
│  ├─ config.py
│  └─ requirements.txt
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ services/
│  │  └─ App.tsx
│  ├─ package.json
│  └─ vite.config.ts
├─ .env.example
└─ README.md
```

### Requirements

See `backend/requirements.txt`:

```
fastapi
uvicorn[standard]
httpx
pandas
numpy
python-dotenv
aiosqlite
pydantic
```

### Setup (Local)

1) Create and activate virtualenv

```bash
python -m venv venv
# mac/linux
source venv/bin/activate
# windows
venv\Scripts\activate
```

2) Install deps

```bash
pip install -r backend/requirements.txt
```

3) Configure environment

```bash
cp .env.example .env
# Fill your API keys and settings in .env
```

4) Run API

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

5) Run Frontend Dashboard (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to view the dashboard.

API will be available at `http://localhost:8000/signals`

Notes:
- `backend/data_fetcher.py` contains mock data so the app runs offline. Replace TODOs with real vendor requests.
- SQLite DB path is `signals.db` by default (configurable).

### Configuration

Set via `.env` (see `.env.example`):
- `TRADINGVIEW_API_URL`, `TRADINGVIEW_API_KEY`
- `FOREX_CALENDAR_API_URL`, `FOREX_CALENDAR_API_KEY`
- `SYMBOLS` (comma-separated, e.g., `EURUSD,GBPUSD,USDJPY`)
- `POLL_INTERVAL_SECONDS` (e.g., 60)
- `NEWS_AVOID_MINUTES` (e.g., 15)
- `DB_PATH` (e.g., `signals.db`)

### Strategy (Initial)

- EMA crossover: 8 over 21 for BUY; 8 under 21 for SELL
- RSI confirmation: BUY if RSI in (45, 75), SELL if RSI in (25, 55)
- Session awareness: London (07:00-16:00 UTC), New York (12:00-21:00 UTC)
- News filter: Skip signals within `NEWS_AVOID_MINUTES` of high-impact events

### Vendor API TODOs

- Trading data source (TradingView or broker API):
  - Implement in `backend/data_fetcher.py::fetch_candles_tradingview`
  - Expected output: pandas DataFrame indexed by UTC datetime with columns `open,high,low,close,volume`
  - Example mock candle JSON (vendor-specific):
    ```json
    {"t": 1730895600, "o": 1.0712, "h": 1.0715, "l": 1.0709, "c": 1.0710, "v": 1200}
    ```

- Forex calendar provider:
  - Implement in `backend/data_fetcher.py::fetch_news_calendar`
  - Expected output: list of events with `time` (ISO UTC), `impact` (low/medium/high), `pair`, `title`
  - Example mock event JSON:
    ```json
    {"time": "2025-11-06T12:30:00Z", "pair": "USD", "impact": "high", "title": "NFP"}
    ```

### Deploy to Render

#### Steps:

1. **Push to GitHub**: Push this repository to GitHub (public or private).

2. **Create Render Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (`UWANDEME-AI`)
   - Use these settings:
     - **Name**: `trading-signal-provider` (or your choice)
     - **Environment**: `Python 3`
     - **Root Directory**: `trading-signal-provider` ⚠️ **IMPORTANT**: Set this in Advanced settings
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free tier works, but consider paid for better performance
   
   **Note**: If you're using `render.yaml`, the rootDir is already configured. If setting up manually, make sure to set the Root Directory to `trading-signal-provider` in the Advanced settings section.

3. **Add Environment Variables** in Render Dashboard → Environment tab:
   ```
   TRADINGVIEW_API_URL=https://api.tradingview.example
   TRADINGVIEW_API_KEY=your_actual_api_key_here
   FOREX_CALENDAR_API_URL=https://api.forexcalendar.example
   FOREX_CALENDAR_API_KEY=your_actual_api_key_here
   SYMBOLS=EURUSD,GBPUSD,USDJPY
   POLL_INTERVAL_SECONDS=60
   NEWS_AVOID_MINUTES=15
   DB_PATH=signals.db
   ENV=production
   ```

4. **Deploy**: Click "Create Web Service" and wait for deployment.

5. **Access**: Your API will be available at `https://your-service-name.onrender.com/signals`

**Note**: The SQLite database (`signals.db`) is ephemeral on Render free tier. For production, consider using a persistent database (PostgreSQL) or external storage.

### Test Plan

Goal: verify signal generation and persistence without live vendors.

1) Use built-in mocks (no API keys needed):
   - Start the app; background worker runs every `POLL_INTERVAL_SECONDS`.
   - Hit `GET /signals` and confirm an array (possibly empty at start).

2) Force signals for simulation:
   - Temporarily tweak `data_fetcher.fetch_candles_tradingview` mock to generate a clear EMA cross (e.g., slope up then down) and watch `/signals` populate.

3) Verify DB persistence:
   - Inspect `signals.db` with any SQLite viewer; confirm `signals` table rows.

4) Verify news filter:
   - Modify `fetch_news_calendar` mock to return a `high` impact event within the next 10 minutes and confirm no new signals are saved during that window.

5) Verify session detection:
   - Adjust system time or feed candle timestamps that fall in London vs. New York windows and observe the `reason` field include the session.


