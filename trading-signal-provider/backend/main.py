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


@app.get("/")
async def root():
    return {
        "message": "Trading Signal Provider API",
        "version": "1.0.0",
        "endpoints": {
            "signals": "/signals",
            "docs": "/docs",
            "health": "/health"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "trading-signal-provider"}


@app.get("/signals")
async def read_signals(limit: int = 50):
    return await get_recent_signals(limit)


@app.get("/api/calendar")
async def get_calendar():
    """Get forex calendar events"""
    events = await fetch_news_calendar(since_minutes=1440)  # 24 hours
    return {"events": events}


@app.get("/api/symbols")
async def get_symbols():
    """Get list of symbols being analyzed"""
    symbols = [s.strip() for s in settings.SYMBOLS.split(",") if s.strip()]
    return {"symbols": symbols}


@app.get("/api/stats")
async def get_stats():
    """Get trading statistics"""
    signals = await get_recent_signals(limit=1000)
    if not signals:
        return {
            "total_signals": 0,
            "buy_signals": 0,
            "sell_signals": 0,
            "symbols_analyzed": len([s.strip() for s in settings.SYMBOLS.split(",") if s.strip()])
        }
    
    buy_count = sum(1 for s in signals if s.get("side") == "BUY")
    sell_count = sum(1 for s in signals if s.get("side") == "SELL")
    
    return {
        "total_signals": len(signals),
        "buy_signals": buy_count,
        "sell_signals": sell_count,
        "symbols_analyzed": len([s.strip() for s in settings.SYMBOLS.split(",") if s.strip()])
    }


# Helper: map UTC now into session name
def detect_session(ts: pd.Timestamp) -> str:
    # Work in UTC: London roughly 07:00-16:00 UTC (winter/summer shifts ignored)
    try:
        if isinstance(ts, pd.Timestamp):
            if ts.tz is not None:
                # Already timezone-aware, convert to UTC
                h = ts.tz_convert('UTC').hour
            else:
                # Naive timestamp, localize to UTC
                h = ts.tz_localize('UTC').hour
        else:
            # Convert to Timestamp first
            ts_converted = pd.to_datetime(ts)
            if ts_converted.tz is not None:
                h = ts_converted.tz_convert('UTC').hour
            else:
                h = ts_converted.tz_localize('UTC').hour
    except Exception as e:
        logger.warning(f"Error detecting session for {ts}: {e}, using current time")
        h = pd.Timestamp.now(tz='UTC').hour
    
    if 7 <= h < 16:
        return "LONDON"
    if 12 <= h < 21:
        return "NEW_YORK"
    return "ASIA_OR_OFF"


async def analyze_symbol(symbol: str):
    try:
        logger.debug(f"Analyzing symbol: {symbol}")
        df = await fetch_candles_tradingview(symbol)
        if not isinstance(df, pd.DataFrame) or df.empty:
            logger.warning(f"No candles for {symbol}")
            return []
        
        # Ensure DataFrame index is timezone-aware and in UTC
        if df.index.tz is None:
            logger.debug(f"Localizing index to UTC for {symbol}")
            df.index = df.index.tz_localize('UTC')
        else:
            # Already timezone-aware, convert to UTC if needed
            try:
                df.index = df.index.tz_convert('UTC')
                logger.debug(f"Converted index to UTC for {symbol}")
            except Exception as e:
                logger.warning(f"Could not convert timezone for {symbol}: {e}, assuming UTC")
        
        news = await fetch_news_calendar()
        latest_idx = df.index[-1]
        session = detect_session(latest_idx)
        signals = generate_signals_from_candles(df, symbol, session, news, settings.NEWS_AVOID_MINUTES)
        
        if signals:
            logger.info(f"Generated {len(signals)} signal(s) for {symbol}")
            for s in signals:
                await save_signal(s)
                logger.info(f"Saved signal: {s}")
        else:
            logger.debug(f"No signals generated for {symbol}")
        
        return signals
    except Exception as e:
        logger.error(f"Error analyzing {symbol}: {e}", exc_info=True)
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


