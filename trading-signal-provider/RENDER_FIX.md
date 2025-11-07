# Fix for Render Build Error

## Problem
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'backend/requirements.txt'
```

## Solution

The repository structure on GitHub is:
```
UWANDEME-AI/
  └── trading-signal-provider/
      └── backend/
          └── requirements.txt
```

Render needs to know the **Root Directory** to build from the correct location.

### Option 1: Using Render Dashboard (Manual Setup)

1. Go to your Render service settings
2. Scroll to **Advanced** section
3. Set **Root Directory** to: `trading-signal-provider`
4. **Build Command**: `pip install -r backend/requirements.txt`
5. **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Option 2: Using render.yaml (Automatic)

The `render.yaml` file already has `rootDir: trading-signal-provider` configured. If you're using render.yaml:

1. Make sure `render.yaml` is in the root of your GitHub repository (`UWANDEME-AI/`)
2. Render should automatically detect and use it
3. If not, you can manually import it in Render dashboard

### Option 3: Alternative Build Command

If the above doesn't work, you can use an absolute path:

**Build Command**: `cd trading-signal-provider && pip install -r backend/requirements.txt`

**Start Command**: `cd trading-signal-provider && uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

## Verify

After setting the root directory, the build should find:
- `trading-signal-provider/backend/requirements.txt` ✅
- `trading-signal-provider/backend/main.py` ✅

## Quick Fix Checklist

- [ ] Set **Root Directory** to `trading-signal-provider` in Render dashboard
- [ ] Verify **Build Command**: `pip install -r backend/requirements.txt`
- [ ] Verify **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- [ ] Save and redeploy

