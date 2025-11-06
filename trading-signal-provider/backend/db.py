import aiosqlite
from datetime import datetime
from typing import Dict, Any
from .config import settings


CREATE_SQL = """
CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pair TEXT NOT NULL,
    side TEXT NOT NULL,
    reason TEXT,
    time_utc TEXT NOT NULL,
    sl REAL,
    tp REAL,
    raw JSON
);
"""


async def init_db():
    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute(CREATE_SQL)
        await db.commit()


async def save_signal(signal: Dict[str, Any]):
    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute(
            "INSERT INTO signals (pair, side, reason, time_utc, sl, tp, raw) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                signal.get("pair"),
                signal.get("side"),
                signal.get("reason"),
                signal.get("time_utc") or datetime.utcnow().isoformat(),
                signal.get("sl"),
                signal.get("tp"),
                str(signal.get("raw", {}))
            )
        )
        await db.commit()


async def get_recent_signals(limit: int = 50):
    async with aiosqlite.connect(settings.DB_PATH) as db:
        cur = await db.execute("SELECT id, pair, side, reason, time_utc, sl, tp, raw FROM signals ORDER BY id DESC LIMIT ?", (limit,))
        rows = await cur.fetchall()
        return [
            {"id": r[0], "pair": r[1], "side": r[2], "reason": r[3], "time_utc": r[4], "sl": r[5], "tp": r[6], "raw": r[7]}
            for r in rows
        ]


