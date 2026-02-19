# Netflix Clone - Full Stack Application

## Folder Structure
```
netflix/
├── backend/
│   ├── server.js          # Main Express server
│   ├── package.json
│   └── users.json         # Auto-generated user storage
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Main Netflix UI
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   Server runs on http://localhost:5000

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```
   App runs on http://localhost:3000

## Features

### Authentication
- JWT-based authentication
- Login and Register pages
- User data stored in users.json

### OMDb Integration
- API Key: 69bc584
- Real-time movie search
- Category-based movie fetching

### Netflix UI
- Hero banner with featured movie
- Horizontally scrollable movie rows
- Categories: Trending, Action, Sci-Fi, Comedy, Drama
- Responsive design with Tailwind CSS

### History Feature
- Tracks clicked movies
- Displays "Recently Watched" row
- Stores last 20 movies per user

### Search
- Real-time search in navigation
- Debounced API calls
- Grid display of results

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Movies
- GET /api/movies/search?query={query} - Search movies
- GET /api/movies/:id - Get movie details
- GET /api/movies/category/:category - Get category movies

### User
- POST /api/user/history - Add movie to history (requires auth)
- GET /api/user/history - Get user history (requires auth)

## Tech Stack
- Frontend: React, Tailwind CSS, Axios
- Backend: Node.js, Express, JWT, bcryptjs
- Storage: JSON file (users.json)
- API: OMDb API
