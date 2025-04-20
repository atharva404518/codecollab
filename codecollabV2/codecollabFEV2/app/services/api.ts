import { createClient } from '@supabase/supabase-js';

// Fallback UUID generator for environments where crypto is not available
function generateUUID() {
  try {
    // Try to use the built-in crypto API
    return crypto.randomUUID();
  } catch (error) {
    // Fallback using Math.random()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },

  register: async (userData: { email: string; password: string; username: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

export const roomAPI = {
  createRoom: async (roomData: { name: string; description: string; isPublic: boolean; language: string }) => {
    console.log("Starting room creation with data:", roomData);
    
    // Generate a fixed anonymous user ID for consistency
    const anonymousUserId = 'anonymous-user-' + Math.random().toString(36).substring(2, 10);
    
    try {
      // Try to get the current user, but don't fail if not authenticated
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || anonymousUserId;
      console.log("User ID for room creation:", userId);
      
      // First check if required fields are present
      if (!roomData.name || !roomData.language) {
        console.error("Missing required fields in roomData", roomData);
        throw new Error('Room name and language are required');
      }
      
      console.log("Creating room in database with data:", {
        ...roomData,
        owner_id: userId
      });
      
      // First check if the rooms table exists by attempting to get a count
      try {
        const { count, error: countError } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true });
        
        console.log("Table check result:", { count, error: countError });
        
        if (countError) {
          if (countError.code === '404' || countError.message?.includes('Not Found') || countError.details?.includes('relation "rooms" does not exist')) {
            console.error("The 'rooms' table does not exist in your Supabase database");
            throw new Error("The database tables aren't set up correctly. Please create the required tables in Supabase.");
          }
        }
      } catch (tableCheckError) {
        console.error("Error checking if table exists:", tableCheckError);
        if (tableCheckError instanceof Error && 
            (tableCheckError.message.includes('Not Found') || 
             tableCheckError.message.includes('does not exist'))) {
          throw new Error("The database tables aren't set up correctly. Please create the required tables in Supabase.");
        }
      }
      
      // Insert room with more complete error handling
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: roomData.name,
          description: roomData.description || 'No description provided',
          is_public: roomData.isPublic !== undefined ? roomData.isPublic : true,
          language: roomData.language,
          owner_id: userId,
          // Ensure we have default values for all required fields
          code: '',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (roomError) {
        console.error("Error creating room:", roomError);
        
        if (roomError.code === '404' || roomError.message?.includes('Not Found')) {
          throw new Error("The 'rooms' table doesn't exist in your Supabase database. Please check your database setup.");
        } else if (roomError.code === '42P01') {
          throw new Error("The 'rooms' table doesn't exist. Please run the database migrations.");
        } else if (roomError.code === '42501') {
          throw new Error("You don't have permission to insert into the 'rooms' table.");
        } else {
          throw new Error(`Failed to create room: ${roomError.message}`);
        }
      }
      
      if (!room || !room.id) {
        console.error("Room created but no ID returned");
        throw new Error('Room created but no ID was returned');
      }
      
      console.log("Room created successfully:", room);

      try {
        // Add creator as room member
        console.log("Adding user as room member:", { roomId: room.id, userId });
        const { error: memberError } = await supabase
          .from('room_members')
          .insert({
            room_id: room.id,
            user_id: userId,
            role: 'owner',
            joined_at: new Date().toISOString(),
          });

        if (memberError) {
          console.error("Error adding room member:", memberError);
          
          if (memberError.code === '404' || memberError.message?.includes('Not Found')) {
            console.warn("The 'room_members' table doesn't exist, but proceeding with room creation");
            // Don't throw - we'll still return the room
          } else {
            // For other errors, still proceed with room creation
            console.warn("Could not add room member, but proceeding:", memberError);
          }
        }
      } catch (memberError) {
        console.warn("Error adding member, but proceeding with room creation:", memberError);
        // Don't throw - we'll still return the room
      }

      // Create room playlist - this is optional, so handle errors gracefully
      try {
        console.log("Creating room playlist for room:", room.id);
        const { error: playlistError } = await supabase
          .from('room_playlists')
          .insert({
            room_id: room.id,
            is_playing: false,
          });

        if (playlistError) {
          console.warn("Warning: Could not create playlist, but proceeding:", playlistError);
          // Not fatal - log but don't throw
        }
      } catch (playlistErr) {
        console.warn("Warning: Error creating playlist, but proceeding:", playlistErr);
        // Not fatal - log but don't throw
      }

      console.log("Room creation process complete:", room);
      return room;
      
    } catch (error) {
      console.error("Unexpected error during room creation:", error);
      
      // Format the error message nicely for display
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during room creation';
      
      // For debugging - log to console what type of error we got
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
        console.error("Error stack:", error.stack);
        
        // Check for fetch/network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error("Network error: Could not connect to the database. Please check your internet connection.");
        }
      } else if (typeof error === 'object' && error !== null) {
        console.error("Error object keys:", Object.keys(error));
      }
        
      throw new Error(errorMessage);
    }
  },

  createPlaylist: async (roomId: string) => {
    const { data, error } = await supabase
      .from('room_playlists')
      .insert({
        room_id: roomId,
        is_playing: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getRooms: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    // Get rooms where user is a member
    const { data: memberRooms, error: memberError } = await supabase
      .from('rooms')
      .select(`
        *,
        room_members!inner (user_id)
      `)
      .eq('room_members.user_id', user.id);

    if (memberError) throw memberError;

    // Get public rooms
    const { data: publicRooms, error: publicError } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_public', true)
      .not('id', 'in', memberRooms?.map(r => r.id) || []);

    if (publicError) throw publicError;

    return [...(memberRooms || []), ...(publicRooms || [])];
  },

  getRoom: async (roomId: string) => {
    try {
      console.log("Fetching room with ID:", roomId);
      
      // Handle the demo room case
      if (roomId === 'qwerty') {
        return await getDemoRoom();
      }
      
      // First try the simpler query without complex relationships
      const { data: basicRoom, error: basicRoomError } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members (
            user_id,
            role
          ),
          messages (
            id,
            user_id,
            content,
            created_at
          )
        `)
        .eq('id', roomId)
        .single();
        
      if (basicRoomError) {
        console.error("Error fetching basic room data:", basicRoomError);
        throw basicRoomError;
      }
      
      if (!basicRoom) {
        console.error("Room not found:", roomId);
        throw new Error('Room not found');
      }
      
      console.log("Basic room data retrieved successfully");
      
      // Try to get playlist data separately to avoid relationship errors
      try {
        const { data: playlist, error: playlistError } = await supabase
          .from('room_playlists')
          .select(`
            current_track_id,
            is_playing
          `)
          .eq('room_id', roomId)
          .maybeSingle();
          
        if (!playlistError && playlist) {
          basicRoom.playlist = playlist;
        }
      } catch (playlistError) {
        console.warn("Error fetching playlist, continuing without it:", playlistError);
      }
      
      // Try to get playlist tracks separately
      try {
        const { data: tracks, error: tracksError } = await supabase
          .from('room_playlist_tracks')
          .select(`
            track_id,
            position
          `)
          .eq('room_id', roomId);
          
        if (!tracksError && tracks) {
          basicRoom.tracks = tracks;
        }
      } catch (tracksError) {
        console.warn("Error fetching playlist tracks, continuing without them:", tracksError);
      }
      
      return basicRoom;
    } catch (error) {
      console.error("Failed to get room:", error);
      throw error;
    }
  },

  updateRoom: async (roomId: string, roomData: { name?: string; isPublic?: boolean; language?: string }) => {
    const { data: room, error } = await supabase
      .from('rooms')
      .update({
        name: roomData.name,
        is_public: roomData.isPublic,
        language: roomData.language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return room;
  },

  deleteRoom: async (roomId: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
  },

  joinRoom: async (roomId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  leaveRoom: async (roomId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  sendMessage: async (roomId: string, content: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCode: async (roomId: string, code: string) => {
    const { data, error } = await supabase
      .from('rooms')
      .update({ code })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  joinRoomByCode: async (roomId: string) => {
    console.log("Starting join room by code:", roomId);
    
    if (!roomId || roomId.trim() === '') {
      console.error("Empty room ID provided");
      throw new Error('Room ID is required');
    }
    
    // Generate a fixed anonymous user ID for consistency
    const anonymousUserId = 'anonymous-user-' + Math.random().toString(36).substring(2, 10);
    
    try {
      // Try to get the current user, but don't fail if not authenticated
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || anonymousUserId;
      console.log("User ID for room joining:", userId);

      // Check if room exists
      console.log("Checking if room exists:", roomId);
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) {
        console.error("Error finding room:", roomError);
        throw new Error('Room not found or access denied');
      }

      if (!room) {
        console.error("No room found with ID:", roomId);
        throw new Error('Room not found');
      }
      
      console.log("Room found:", room);

      // Check if user is already a member
      console.log("Checking if user is already a member");
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();
        
      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        // PGRST116 is "Results contain 0 rows" - this is expected if user is not a member
        console.error("Error checking membership:", memberCheckError);
      }

      if (existingMember) {
        console.log("User is already a member of this room");
        return room;
      }

      // Add user as room member
      console.log("Adding user as room member");
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error("Error adding room member:", memberError);
        throw new Error(`Failed to join room: ${memberError.message}`);
      }

      console.log("Successfully joined room:", room);
      return room;
      
    } catch (error) {
      console.error("Unexpected error during room joining:", error);
      
      // Format the error message nicely for display
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while joining the room';
        
      throw new Error(errorMessage);
    }
  },

  enhanceCode: async (roomId: string, code: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    // For now, just return the code with some basic formatting
    // In the future, this could call an AI service
    const enhancedCode = code
      .split('\n')
      .map(line => line.trim())
      .join('\n');

    return enhancedCode;
  },

  updateCurrentTrack: async (roomId: string, trackId: string | null) => {
    const { data, error } = await supabase
      .from('room_playlists')
      .update({ current_track_id: trackId })
      .eq('room_id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updatePlaybackState: async (roomId: string, isPlaying: boolean) => {
    const { data, error } = await supabase
      .from('room_playlists')
      .update({ is_playing: isPlaying })
      .eq('room_id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  addToPlaylist: async (roomId: string, trackId: string) => {
    // Get the current highest position
    const { data: tracks, error: posError } = await supabase
      .from('room_playlist_tracks')
      .select('position')
      .eq('room_id', roomId)
      .order('position', { ascending: false })
      .limit(1);

    if (posError) throw posError;

    const nextPosition = tracks && tracks.length > 0 ? tracks[0].position + 1 : 0;

    const { data, error } = await supabase
      .from('room_playlist_tracks')
      .insert({
        room_id: roomId,
        track_id: trackId,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  removeFromPlaylist: async (roomId: string, trackId: string) => {
    const { error } = await supabase
      .from('room_playlist_tracks')
      .delete()
      .eq('room_id', roomId)
      .eq('track_id', trackId);

    if (error) throw error;
  },

  updateRoomLanguage: async (roomId: string, language: string) => {
    const { data, error } = await supabase
      .from('rooms')
      .update({ language })
      .eq('id', roomId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  executeCode: async (language: string, code: string, stdin?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/code/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          stdin: stdin || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to execute code');
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  },
};

export const musicAPI = {
  searchTracks: async (query: string) => {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('title');

    if (error) throw error;
    return data;
  },

  getPlaylist: async (roomId: string) => {
    const { data, error } = await supabase
      .from('room_playlists')
      .select(`
        *,
        room_playlist_tracks (
          track_id,
          position,
          music_tracks (*)
        )
      `)
      .eq('room_id', roomId)
      .single();

    if (error) throw error;
    return data;
  },

  addToPlaylist: async (roomId: string, trackId: string) => {
    // Get the current highest position
    const { data: tracks, error: posError } = await supabase
      .from('room_playlist_tracks')
      .select('position')
      .eq('room_id', roomId)
      .order('position', { ascending: false })
      .limit(1);

    if (posError) throw posError;

    const nextPosition = tracks && tracks.length > 0 ? tracks[0].position + 1 : 0;

    const { data, error } = await supabase
      .from('room_playlist_tracks')
      .insert({
        room_id: roomId,
        track_id: trackId,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  removeFromPlaylist: async (roomId: string, trackId: string) => {
    const { error } = await supabase
      .from('room_playlist_tracks')
      .delete()
      .eq('room_id', roomId)
      .eq('track_id', trackId);

    if (error) throw error;
  },

  updatePlaybackState: async (roomId: string, isPlaying: boolean) => {
    const { data, error } = await supabase
      .from('room_playlists')
      .update({ is_playing: isPlaying })
      .eq('room_id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCurrentTrack: async (roomId: string, trackId: string | null) => {
    const { data, error } = await supabase
      .from('room_playlists')
      .update({ current_track_id: trackId })
      .eq('room_id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  searchYouTube: async (query: string) => {
    if (!query.trim()) {
      return { items: [] };
    }

    try {
      // Fetch with timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      // Make the API request
      const response = await fetch(
        `${API_URL}/api/music/youtube/search?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error searching YouTube:', errorData);
        throw new Error(errorData.error || 'Failed to search YouTube');
      }
      
      const data = await response.json();
      
      // Validate response format
      if (!data || !Array.isArray(data.items)) {
        console.error('Invalid response from YouTube API:', data);
        return { items: [] };
      }
      
      return data;
    } catch (error) {
      console.error('Error searching YouTube:', error);
      throw error; // Re-throw to allow the component to handle it
    }
  },

  getDemoTracks: async () => {
    try {
      console.log("Fetching demo tracks from backend");
      const response = await fetch(`${API_URL}/api/music/tracks`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error fetching demo tracks:', errorData);
        throw new Error(errorData.error || 'Failed to fetch demo tracks');
      }
      
      const data = await response.json();
      console.log("Demo tracks response:", data);
      
      if (data.tracks && Array.isArray(data.tracks)) {
        return data.tracks;
      } else {
        console.error("Invalid tracks data structure:", data);
        throw new Error('Invalid tracks data returned from API');
      }
    } catch (error) {
      console.error('Error fetching demo tracks:', error);
      // Return a fallback demo track if API call fails
      return [
        {
          id: 'fallback-track-1',
          title: 'Demo Music Track (Fallback)',
          artist: 'CodeCollab',
          cover: 'https://via.placeholder.com/200?text=Demo',
          duration: 180,
        },
        {
          id: 'fallback-track-2',
          title: 'Coding Session Lo-Fi (Fallback)',
          artist: 'Dev Music',
          cover: 'https://via.placeholder.com/200?text=Lo-Fi',
          duration: 240,
        },
      ];
    }
  },

  // Add function to play a track
  playTrack: async (roomId: string, trackId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_playlists')
        .update({
          current_track_id: trackId,
          is_playing: true
        })
        .eq('room_id', roomId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  },
  
  // Add function to pause a track
  pauseTrack: async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_playlists')
        .update({
          is_playing: false
        })
        .eq('room_id', roomId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error pausing track:', error);
      throw error;
    }
  },
};

// Demo room implementation
async function getDemoRoom() {
  // Check if demo room exists and is still valid
  const { data: existingRoom } = await supabase
    .from('rooms')
    .select('*')
    .eq('name', 'Demo Room')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  // Check if room exists and hasn't expired (created less than 1 hour ago)
  if (existingRoom) {
    const createdAt = new Date(existingRoom.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation < 1) {
      // Return existing demo room if it's less than 1 hour old
      return existingRoom;
    }
  }
  
  // Create new demo room
  try {
    // Generate a unique ID for the demo room
    const roomId = generateUUID();
    
    // Insert the demo room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        id: roomId,
        name: 'Demo Room',
        description: 'This is a demo room that anyone can join. It will expire after 1 hour.',
        is_public: true,
        owner_id: 'system',
        language: 'javascript',
        code: '// Welcome to the demo room!\nconsole.log("Hello, world!");',
      })
      .select()
      .single();
      
    if (roomError) {
      console.error("Error creating demo room:", roomError);
      throw roomError;
    }
    
    // Add a system user as room member
    await supabase
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id: 'system',
        role: 'owner',
      });
      
    // Create a welcome message
    await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: 'system',
        content: 'Welcome to the demo room! This room will expire after 1 hour.',
      });
      
    // Create empty playlist
    const { data: playlist } = await supabase
      .from('room_playlists')
      .insert({
        room_id: roomId,
        is_playing: false,
      })
      .select()
      .single();
    
    // Add a demo track to the playlist
    if (playlist) {
      try {
        // Attempt to get a demo track from the backend
        const demoTracks = await musicAPI.getDemoTracks();
        
        if (demoTracks && demoTracks.length > 0) {
          const demoTrack = demoTracks[0];
          
          // Add the demo track to the playlist
          await supabase
            .from('room_playlist_tracks')
            .insert({
              room_id: roomId,
              track_id: demoTrack.id,
              position: 0,
            });
            
          // Update the current track
          await supabase
            .from('room_playlists')
            .update({ current_track_id: demoTrack.id })
            .eq('room_id', roomId);
            
          console.log("Added demo track to playlist:", demoTrack);
        }
      } catch (trackError) {
        console.warn("Could not add demo track to playlist:", trackError);
        // This error is non-fatal, so continue
      }
    }
      
    return room;
  } catch (error) {
    console.error("Error creating demo room:", error);
    throw error;
  }
} 
