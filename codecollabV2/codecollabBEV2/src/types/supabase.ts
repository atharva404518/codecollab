export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
          is_public: boolean
          language: string
          code: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          language: string
          code?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          language?: string
          code?: string
        }
      }
      room_members: {
        Row: {
          room_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          room_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      room_playlists: {
        Row: {
          room_id: string
          current_track: Json | null
          queue: Json[]
          is_playing: boolean
          current_time: number
        }
        Insert: {
          room_id: string
          current_track?: Json | null
          queue?: Json[]
          is_playing?: boolean
          current_time?: number
        }
        Update: {
          room_id?: string
          current_track?: Json | null
          queue?: Json[]
          is_playing?: boolean
          current_time?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
