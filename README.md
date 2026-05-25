# Globe Pin

Globe Pin is a full-stack photo mapping app where users can drop pins anywhere in the world, upload an image, and build a personal travel-style gallery on an interactive map.

The project combines a React + Vite frontend with an Express + TypeScript backend, uses Supabase for authentication and relational data, and stores uploaded images in Amazon S3. The result is a location-based social app that touches frontend UI, backend APIs, cloud storage, authentication, and deployment.


## Features

- Upload an image and attach it to a real-world latitude/longitude coordinate
- Browse geotagged posts on an interactive global map
- Reverse geocode coordinates into human-readable place names
- Search and jump to locations on the map
- Filter to show only the signed-in user's posts
- View full-size post images in a modal
- Delete your own posts
- Sign in with Google via Supabase Auth
- Responsive experience for desktop and mobile

## Architecture

### Frontend

- React 19
- Vite
- TypeScript
- `react-map-gl` / Mapbox GL
- Material UI

### Backend

- Node.js
- Express
- TypeScript
- Multer for multipart image uploads

### Data and Cloud Services

- Supabase Auth for Google sign-in
- Supabase Postgres for post records
- Amazon S3 for image storage
- AWS SDK v3 for uploads, deletes, and signed image URLs
- Mapbox Geocoding API for address lookup

## How It Works

1. A signed-in user selects a point on the map.
2. The frontend sends multipart form data to the backend with the image and post metadata.
3. The backend uploads the image to Amazon S3 using a unique object key.
4. The backend stores the post metadata, coordinates, and S3 object key in Supabase.
5. When posts are fetched, the backend generates a signed image URL and returns it to the frontend.
6. The frontend renders the post on the map and opens a popup with the image, location info, and description.

## Technical Highlights

- Storage abstraction:
  The frontend does not build storage URLs directly. The backend returns a ready-to-use `imageUrl`, which makes future storage changes easier.

- Safer media delivery:
  Images are served through backend-generated signed S3 URLs rather than hardcoded public links.

- Migration workflow:
  The backend includes a script to migrate legacy images from Supabase Storage into S3 while preserving the same object keys.

- Ownership-aware actions:
  Users can only delete their own posts from the UI.

## Project Structure

```text
Globe-Pin/
├── src/                  # React frontend
├── backend/
│   ├── src/
│   │   ├── routes/       # Express routes
│   │   ├── scripts/      # One-off utility scripts, including S3 migration
│   │   ├── db.ts         # Supabase server client
│   │   └── s3.ts         # AWS S3 client configuration
│   └── package.json
├── package.json
└── README.md
```

## Local Setup

### Prerequisites

- Node.js
- npm
- Supabase project
- AWS account with an S3 bucket
- Mapbox account

### Frontend environment variables

Create a root `.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### Backend environment variables

Create `backend/.env`:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASEROLE_KEY=your_supabase_service_role_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_bucket_region
AWS_S3_BUCKET=your_bucket_name
FRONTEND_URL=http://localhost:5173
```

## Running the Project

### Install dependencies

```bash
npm install
cd backend && npm install
```

### Start the backend

```bash
cd /Users/1realjay/Code/Globe-Pin/Globe-Pin/backend
npm run dev
```

### Start the frontend

```bash
cd /Users/1realjay/Code/Globe-Pin/Globe-Pin
npm run dev
```

## S3 Migration Script

To copy legacy images from Supabase Storage into S3:

```bash
cd /Users/1realjay/Code/Globe-Pin/Globe-Pin/backend
npm run migrate:s3
```

What it does:

- reads `image_url` keys from the `posts` table
- checks whether each object already exists in S3
- downloads missing files from Supabase Storage
- uploads them to S3 using the same object key

## Deployment

- Frontend: Vercel
- Backend: Render

For production, make sure the backend deployment includes the AWS, Supabase, and Mapbox environment variables.

