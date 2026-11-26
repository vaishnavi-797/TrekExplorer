# TrekExplorer

India's trekking & assisted-access expedition portal featuring Sahyadri forts, Himalayan passes, live booking status tracking, and an admin dashboard.

## Project Structure

```text
Travel_tourism/
├── backend/
│   ├── app/
│   │   ├── models/        # Data validation & serialization models
│   │   ├── services/      # Business logic (contact messages, trek catalog)
│   │   ├── utils/         # Config loader & JSON file storage
│   │   └── main.py        # Flask API entrypoint (port 8080)
│   ├── tests/             # Unit & API tests
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # HTML pages (index, trek-details, booking, admin, auth)
│   │   ├── assets/        # CSS stylesheet & trek images
│   │   ├── services/      # Firebase config, auth handlers & trek catalog data
│   │   └── components/    # Shared navbar & profile menu component
│   └── package.json
├── .gitignore
└── README.md
```

## Running Locally

### 1. Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000/src/pages/index.html` (or `http://localhost:3000/`, which redirects there).

### 2. Backend (Contact & Catalog API)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python3 -m app.main
```
The API listens on `http://localhost:8080`:
- `GET /api/health`
- `GET /api/contact`, `POST /api/contact`, `DELETE /api/contact/<id>`
- `GET /api/treks`, `GET /api/treks/<trek_id>`

### 3. Backend Tests
```bash
cd backend
python3 -m unittest discover -s tests -v
```

## Deployment Notes
- **Frontend (Vercel):** Set Root Directory to `frontend`, Build Command to `npm run build`, and Output Directory to `dist`. Add your live `.vercel.app` domain in **Firebase Console → Authentication → Settings → Authorized domains**.
- **Firestore Rules:** Make sure Cloud Firestore Security Rules for project `trekexplorer-a2fdf` allow authenticated users to create/read their own `bookings` and `users/{uid}` documents, and allow `admin@trekexplorer.com` to read/update all `bookings`.
