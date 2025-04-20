-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  language TEXT NOT NULL DEFAULT 'javascript',
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create room_members table
CREATE TABLE IF NOT EXISTS room_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create music_tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration INTEGER NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create room_playlists table
CREATE TABLE IF NOT EXISTS room_playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  current_track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id)
);

-- Create room_playlist_tracks table
CREATE TABLE IF NOT EXISTS room_playlist_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, track_id)
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Rooms policies
CREATE POLICY "Public rooms are viewable by everyone" ON rooms
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view rooms they are members of" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = rooms.id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Room owners can update their rooms" ON rooms
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Room owners can delete their rooms" ON rooms
  FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Room members policies
CREATE POLICY "Room members are viewable by room members" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Room owners can manage members" ON room_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_members.room_id
      AND rooms.owner_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Room members can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = messages.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can insert messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = messages.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Music tracks policies
CREATE POLICY "Music tracks are viewable by everyone" ON music_tracks
  FOR SELECT USING (true);

-- Room playlists policies
CREATE POLICY "Room members can view playlists" ON room_playlists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_playlists.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can update playlists" ON room_playlists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_playlists.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Room playlist tracks policies
CREATE POLICY "Room members can view playlist tracks" ON room_playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_playlist_tracks.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can manage playlist tracks" ON room_playlist_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_playlist_tracks.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Create functions for real-time features
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to auto-add room owner as member
CREATE OR REPLACE FUNCTION public.handle_new_room()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (new.id, new.owner_id, 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_room_created
  AFTER INSERT ON public.rooms
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_room(); 
