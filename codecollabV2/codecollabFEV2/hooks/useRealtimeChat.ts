import { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useToast } from './use-toast';

interface UseRealtimeChatProps {
  roomId: string;
  userId: string;
  username: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

const useRealtimeChat = ({ roomId, userId, username }: UseRealtimeChatProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
    const socketInstance = io(socketUrl, {
      query: { roomId, userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        console.log('Disconnecting chat socket...');
        socketInstance.disconnect();
      }
    };
  }, [roomId, userId]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      console.log('Chat socket connected');
      setConnected(true);
      
      // Join the chat room
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      setConnected(false);
    });

    // Initial messages when joining a room
    socket.on('chat-history', (data: { messages: ChatMessage[] }) => {
      console.log('Received chat history', data.messages);
      setMessages(data.messages);
      setIsLoading(false);
    });

    // New chat messages
    socket.on('chat-message', (message: ChatMessage) => {
      console.log('Received new chat message', message);
      setMessages(prev => [...prev, message]);
      
      // Only show notification if message is from someone else
      if (message.userId !== userId) {
        toast({
          title: `${message.username}`,
          description: message.message,
        });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat-history');
      socket.off('chat-message');
    };
  }, [socket, roomId, userId, toast]);

  // Function to send a message
  const sendMessage = useCallback((message: string) => {
    if (!socket || !connected || !message.trim()) return;
    
    const newMessage: Omit<ChatMessage, 'id'> = {
      roomId,
      userId,
      username,
      message: message.trim(),
      timestamp: Date.now(),
    };
    
    socket.emit('chat-message', newMessage);
  }, [socket, connected, roomId, userId, username]);

  return {
    messages,
    sendMessage,
    connected,
    isLoading
  };
};

export default useRealtimeChat; 
