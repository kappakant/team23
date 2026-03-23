# PumpPal Backend

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file using `.env.example` as a template
4. Ask a teammate for the Railway database credentials
5. Run `npm run dev`

## Database
- Hosted on Railway MySQL
- Schema is in `/database/pumppal_schema.sql`
- Seed data is in `/database/pumppal_seed.sql`

## API Endpoints
- `GET  /health` - Health check
- `POST /api/users/profile` - Create or fetch user
- `GET  /api/users/profile/:firebase_uid` - Get user profile
- `GET  /api/posts/feed/:user_id` - Get feed
- `POST /api/posts` - Create post
- `POST /api/posts/:post_id/like` - Like/unlike post
- `GET  /api/posts/muscle-groups` - Get muscle groups