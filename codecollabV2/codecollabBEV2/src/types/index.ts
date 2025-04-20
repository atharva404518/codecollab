// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  owner_id: string;
  code: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
}

// Code Execution Types
export interface CodeExecutionRequest {
  language_id: number;
  source_code: string;
  stdin?: string;
}

export interface CodeExecutionResponse {
  status: {
    id: number;
    description: string;
  };
  output: string;
  stderr: string;
  error: string;
  time: string | number;
  memory: number;
}

// Chat Types
export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Music Types
export interface Track {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  audioUrl?: string;
  duration: number;
}

export interface Playlist {
  id: string;
  room_id: string;
  current_track_id: string | null;
  is_playing: boolean;
  created_at: string;
  updated_at: string;
}

// Socket Event Types
export interface SocketEvents {
  // Room Events
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'room-joined': (room: Room) => void;
  'room-left': (roomId: string) => void;
  
  // Code Events
  'code-change': (data: { roomId: string; code: string; cursorPosition: number }) => void;
  'cursor-position': (data: { roomId: string; userId: string; position: number }) => void;
  
  // Chat Events
  'chat-message': (message: Message) => void;
  'typing-start': (data: { roomId: string; userId: string }) => void;
  'typing-stop': (data: { roomId: string; userId: string }) => void;
  
  // Music Events
  'music-play': (data: { roomId: string; track: Track }) => void;
  'music-pause': (data: { roomId: string }) => void;
  'music-skip': (data: { roomId: string }) => void;
  'music-queue-update': (data: { roomId: string; queue: Track[] }) => void;
} 
