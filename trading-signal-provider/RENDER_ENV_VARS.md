# Render Environment Variables

Copy these environment variables into your Render Web Service dashboard (Settings → Environment Variables).

## Required Environment Variables

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `TRADINGVIEW_API_URL` | `https://api.tradingview.example` | TradingView API endpoint (TODO: replace with real API) |
| `TRADINGVIEW_API_KEY` | `your_tradingview_api_key_here` | TradingView API key (leave empty if using mock data) |
| `FOREX_CALENDAR_API_URL` | `https://api.forexcalendar.example` | Forex calendar API endpoint (TODO: replace with real API) |
| `FOREX_CALENDAR_API_KEY` | `your_forex_calendar_api_key_here` | Forex calendar API key (leave empty if using mock data) |
| `SYMBOLS` | `EURUSD,GBPUSD,USDJPY` | Comma-separated list of currency pairs to monitor |
| `POLL_INTERVAL_SECONDS` | `60` | How often to poll for new data (30-60 seconds recommended) |
| `NEWS_AVOID_MINUTES` | `15` | Avoid trading X minutes before/after high-impact news |
| `DB_PATH` | `signals.db` | SQLite database file path |
| `ENV` | `production` | Environment: `development` or `production` |

## Quick Copy-Paste for Render

```
TRADINGVIEW_API_URL=https://api.tradingview.example
TRADINGVIEW_API_KEY=
FOREX_CALENDAR_API_URL=https://api.forexcalendar.example
FOREX_CALENDAR_API_KEY=
SYMBOLS=EURUSD,GBPUSD,USDJPY
POLL_INTERVAL_SECONDS=60
NEWS_AVOID_MINUTES=15
DB_PATH=signals.db
ENV=production
```

## Notes

- **API Keys**: If you're using mock data (default), you can leave the API keys empty. Replace them when you integrate real APIs.
- **Symbols**: Add more pairs as needed: `EURUSD,GBPUSD,USDJPY,AUDUSD,NZDUSD`
- **Poll Interval**: Lower values (30s) = more real-time but more API calls. Higher values (120s) = less frequent updates.
- **Database**: On Render free tier, the SQLite DB is ephemeral (resets on restart). For production, use PostgreSQL or external storage.

