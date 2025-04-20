import { Server, Socket } from 'socket.io';
import { supabaseClient } from '../config/supabase';
import { SocketEvents } from '../types';

// Store active users and their room assignments
interface ActiveUser {
  socketId: string;
  userId: string;
  roomId: string;
}

// Store code in memory for real-time performance
interface RoomState {
  code: string;
  language: string;
  users: ActiveUser[];
  lastUpdated: number;
}

// In-memory store for active rooms
const activeRooms = new Map<string, RoomState>();

export const setupSocketHandlers = (io: Server) => {
  console.log('Setting up socket handlers');
  
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);
    
    // Get roomId from query params
    const roomId = socket.handshake.query.roomId as string;
    let userId = socket.handshake.query.userId as string || socket.id;
    
    // Handle joining a room
    socket.on('join-room', (joinRoomId: string) => {
      // If roomId was specified in this event, use it instead
      const targetRoomId = joinRoomId || roomId;
      if (!targetRoomId) {
        console.error('No room ID provided');
        return;
      }
      
      // Join socket.io room
      socket.join(targetRoomId);
      console.log(`User ${userId} joined room ${targetRoomId}`);
      
      // Initialize room state if it doesn't exist
      if (!activeRooms.has(targetRoomId)) {
        activeRooms.set(targetRoomId, {
          code: '',
          language: 'javascript',
          users: [],
          lastUpdated: Date.now()
        });
      }
      
      // Add user to room state
      const room = activeRooms.get(targetRoomId)!;
      room.users.push({
        socketId: socket.id,
        userId,
        roomId: targetRoomId
      });
      
      // Broadcast to other users in the room
      socket.to(targetRoomId).emit('user-joined', {
        userId,
        timestamp: Date.now()
      });
      
      // Send current code state to the new user
      socket.emit('code-sync', {
        code: room.code,
        language: room.language,
        timestamp: room.lastUpdated
      });
    });
    
    // Handle code updates
    socket.on('code-update', (data: { roomId: string; code: string; userId: string }) => {
      const { roomId: updateRoomId, code, userId: updateUserId } = data;
      console.log(`Received code update from ${updateUserId} in room ${updateRoomId}`);
      
      // Update room state
      if (activeRooms.has(updateRoomId)) {
        const room = activeRooms.get(updateRoomId)!;
        room.code = code;
        room.lastUpdated = Date.now();
        
        // Broadcast to all other clients in the room
        socket.to(updateRoomId).emit('code-update', {
          code,
          userId: updateUserId,
          timestamp: room.lastUpdated
        });
      }
    });
    
    // Handle language changes
    socket.on('language-change', (data: { roomId: string; language: string; userId: string }) => {
      const { roomId: langRoomId, language, userId: langUserId } = data;
      
      // Update room state
      if (activeRooms.has(langRoomId)) {
        const room = activeRooms.get(langRoomId)!;
        room.language = language;
        
        // Broadcast to all other clients in the room
        socket.to(langRoomId).emit('language-change', {
          language,
          userId: langUserId,
          timestamp: Date.now()
        });
      }
    });
    
    // Handle cursor position updates
    socket.on('cursor-position', (data: { roomId: string; position: any; userId: string }) => {
      const { roomId: cursorRoomId, position, userId: cursorUserId } = data;
      
      // Broadcast to all other clients in the room
      socket.to(cursorRoomId).emit('cursor-position', {
        position,
        userId: cursorUserId,
        timestamp: Date.now()
      });
    });
    
    // Handle chat messages
    socket.on('chat-message', (data: { roomId: string; message: any; userId: string }) => {
      const { roomId: msgRoomId, message, userId: msgUserId } = data;
      
      // Broadcast to all clients in the room (including sender for receipt confirmation)
      io.to(msgRoomId).emit('chat-message', {
        message,
        userId: msgUserId,
        timestamp: Date.now()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove user from all rooms they were in
      activeRooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex(u => u.socketId === socket.id);
        if (userIndex !== -1) {
          const user = room.users[userIndex];
          room.users.splice(userIndex, 1);
          
          // Notify others that user left
          socket.to(roomId).emit('user-left', {
            userId: user.userId,
            timestamp: Date.now()
          });
          
          // Cleanup empty rooms to prevent memory leaks
          if (room.users.length === 0) {
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} was cleaned up as it's empty`);
          }
        }
      });
    });
  });
}; 
