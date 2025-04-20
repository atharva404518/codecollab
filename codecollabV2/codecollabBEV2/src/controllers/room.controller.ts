import { Request, Response } from 'express';
import { supabaseClient, supabaseAdmin } from '../config/supabase';
import { Room, RoomMember } from '../types';
import { customAlphabet } from 'nanoid';

// Function to generate a unique room code
const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, isPublic, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const roomCode = generateRoomCode(); // Generate a unique room code

    // Create the room
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .insert({
        name,
        owner_id: userId,
        is_public: isPublic,
        language,
        room_code: roomCode, // Save the generated room code
      })
      .select()
      .single();

    if (roomError || !room) {
      // Handle potential duplicate room_code error here if needed
      console.error('Room creation error:', roomError);
      return res.status(500).json({ error: 'Failed to create room' });
    }

    // Add the owner as a member
    const { error: memberError } = await supabaseClient
      .from('room_members')
      .insert({
        room_id: room.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) {
      // Rollback room creation if member creation fails
      await supabaseClient.from('rooms').delete().eq('id', room.id);
      return res.status(500).json({ error: 'Failed to add room member' });
    }

    res.status(201).json(room); // Return the full room object including id and room_code
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if room exists and is public
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.is_public) {
      return res.status(403).json({ error: 'Room is private' });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseClient
      .from('room_members')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return res.status(200).json(room);
    }

    // Add user as a member
    const { error: memberError } = await supabaseClient
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id: userId,
        role: 'editor',
      });

    if (memberError) {
      return res.status(500).json({ error: 'Failed to join room' });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a member of the room
    const { data: member } = await supabaseClient
      .from('room_members')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get room details
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get room members
    const { data: members, error: membersError } = await supabaseClient
      .from('room_members')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('room_id', roomId);

    if (membersError) {
      return res.status(500).json({ error: 'Failed to fetch room members' });
    }

    res.status(200).json({
      ...room,
      members: members.map(member => ({
        ...member,
        user: member.users
      }))
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { name, isPublic, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is the owner
    const { data: member } = await supabaseClient
      .from('room_members')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .eq('role', 'owner')
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Only room owner can update room' });
    }

    // Update room
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .update({
        name,
        is_public: isPublic,
        language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .select()
      .single();

    if (roomError || !room) {
      return res.status(500).json({ error: 'Failed to update room' });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinRoomByCode = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.body; // Assuming room code is sent in the body
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roomCode || typeof roomCode !== 'string') {
        return res.status(400).json({ error: 'Room code is required' });
    }

    // Find the room by its code
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase()) // Compare case-insensitively if needed
      .single();

    if (roomError || !room) {
        console.error("Find room by code error:", roomError);
        return res.status(404).json({ error: 'Room not found or invalid code' });
    }

    // Check if user is already a member
    const { data: existingMember, error: existingMemberError } = await supabaseClient
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to handle null case gracefully

    if (existingMemberError) {
        console.error("Check existing member error:", existingMemberError);
        return res.status(500).json({ error: 'Failed to check room membership' });
    }

    if (existingMember) {
      // User is already a member, redirect or return room info
      return res.status(200).json({ message: 'Already a member', room });
    }

    // If room is private and user is not the owner, deny access (or handle invites)
    if (!room.is_public && room.owner_id !== userId) {
        // TODO: Implement invitation system if needed
        return res.status(403).json({ error: 'Room is private' });
    }

    // Add user as a member (role can be 'editor' or based on logic)
    const { error: memberError } = await supabaseClient
      .from('room_members')
      .insert({
        room_id: room.id,
        user_id: userId,
        role: 'editor', // Default role for joining
      });

    if (memberError) {
        console.error("Add member error:", memberError);
        return res.status(500).json({ error: 'Failed to join room' });
    }

    // Return success message and room details
    res.status(200).json({ message: 'Successfully joined room', room });

  } catch (error) {
    console.error('Join room by code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
