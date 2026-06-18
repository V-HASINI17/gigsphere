# GigSphere

GigSphere is a location-based gig economy platform connecting students seeking short-term work with local businesses and employers. It features geospatial radius matching (5km/10km), real-time chat, and a robust trust score system.

## 🚀 Key Features

*   **Role-Based Access Control:** Separate flows and dashboards for Students, Employers, and Admins.
*   **Geospatial Matching:** MongoDB `$geoNear` powers location-based gig discovery within 5km, 10km, or 25km radiuses.
*   **Interactive Maps:** React-Leaflet integration with OpenStreetMap tiles for visualizing gigs and employer locations.
*   **Real-Time Chat:** Socket.io powered messaging with read receipts and online status tracking.
*   **Trust Score System:** Dynamic rating system based on gig completion rates, user reviews, and verification status.
*   **Verification Workflow:** Admin-approval gate for employers before they can post gigs, and student ID verification.

## 🛠️ Tech Stack

**Backend:**
*   Node.js & Express 5
*   MongoDB Atlas (Mongoose) with `2dsphere` indexes
*   Socket.io (Real-time communication)
*   JWT (Authentication)

**Frontend:**
*   React 19 (Create React App)
*   React Router v6
*   Tailwind CSS (Styling)
*   React Leaflet (Maps)
*   Framer Motion (Animations)

## 📁 Project Structure

```text
gigsphere/
├── backend/                  # Node.js/Express server
│   ├── config/               # Database connection (db.js)
│   ├── controllers/          # Business logic (auth, admin, job, review, chat)
│   ├── middleware/           # Auth & Security middlewares
│   ├── models/               # Mongoose schemas (User, Job, Message, Review)
│   ├── routes/               # API route definitions
│   └── server.js             # Main entry point & Socket.io setup
│
├── frontend/                 # React application
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── context/          # React Context (AuthContext)
│       ├── pages/            # Page components (Dashboards, Signup, Login, Home)
│       ├── services/         # API integration (api.js)
│       └── App.js            # Main routing configuration
```

## ⚙️ Environment Setup

### 1. Backend Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gigsphere?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_64_character_hex_string
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Configuration
Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🏃‍♂️ Running Locally

1. **Install Dependencies:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm install

   # Terminal 2: Frontend
   cd frontend
   npm install
   ```

2. **Start the Servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev    # or 'node server.js'

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

3. **Access the App:** Open `http://localhost:3000` in your browser.

## 👥 User Workflows

### 🎓 Students
1. **Signup:** Requires College ID upload and browser geolocation.
2. **Dashboard:** View interactive map with available gigs within a selected radius (5km/10km).
3. **Apply:** Apply for gigs.
4. **Work:** Once accepted, communicate via Chat, complete the gig, and receive earnings/reviews.

### 🏢 Employers
1. **Signup:** Requires Business License upload and browser geolocation.
2. **Verification:** Must wait for Admin approval before posting.
3. **Dashboard:** Pinpoint gig locations on a map, set requirements, and publish.
4. **Manage:** Review applicants, accept/reject, mark gigs as In Progress or Completed, and submit reviews.

### 🛡️ Admins
1. **Dashboard:** View platform analytics, manage unverified users (approve/reject).
2. **Moderation:** Suspend users, handle reported gigs, and manage platform safety.

## 🌐 API Overview

*   **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
*   **Jobs (Gigs):** `/api/jobs` (CRUD), `/api/jobs/nearby` (Geo queries)
*   **Applications:** `/api/applications/:jobId`, `/api/applications/:id/(accept|reject|start|complete|cancel)`
*   **Chat:** `/api/chat/messages/:otherUserId`, `/api/chat/conversations`
*   **Admin:** `/api/admin/users`, `/api/admin/users/unverified`, `/api/admin/gigs/reported`
*   **Reviews:** `/api/reviews`

## 🚢 Deployment Readiness

Before deploying to production:
1. Ensure `FRONTEND_URL` in the backend `.env` is set to the production frontend domain to secure Socket.io CORS.
2. Update `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` in the frontend `.env` to point to the production backend domain.
3. Use a strong, randomly generated `JWT_SECRET`.
4. Build the frontend (`npm run build`) and serve statically, or host on Vercel/Netlify. Host the backend on Render/Heroku/AWS.
