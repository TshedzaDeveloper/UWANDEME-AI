import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any


def ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(window=period, min_periods=period).mean()
    ma_down = down.rolling(window=period, min_periods=period).mean()
    rs = ma_up / ma_down
    rsi = 100 - (100 / (1 + rs))
    return rsi


def generate_signals_from_candles(df: pd.DataFrame, symbol: str, session: str, news_events: list, news_avoid_minutes: int) -> list:
    """
    df expects index as datetime and 'close' column at least.
    Returns list of signals (can be empty).
    """
    signals = []
    if df.shape[0] < 30:
        return signals

    close = df['close']
    ema_short = ema(close, span=8)
    ema_long = ema(close, span=21)
    rsi_series = rsi(close, period=14)

    latest = df.iloc[-1]
    idx = df.index[-1]
    ema_s = ema_short.iloc[-1]
    ema_l = ema_long.iloc[-1]
    rsi_val = rsi_series.iloc[-1]

    # News filter: if any high-impact news within news_avoid_minutes of idx, skip
    from datetime import timedelta
    try:
        if hasattr(idx, 'tz') and idx.tz is not None:
            now_ts = idx.tz_convert('UTC')
        else:
            now_ts = pd.to_datetime(idx).tz_localize('UTC') if pd.notna(idx) else pd.Timestamp.now(tz='UTC')
    except Exception:
        now_ts = pd.Timestamp.now(tz='UTC')
    
    avoid = False
    for ev in news_events:
        # ev should have keys: 'time' (ISO UTC string), 'impact' (e.g., 'high')
        try:
            if ev.get('time'):
                ev_time = pd.to_datetime(ev.get('time'))
                if ev_time.tz is None:
                    ev_time = ev_time.tz_localize('UTC')
                else:
                    ev_time = ev_time.tz_convert('UTC')
            else:
                continue
        except Exception:
            continue
        try:
            diff = abs((now_ts - ev_time).total_seconds())/60.0
            if ev.get('impact') and ev.get('impact').lower() == 'high' and diff <= news_avoid_minutes:
                avoid = True
                break
        except Exception:
            continue

    if avoid:
        return signals

    # strategy: EMA crossover + RSI confirmation, consider session
    # BUY condition
    prev_short = ema_short.iloc[-2]
    prev_long = ema_long.iloc[-2]
    side = None
    reason = None

    if prev_short <= prev_long and ema_s > ema_l and rsi_val > 45 and rsi_val < 75:
        side = "BUY"
        reason = f"EMA crossover (8>21) + RSI {rsi_val:.1f} during {session}"
    elif prev_short >= prev_long and ema_s < ema_l and rsi_val < 55 and rsi_val > 25:
        side = "SELL"
        reason = f"EMA cross down (8<21) + RSI {rsi_val:.1f} during {session}"

    if side:
        # simple SL/TP calculation: use recent ATR proxy (std dev) for volatility
        recent_close = df['close'].iloc[-20:]
        vol = recent_close.pct_change().std()  # rough vol
        last_price = latest['close']
        sl = None
        tp = None
        # set SL as a multiple of vol
        sl_pips = vol * last_price * 1.5
        tp_pips = sl_pips * 2
        if side == "BUY":
            sl = last_price - sl_pips
            tp = last_price + tp_pips
        else:
            sl = last_price + sl_pips
            tp = last_price - tp_pips

        signals.append({
            "pair": symbol,
            "side": side,
            "reason": reason,
            "time_utc": pd.to_datetime(idx).isoformat(),
            "sl": float(sl),
            "tp": float(tp),
            "raw": {
                "ema_short": float(ema_s),
                "ema_long": float(ema_l),
                "rsi": float(rsi_val)
            }
        })

    return signals


