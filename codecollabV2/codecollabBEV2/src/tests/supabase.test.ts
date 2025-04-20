import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Supabase Integration Tests', () => {
  let testUser: any;
  let testRoom: any;
  const testEmail = `test${Date.now()}@example.com`; // Generate unique email

  beforeAll(async () => {
    // Create a test user
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          username: 'testuser'
        }
      }
    });

    if (userError) {
      console.error('Error creating test user:', userError);
      throw userError;
    }
    
    testUser = userData.user;

    // Wait for user to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup test data
    if (testRoom?.id) {
      await supabase.from('rooms').delete().eq('id', testRoom.id);
    }
    if (testUser?.id) {
      // Delete user profile first
      await supabase.from('users').delete().eq('id', testUser.id);
      // Then delete auth user
      await supabase.auth.admin.deleteUser(testUser.id);
    }
  });

  test('should create a room', async () => {
    const roomData = {
      name: 'Test Room',
      description: 'Test Description',
      is_public: true,
      language: 'javascript',
      owner_id: testUser.id,
    };

    const { data: room, error } = await supabase
      .from('rooms')
      .insert(roomData)
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw error;
    }

    expect(room).toBeTruthy();
    expect(room.name).toBe(roomData.name);
    expect(room.is_public).toBe(roomData.is_public);
    expect(room.language).toBe(roomData.language);

    testRoom = room;
  });

  test('should join a room', async () => {
    const { error } = await supabase
      .from('room_members')
      .insert({
        room_id: testRoom.id,
        user_id: testUser.id,
        role: 'member',
      });

    if (error) {
      console.error('Error joining room:', error);
      throw error;
    }

    expect(error).toBeNull();
  });

  test('should send a message', async () => {
    const messageData = {
      room_id: testRoom.id,
      user_id: testUser.id,
      content: 'Test message',
    };

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    expect(error).toBeNull();
  });

  test('should update room code', async () => {
    const newCode = 'console.log("Hello, World!");';

    const { error } = await supabase
      .from('rooms')
      .update({ code: newCode })
      .eq('id', testRoom.id);

    if (error) {
      console.error('Error updating room code:', error);
      throw error;
    }

    expect(error).toBeNull();
  });
}); 
