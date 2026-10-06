# BH Stays

BH Stays is organized as a web frontend, a mobile frontend, and a separate API backend.

## Project Structure

- `frontend/web/` contains the static website and its assets.
- `frontend/mobile-app/` contains the Expo / React Native application.
- `backend/` contains the Express API and SQLite data layer.
- `server.py` starts a local preview of the static website.

## Run the Website

```powershell
python server.py
```

Open `http://localhost:8000`.

## Run the API

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Set a private `JWT_SECRET` in `backend/.env` before using authentication beyond local development.

## Run the Mobile App

```powershell
cd frontend/mobile-app
npm install
npx expo start
```