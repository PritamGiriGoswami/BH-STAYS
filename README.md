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

The API runs at `http://localhost:3001` by default, alongside the Python preview on port 8000. Configure Razorpay test or live keys in `backend/.env` to enable card and netbanking checkout. Guests can also display the uploaded static UPI QR, but that transfer is not verified by Razorpay or recorded automatically. Do not treat a QR transfer as a confirmed booking until it has been independently verified. Keep the Razorpay key secret on the server and never commit `.env`.

Set a private `JWT_SECRET` in `backend/.env` before using authentication beyond local development.

## Run the Mobile App

```powershell
cd frontend/mobile-app
npm install
npx expo start
```