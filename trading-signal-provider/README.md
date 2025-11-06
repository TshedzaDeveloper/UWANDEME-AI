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

Open `http://localhost:8000/signals` to fetch recent stored signals.

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

Minimal steps:
1) Push this repo to GitHub.
2) Create a new Render Web Service:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3) Add Environment Variables (from `.env.example`).
4) Set instance to have enough memory for pandas if needed.

Optional: add a `render.yaml` later for IaC.

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


