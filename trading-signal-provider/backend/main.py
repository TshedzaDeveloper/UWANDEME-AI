import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .data_fetcher import fetch_candles_tradingview, fetch_news_calendar
from .signal_engine import generate_signals_from_candles
from .db import init_db, save_signal, get_recent_signals
import logging
import os
import pandas as pd
from datetime import datetime
from typing import List


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trading-signal-provider")


app = FastAPI(title="Trading Signal Provider")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event: init DB and start background task
@app.on_event("startup")
async def startup_event():
    await init_db()
    app.state.task = asyncio.create_task(background_worker())


@app.on_event("shutdown")
async def shutdown_event():
    task = app.state.task
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


@app.get("/signals")
async def read_signals(limit: int = 50):
    return await get_recent_signals(limit)


# Helper: map UTC now into session name
def detect_session(ts: pd.Timestamp) -> str:
    # Work in UTC: London roughly 07:00-16:00 UTC (winter/summer shifts ignored)
    h = ts.tz_convert('UTC').hour if hasattr(ts, 'tz') else ts.hour
    if 7 <= h < 16:
        return "LONDON"
    if 12 <= h < 21:
        return "NEW_YORK"
    return "ASIA_OR_OFF"


async def analyze_symbol(symbol: str):
    try:
        df = await fetch_candles_tradingview(symbol)
        if not isinstance(df, pd.DataFrame) or df.empty:
            logger.warning(f"No candles for {symbol}")
            return []
        news = await fetch_news_calendar()
        latest_idx = df.index[-1]
        session = detect_session(latest_idx)
        signals = generate_signals_from_candles(df, symbol, session, news, settings.NEWS_AVOID_MINUTES)
        for s in signals:
            await save_signal(s)
            logger.info(f"Saved signal: {s}")
        return signals
    except Exception as e:
        logger.exception(f"Error analyzing {symbol}: {e}")
        return []


async def background_worker():
    symbols = [s.strip() for s in settings.SYMBOLS.split(",") if s.strip()]
    poll = settings.POLL_INTERVAL_SECONDS
    logger.info(f"Background worker starting for symbols: {symbols} every {poll}s")
    while True:
        try:
            tasks = [analyze_symbol(sym) for sym in symbols]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            # optionally: broadcast results via websockets/telegram
        except Exception as e:
            logger.exception("Background worker error: %s", e)
        await asyncio.sleep(poll)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)


