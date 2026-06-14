# GeoGallery v2.0

GeoGallery is a full-stack photo mapping application where users can upload
photos, pin them to real-world locations, and revisit their memories through an
interactive global map.

The project was originally developed as Globe Pin and combines a React
frontend with an Express API, Supabase authentication and data storage, Amazon
S3 image storage, and Mapbox mapping services.

## Features

- Explore geotagged posts on an interactive global map
- Search for locations and move directly to them
- Upload photos with descriptions, dates, and coordinates
- Sign in with Google through Supabase Auth
- Filter the map to show only your posts
- Bookmark posts and browse saved places
- View and delete your own posts
- Switch between colorful light and satellite dark map themes
- Use your current location when creating a post
- Use the app on desktop and mobile layouts

## Technology

### Frontend

- React 19
- TypeScript
- Vite
- Mapbox GL and `react-map-gl`
- Material UI
- Google Places Autocomplete

### Backend

- Node.js
- Express
- TypeScript
- Multer for image uploads
- AWS SDK for S3

### Services

- Supabase Auth and Postgres
- Amazon S3
- Mapbox
- Google Maps Platform
- Vercel for the frontend
- Render for the backend
- GitHub Actions for CI

## Architecture

```text
Browser
  |
  |-- React frontend ---------------- Supabase Auth
  |
  `-- Express API
        |-- Supabase Postgres
        |-- Amazon S3
        `-- Mapbox Geocoding API
```

When a user creates a post, the frontend sends the photo and post details to
the Express API. The API uploads the image to S3 and stores its object key with
the post data in Supabase. When posts are requested, the API generates signed
S3 URLs and returns them to the frontend.

## Project Structure

```text
Globe-Pin/
|-- .github/workflows/ci.yml   # Frontend and backend CI checks
|-- backend/
|   |-- src/
|   |   |-- routes/            # Posts, bookmarks, and geocoding routes
|   |   |-- scripts/           # Data migration utilities
|   |   |-- app.ts             # Express application
|   |   |-- db.ts              # Supabase server client
|   |   `-- s3.ts              # Amazon S3 client
|   |-- Dockerfile
|   `-- package.json
|-- src/                       # React frontend
|-- Dockerfile                 # Frontend production image
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Create a second file at `backend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASEROLE_KEY=your_supabase_service_role_key
VITE_MAPBOX_TOKEN=your_mapbox_token
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
FRONTEND_URL=http://localhost:8080
```

Do not commit either `.env` file. The Supabase service-role key and AWS
credentials must only be used by the backend.

## Run With Docker

Docker is the recommended way to run the complete application.

### Requirements

- Docker Desktop
- Supabase, AWS, Mapbox, and Google Maps credentials
- The two environment files described above

From the project root, build and start both services:

```bash
docker compose up --build
```

Open:

```text
Frontend: http://localhost:8080
Backend:  http://localhost:3001
```

The Docker images install their own npm dependencies, so a local
`node_modules` directory is not required for this setup.

Stop the containers with:

```bash
docker compose down
```

## Run Without Docker

Use this option for faster frontend development, editor tooling, linting, or
running each service independently.

### Requirements

- Node.js 20 or newer
- npm
- The two environment files described above

Install dependencies:

```bash
npm ci
npm ci --prefix backend
```

Start the backend:

```bash
npm run dev --prefix backend
```

In another terminal, start the frontend:

```bash
npm run dev
```

The frontend development server is available at `http://localhost:5173`. When
using this mode, set `FRONTEND_URL=http://localhost:5173` in `backend/.env`.

## Available Commands

### Frontend

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

### Backend

```bash
npm run dev --prefix backend      # Start with automatic reload
npm run build --prefix backend    # Compile TypeScript
npm start --prefix backend        # Run the compiled server
npm run migrate:s3 --prefix backend
```

## S3 Migration

The migration command copies legacy post images from Supabase Storage to S3
while preserving their object keys:

```bash
npm run migrate:s3 --prefix backend
```

The script:

- Reads image keys from the `posts` table
- Checks whether each image already exists in S3
- Downloads missing images from Supabase Storage
- Uploads them to the configured S3 bucket

n Vercel and
Render. Local `.env` files are not uploaded to either platform.
