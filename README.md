
# GeoGallery v1

GeoGallery is a fullstack web application that lets users upload, pin, and explore photos on an interactive world map. Users can share their favorite places and moments by attaching images and descriptions to specific locations, and discover a global gallery of geotagged experiences.

## Features
- Upload photos and pin them to real-world locations
- Add descriptions to each post
- Explore posts from users around the world on an interactive map
- View, zoom, and delete your own posts
- Google authentication for secure sign-in
- Mobile-friendly design with camera support

## Tech Stack
- **Frontend:** React, Vite, Mapbox GL, Supabase Auth
- **Backend:** Node.js (TypeScript), Express, Supabase Storage, PostgreSQL
- **Deployment:** Vercel (frontend), Render (backend)

## Getting Started

### Prerequisites
- Node.js & npm
- Supabase account
- Mapbox account

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/geogallery.git
   cd geogallery
   ```
2. Install dependencies for both frontend and backend:
   ```bash
   npm install
   cd backend && npm install
   ```
3. Create a `.env` file in both root and backend folders with your API keys and URLs (see `.env.example`).
4. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
5. Start the frontend:
   ```bash
   cd ..
   npm run dev
   ```
6. Visit `http://localhost:5173` (or the port shown) to use the app locally.

## License
MIT

---

*GeoGallery v1 – Share your world, one pin at a time.*
