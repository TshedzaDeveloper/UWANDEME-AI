from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    TRADINGVIEW_API_URL: str = "https://api.tradingview.example"  # TODO: replace with real
    TRADINGVIEW_API_KEY: str = ""
    FOREX_CALENDAR_API_URL: str = "https://api.forexcalendar.example"  # TODO
    FOREX_CALENDAR_API_KEY: str = ""
    SYMBOLS: str = "EURUSD,GBPUSD,USDJPY"  # comma separated
    POLL_INTERVAL_SECONDS: int = 60
    NEWS_AVOID_MINUTES: int = 15  # avoid trades +/- minutes around high-impact news
    DB_PATH: str = "signals.db"
    SESSION_TZ: str = "UTC"  # use UTC for times
    ENV: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()


