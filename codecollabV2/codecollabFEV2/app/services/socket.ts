import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token: string) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Room Events
  joinRoom(roomId: string) {
    this.socket?.emit('join-room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', roomId);
  }

  onRoomJoined(callback: (room: any) => void) {
    this.socket?.on('room-joined', callback);
  }

  onRoomLeft(callback: (roomId: string) => void) {
    this.socket?.on('room-left', callback);
  }

  // Code Events
  sendCodeChange(data: { roomId: string; code: string; cursorPosition: number }) {
    this.socket?.emit('code-change', data);
  }

  sendCursorPosition(data: { roomId: string; userId: string; position: number }) {
    this.socket?.emit('cursor-position', data);
  }

  onCodeChange(callback: (data: { roomId: string; code: string; cursorPosition: number }) => void) {
    this.socket?.on('code-change', callback);
  }

  onCursorPosition(callback: (data: { roomId: string; userId: string; position: number }) => void) {
    this.socket?.on('cursor-position', callback);
  }

  // Chat Events
  sendChatMessage(data: { roomId: string; content: string; userId: string }) {
    this.socket?.emit('chat-message', data);
  }

  sendTypingStart(data: { roomId: string; userId: string }) {
    this.socket?.emit('typing-start', data);
  }

  sendTypingStop(data: { roomId: string; userId: string }) {
    this.socket?.emit('typing-stop', data);
  }

  onChatMessage(callback: (message: any) => void) {
    this.socket?.on('chat-message', callback);
  }

  onTypingStart(callback: (data: { roomId: string; userId: string }) => void) {
    this.socket?.on('typing-start', callback);
  }

  onTypingStop(callback: (data: { roomId: string; userId: string }) => void) {
    this.socket?.on('typing-stop', callback);
  }

  // Music Events
  sendMusicPlay(data: { roomId: string; track: any }) {
    this.socket?.emit('music-play', data);
  }

  sendMusicPause(data: { roomId: string }) {
    this.socket?.emit('music-pause', data);
  }

  sendMusicSkip(data: { roomId: string }) {
    this.socket?.emit('music-skip', data);
  }

  onMusicPlay(callback: (data: { roomId: string; track: any }) => void) {
    this.socket?.on('music-play', callback);
  }

  onMusicPause(callback: (data: { roomId: string }) => void) {
    this.socket?.on('music-pause', callback);
  }

  onMusicSkip(callback: (data: { roomId: string }) => void) {
    this.socket?.on('music-skip', callback);
  }

  onMusicQueueUpdate(callback: (data: { roomId: string; queue: any[] }) => void) {
    this.socket?.on('music-queue-update', callback);
  }
}

export const socketService = SocketService.getInstance(); 
