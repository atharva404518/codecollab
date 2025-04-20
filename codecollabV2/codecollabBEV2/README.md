# CodeCollab Backend

A real-time collaborative code editing platform with integrated music playback.

## Features

- Real-time collaborative code editing
- Multi-language code execution using Judge0 API
- Integrated music playback with YouTube Music API
- User authentication and room management
- Real-time chat functionality
- Cursor position synchronization

## Tech Stack

- TypeScript
- Express.js
- Socket.io
- Supabase (PostgreSQL + Auth)
- Judge0 API
- YouTube Music API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Judge0 API key
- YouTube API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Judge0 API Configuration
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key

# YouTube Music API Configuration
YOUTUBE_API_KEY=your_youtube_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/codecollab.git
cd codecollab/backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Rooms

- `POST /api/rooms` - Create a new room
- `POST /api/rooms/:roomId/join` - Join a room
- `GET /api/rooms/:roomId` - Get room details
- `PUT /api/rooms/:roomId` - Update room

### Code Execution

- `POST /api/code/execute` - Execute code

### Music

- `GET /api/music/search` - Search for music
- `POST /api/music/rooms/:roomId/playlist` - Add track to playlist
- `DELETE /api/music/rooms/:roomId/playlist/:trackId` - Remove track from playlist
- `POST /api/music/rooms/:roomId/skip` - Skip current track

## Socket Events

### Room Events

- `join-room` - Join a room
- `leave-room` - Leave a room
- `room-joined` - Room joined confirmation
- `room-left` - Room left confirmation

### Code Events

- `code-change` - Code changes
- `cursor-position` - Cursor position updates

### Chat Events

- `chat-message` - New chat message
- `typing-start` - User started typing
- `typing-stop` - User stopped typing

### Music Events

- `music-play` - Play music
- `music-pause` - Pause music
- `music-skip` - Skip current track
- `music-queue-update` - Queue update

## Database Schema

### Users

- id (UUID)
- email (string)
- username (string)
- avatar_url (string, nullable)
- created_at (timestamp)

### Rooms

- id (UUID)
- name (string)
- owner_id (UUID)
- created_at (timestamp)
- updated_at (timestamp)
- is_public (boolean)
- language (string)
- code (text)

### Room Members

- room_id (UUID)
- user_id (UUID)
- role (enum: 'owner', 'editor', 'viewer')
- joined_at (timestamp)

### Chat Messages

- id (UUID)
- room_id (UUID)
- user_id (UUID)
- content (text)
- created_at (timestamp)

### Room Playlists

- room_id (UUID)
- current_track (jsonb)
- queue (jsonb[])
- is_playing (boolean)
- current_time (integer)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
