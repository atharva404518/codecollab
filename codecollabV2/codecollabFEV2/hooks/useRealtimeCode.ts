import { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useToast } from './use-toast';

interface UseRealtimeCodeProps {
  roomId: string;
  userId: string;
}

interface CodeUpdate {
  code: string;
  userId: string;
  timestamp: number;
}

const useRealtimeCode = ({ roomId, userId }: UseRealtimeCodeProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [connected, setConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    // Server URL should match your backend socket.io server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
    const socketInstance = io(socketUrl, {
      query: { roomId, userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      if (socketInstance) {
        console.log('Disconnecting socket...');
        socketInstance.disconnect();
      }
    };
  }, [roomId, userId]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Join the room
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the server. Trying to reconnect...',
        variant: 'destructive'
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server.',
        variant: 'destructive'
      });
    });

    // Code sync (initial code when joining a room)
    socket.on('code-sync', (data: { code: string; language: string }) => {
      console.log('Received initial code sync');
      setCode(data.code);
      setLanguage(data.language);
      setIsLoading(false);
    });

    // Real-time code updates
    socket.on('code-update', (update: CodeUpdate) => {
      if (update.userId !== userId) {
        console.log(`Received code update from ${update.userId}`);
        setCode(update.code);
      }
    });

    // Language changes
    socket.on('language-change', (data: { language: string; userId: string }) => {
      if (data.userId !== userId) {
        setLanguage(data.language);
        toast({
          title: 'Language Changed',
          description: `Language changed to ${data.language}`,
        });
      }
    });

    // User presence
    socket.on('user-joined', (data: { userId: string }) => {
      setActiveUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
      toast({
        title: 'User Joined',
        description: `User ${data.userId} joined the room`,
      });
    });

    socket.on('user-left', (data: { userId: string }) => {
      setActiveUsers(prev => prev.filter(u => u !== data.userId));
      toast({
        title: 'User Left',
        description: `User ${data.userId} left the room`,
      });
    });

    // Error handling
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
    });

    // Cleanup listeners on component unmount or socket change
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('code-sync');
      socket.off('code-update');
      socket.off('language-change');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('error');
    };
  }, [socket, roomId, userId, toast]);

  // Function to update code
  const updateCode = useCallback((newCode: string) => {
    setCode(newCode);
    
    if (socket && connected) {
      socket.emit('code-update', {
        roomId,
        code: newCode,
        userId
      });
    }
  }, [socket, connected, roomId, userId]);

  // Function to change language
  const changeLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    
    if (socket && connected) {
      socket.emit('language-change', {
        roomId,
        language: newLanguage,
        userId
      });
    }
  }, [socket, connected, roomId, userId]);

  // Function to update cursor position
  const updateCursorPosition = useCallback((position: any) => {
    if (socket && connected) {
      socket.emit('cursor-position', {
        roomId,
        position,
        userId
      });
    }
  }, [socket, connected, roomId, userId]);

  return {
    code,
    setCode: updateCode,
    language,
    setLanguage: changeLanguage,
    updateCursorPosition,
    connected,
    activeUsers,
    isLoading
  };
};

export default useRealtimeCode; 
