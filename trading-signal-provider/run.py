#!/usr/bin/env python
"""Simple script to run the FastAPI app locally."""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=port,
        reload=True,
        log_level="info"
    )

