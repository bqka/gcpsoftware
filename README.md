
# Electron + React + TypeScript App

A desktop application built using Electron, React, and TypeScript with a Python backend.

---

## 🚀 Getting Started

### Development

To start the development server:

```bash
npm run dev
```

More scripts are in package.json

### Build

If there are changes made to the backend scripts, build them into a .exe file first by

```bash
pyinstaller --onefile --strip --distpath python-bin/ backend/compare.py
pyinstaller --onefile --strip --distpath python-bin/ backend/getsequence.py
```

Then build the app by

```bash
npm run dist:win
```