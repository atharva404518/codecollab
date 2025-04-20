"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
// Use dynamic import for the Editor to ensure it loads properly
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Send,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Zap,
  Copy,
  Users,
  Plus,
  Search,
  PlayCircle,
  Trash2,
  Code,
  Upload,
  ListMusic,
  Music,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/contexts/AuthContext";
import { roomAPI, musicAPI, supabase } from "@/app/services/api";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url?: string;
    role?: string;
  };
}

interface Song {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  duration: number;
  audioUrl?: string;
  isLocal?: boolean;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  members: User[];
  code?: string;
}

// Define an interface for the DemoTrack type
interface DemoTrack {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  audioUrl?: string;
  duration: number;
}

// Add an interface for playlist data from Supabase
interface RoomPlaylist {
  room_id: string;
  current_track_id?: string;
  is_playing?: boolean;
}

export default function RoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [code, setCode] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [editorMounted, setEditorMounted] = useState(false);
  const [showRoomIdCopied, setShowRoomIdCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [languageOptions] = useState([
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "sql", label: "SQL" },
    { value: "shell", label: "Shell Script" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
  ]);
  const codeUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const localCodeRef = useRef<string>("");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!id) return;
      setIsLoading(true);
      console.log("Fetching data for room:", id);

      try {
        // Fetch room data
        const roomData = await roomAPI.getRoom(id as string);
        if (!roomData) {
          setError("Room not found");
          return;
        }
        console.log("Room data fetched successfully:", roomData);
        setRoom(roomData);
        setCode(roomData.code || "");
        setLanguage(roomData.language || "javascript");

        // Try to fetch messages
        try {
          const { data: messagesData } = await supabase
            .from("messages")
            .select("*, user:user_id (username, avatar_url)")
            .eq("room_id", id)
            .order("created_at", { ascending: true });

          if (messagesData) {
            // Add role information to messages
            const messagesWithRoles = messagesData.map((msg: any) => {
              if (msg.user_id === roomData.owner_id) {
                return {
                  ...msg,
                  user: {
                    ...msg.user,
                    role: "admin",
                  },
                };
              } else {
                return {
                  ...msg,
                  user: {
                    ...msg.user,
                    role: "guest",
                  },
                };
              }
            });

            console.log("Messages loaded:", messagesWithRoles.length);
            setMessages(messagesWithRoles);
            // Scroll to bottom of messages
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        } catch (messageError) {
          console.warn("Could not load messages:", messageError);
        }

        // Try to fetch playlist tracks
        try {
          // Check if there's a playlist for this room
          const { data: playlistData } = await supabase
            .from("room_playlists")
            .select("current_track_id, is_playing")
            .eq("room_id", id)
            .single();

          if (playlistData) {
            console.log("Playlist data:", playlistData);
            setIsPlaying(playlistData.is_playing || false);

            // Load the tracks in the playlist
            const { data: playlistTracks } = await supabase
              .from("room_playlist_tracks")
              .select("*")
              .eq("room_id", id)
              .order("position", { ascending: true });

            if (playlistTracks && playlistTracks.length > 0) {
              console.log("Playlist tracks:", playlistTracks);

              // If we don't have any demo tracks, fetch them
              const demoTracks = await musicAPI.getDemoTracks();
              console.log("Demo tracks:", demoTracks);

              // Create Song objects from the tracks
              const loadedSongs: Song[] = playlistTracks.map((track) => {
                // Find the matching demo track
                const demoTrack = demoTracks.find(
                  (dt: DemoTrack) => dt.id === track.track_id
                );

                if (demoTrack) {
                  return {
                    id: demoTrack.id,
                    title: demoTrack.title,
                    artist: demoTrack.artist,
                    cover: demoTrack.cover,
                    duration: demoTrack.duration,
                  };
                } else {
                  // Fallback if track not found
                  return {
                    id: track.track_id,
                    title: "Unknown Track",
                    artist: "Unknown Artist",
                    cover: "https://via.placeholder.com/200",
                    duration: 180,
                  };
                }
              });

              setSongs(loadedSongs);

              // Set current song if there's a current_track_id
              if (playlistData.current_track_id) {
                const currentTrackId = playlistData.current_track_id;
                const currentSongData = loadedSongs.find(
                  (s) => s.id === currentTrackId
                );

                if (currentSongData) {
                  setCurrentSong(currentSongData);
                } else if (loadedSongs.length > 0) {
                  // Fallback to first song if current not found
                  setCurrentSong(loadedSongs[0]);
                }
              } else if (loadedSongs.length > 0) {
                // If no current track set but we have songs, use the first one
                setCurrentSong(loadedSongs[0]);
              }
            }
          }
        } catch (playlistError) {
          console.warn("Could not load playlist:", playlistError);
        }

        // Join room (unless we're anonymous)
        try {
          if (user) {
            await roomAPI.joinRoom(id as string);
          }
        } catch (joinError) {
          console.warn("Error joining room (continuing anyway):", joinError);
        }

        // Set up subscriptions
        setupSubscriptions(id as string);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching room data:", error);
        setError("Failed to load room data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [id, user]);

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Separate function to set up subscriptions for better organization
  const setupSubscriptions = (roomId: string) => {
    try {
      console.log("Setting up real-time subscriptions for room:", roomId);

      // Create a single Supabase channel for all subscriptions
      const channel = supabase.channel(`room-${roomId}`);

      // Subscribe to code changes
      channel.on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
          columns: ["code"],
        },
        (payload) => {
          console.log("Real-time code update received:", payload);
          if (payload.new && payload.new.code !== undefined) {
            // Only update if it's different from current code to avoid loops
            const newCode = payload.new.code;
            if (newCode !== code) {
              console.log("Setting new code from subscription");
              setCode(newCode);
            }
          }
        }
      );

      // Subscribe to language changes
      channel.on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
          columns: ["language"],
        },
        (payload) => {
          console.log("Language update received:", payload);
          if (payload.new && payload.new.language !== undefined) {
            setLanguage(payload.new.language);
          }
        }
      );

      // Subscribe to playlist updates for real-time music
      channel.on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "room_playlists",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("Playlist update received:", payload);
          if (payload.new) {
            const playlistData = payload.new as RoomPlaylist;

            // Update current playing state
            setIsPlaying(playlistData.is_playing || false);

            // Update current track if it changed
            if (
              playlistData.current_track_id &&
              (!currentSong || currentSong.id !== playlistData.current_track_id)
            ) {
              const currentTrackId = playlistData.current_track_id;
              const matchingSong = songs.find((s) => s.id === currentTrackId);

              if (matchingSong) {
                console.log("Setting current song:", matchingSong);
                setCurrentSong(matchingSong);
              }
            }
          }
        }
      );

      // Subscribe to new songs added to playlist
      channel.on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "room_playlist_tracks",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("New playlist track added:", payload);
          if (payload.new) {
            // Fetch the track details
            try {
              const trackId = payload.new.track_id;
              const demoTracks = await musicAPI.getDemoTracks();
              const matchingTrack = demoTracks.find(
                (track: DemoTrack) => track.id === trackId
              );

              if (matchingTrack) {
                const newSong: Song = {
                  id: matchingTrack.id,
                  title: matchingTrack.title,
                  artist: matchingTrack.artist,
                  cover: matchingTrack.cover,
                  duration: matchingTrack.duration,
                };

                // Add to songs if not already present
                setSongs((prev) => {
                  if (prev.some((s) => s.id === newSong.id)) {
                    return prev;
                  }
                  return [...prev, newSong];
                });
              }
            } catch (error) {
              console.error("Error fetching added track:", error);
            }
          }
        }
      );

      // Subscribe to songs removed from playlist
      channel.on(
        "postgres_changes" as any,
        {
          event: "DELETE",
          schema: "public",
          table: "room_playlist_tracks",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Playlist track removed:", payload);
          if (payload.old) {
            const removedTrackId = payload.old.track_id;

            // Remove from songs list
            setSongs((prev) => prev.filter((s) => s.id !== removedTrackId));

            // If removed song was current, play next song
            if (currentSong?.id === removedTrackId) {
              const remainingSongs = songs.filter(
                (song) => song.id !== removedTrackId
              );
              if (remainingSongs.length > 0) {
                setCurrentSongAndUpdate(remainingSongs[0]);
              } else {
                setCurrentSong(null);
              }
            }
          }
        }
      );

      // Subscribe to messages
      channel.on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("New message received:", payload.new);
          try {
            // Get the user info for the message
            const { data: userData } = await supabase
              .from("users")
              .select("username, avatar_url")
              .eq("id", payload.new.user_id)
              .single();

            // Add role based on room ownership
            const isAdmin = room?.owner_id === payload.new.user_id;
            const userRole = isAdmin ? "admin" : "guest";

            // Only add if we don't already have this message
            const newMessageId = payload.new.id;
            setMessages((prev) => {
              // Check if we already have this message
              if (prev.some((msg) => msg.id === newMessageId)) {
                return prev;
              }

              // Add the new message with user info and role
              const newMessage = {
                ...payload.new,
                user: {
                  ...(userData || {
                    username: payload.new.user_id.substring(0, 8),
                    avatar_url: undefined,
                  }),
                  role: userRole,
                },
              } as Message;

              return [...prev, newMessage];
            });

            // Scroll to bottom to show new message
            setTimeout(scrollToBottom, 50);
          } catch (error) {
            console.error("Error handling new message:", error);
          }
        }
      );

      // Subscribe
      channel.subscribe((status) => {
        console.log(`Channel status: ${status}`);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error connecting to real-time updates");
        }
      });

      // Return cleanup function
      return () => {
        console.log("Cleaning up subscriptions");
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error setting up subscriptions:", error);
    }
  };

  // Connect to socket.io server on component mount
  useEffect(() => {
    if (!id) return;

    // Connect to the socket.io server
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      {
        query: { roomId: id },
      }
    );

    setSocket(socketInstance);

    // Setup socket event listeners
    socketInstance.on("connect", () => {
      console.log("Connected to real-time server");
      socketInstance.emit("join-room", id);
    });

    socketInstance.on(
      "code-update",
      (data: { code: string; userId: string }) => {
        console.log("Received code update from:", data.userId);

        // Only update if the change came from another user
        if (data.userId !== user?.id) {
          console.log("Updating local code from socket");
          setCode(data.code);

          // If editor is available, update cursor position
          if (editorRef.current) {
            const currentPosition = editorRef.current.getPosition();
            editorRef.current.setValue(data.code);
            editorRef.current.setPosition(currentPosition);
          }
        }
      }
    );

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from real-time server");
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, [id, user]);

  // Update the handleEditorDidMount function
  const handleEditorDidMount = (editor: any, monaco: any) => {
    console.log("Editor mounted successfully");
    setEditorMounted(true);
    editorRef.current = editor;
  };

  // Optimized editor change handler with real-time updates
  const handleEditorChange = async (value: string | undefined) => {
    if (value !== undefined && value !== localCodeRef.current) {
      console.log("Editor value changed, updating code");

      // Update local state and ref immediately
      setCode(value);
      localCodeRef.current = value;

      // Throttle updates to avoid overwhelming the server
      const now = Date.now();
      if (now - lastUpdateTime > 300) {
        // Throttle to max 3 updates per second
        setLastUpdateTime(now);

        // Send code update via socket for real-time collaboration
        if (socket && socket.connected && user) {
          socket.emit("code-update", {
            roomId: id,
            code: value,
            userId: user.id,
          });
        }

        // Use debounce for database persistence
        if (codeUpdateTimeout.current) {
          clearTimeout(codeUpdateTimeout.current);
        }

        // Send change to database after short delay for persistence
        codeUpdateTimeout.current = setTimeout(async () => {
          try {
            console.log("Sending code update to database for persistence");
            // Update the code in the database
            const { error } = await supabase
              .from("rooms")
              .update({ code: value })
              .eq("id", id as string);

            if (error) {
              throw error;
            }

            console.log("Code updated in database successfully");
          } catch (error) {
            console.error("Error updating code:", error);
            toast({
              title: "Error",
              description: "Failed to sync code changes",
              variant: "destructive",
            });
          }
        }, 1000); // Longer debounce for database updates
      }
    }
  };

  // Update the handleCopyRoomId function to show feedback
  const handleCopyRoomId = () => {
    if (!room) return;

    navigator.clipboard.writeText(room.id);
    setShowRoomIdCopied(true);

    toast({
      title: "Room ID copied!",
      description: "Share this ID with others to let them join your room.",
    });

    setTimeout(() => {
      setShowRoomIdCopied(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Create a temporary message ID
      const tempId = `temp-${Date.now()}`;

      // Get the current user info (fallback to guest if not authenticated)
      const userId = user?.id || `guest-${Date.now()}`;
      const username = user?.user_metadata?.username || "Guest";
      const avatar_url = user?.user_metadata?.avatar_url;

      // Optimistically add the message to the UI
      const optimisticMessage: Message = {
        id: tempId,
        room_id: id as string,
        user_id: userId,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        user: {
          username: username,
          avatar_url: avatar_url,
        },
      };

      // Update UI first for better responsiveness
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");
      setTimeout(scrollToBottom, 50);

      // Send the message to the server
      await roomAPI.sendMessage(id as string, newMessage.trim());
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleEnhanceCode = async () => {
    if (!code.trim()) return;

    try {
      const enhancedCode = await roomAPI.enhanceCode(id as string, code);
      setCode(enhancedCode);

      toast({
        title: "Success",
        description: "Code enhanced successfully",
      });
    } catch (error) {
      console.error("Error enhancing code:", error);
      toast({
        title: "Error",
        description: "Failed to enhance code",
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);

    // Update the room's language in the database
    try {
      await roomAPI.updateRoomLanguage(id as string, newLanguage);
      toast({
        title: "Language changed",
        description: `Code language set to ${newLanguage}`,
      });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please write some code first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clear previous output
      setTerminalOutput([`Running ${language} code...`]);

      // For JavaScript/TypeScript, we can run in the browser
      if (language === "javascript" || language === "typescript") {
        const logs: string[] = [];
        executeJavaScript(code, logs);
        setTerminalOutput((prev) => [...prev, ...logs]);
      } else {
        // For all other languages, call the backend API
        try {
          // Show running message
          setTerminalOutput([`Running ${language} code on server...`]);

          // Call the backend API to execute the code
          const result = await roomAPI.executeCode(language, code);

          if (result.error) {
            setTerminalOutput([
              `Error executing ${language} code:`,
              result.error,
            ]);
          } else {
            // Format the output
            const outputLines = result.output
              ? result.output.split("\n")
              : ["No output"];

            setTerminalOutput([
              `${language} execution completed:`,
              ...outputLines,
            ]);
          }
        } catch (error) {
          console.error("Error executing code on server:", error);
          setTerminalOutput([
            `Failed to execute ${language} code on server.`,
            `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            "Falling back to simulation...",
          ]);

          // Fallback to simulation
          const logs: string[] = [];
          simulateExecution(language, code, logs);
          setTerminalOutput((prev) => [...prev, ...logs]);
        }
      }
    } catch (error) {
      console.error("Error running code:", error);
      setTerminalOutput((prev) => [...prev, `Error: ${error}`]);
    }
  };

  // Function to execute JavaScript code safely
  const executeJavaScript = (code: string, logs: string[]) => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    try {
      // Override console methods to capture output
      console.log = (...args) => {
        logs.push(args.join(" "));
        originalConsoleLog(...args);
      };

      console.error = (...args) => {
        logs.push(`Error: ${args.join(" ")}`);
        originalConsoleError(...args);
      };

      console.warn = (...args) => {
        logs.push(`Warning: ${args.join(" ")}`);
        originalConsoleWarn(...args);
      };

      // Create a safe environment for code execution
      const safeEval = new Function(`
        try {
          ${code}
        } catch (error) {
          console.error(error);
        }
        return undefined;
      `);

      safeEval();
    } catch (error) {
      logs.push(`Runtime Error: ${error}`);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    }
  };

  // Function to simulate execution for other languages
  const simulateExecution = (
    language: string,
    code: string,
    logs: string[]
  ) => {
    logs.push(`Simulating ${language} execution in browser environment...`);
    logs.push(`Note: Full ${language} execution requires a backend runtime.`);

    // Extract print/output statements based on language
    const outputRegexMap: Record<string, RegExp> = {
      python: /print\((.*?)\)/g,
      java: /System\.out\.println\((.*?)\);/g,
      csharp: /Console\.WriteLine\((.*?)\);/g,
      cpp: /cout\s*<<\s*(.*?)\s*<<\s*endl;/g,
      ruby: /puts\s+(.*?)$/gm,
      go: /fmt\.Println\((.*?)\)/g,
      rust: /println!\((.*?)\);/g,
      php: /echo\s+(.*?);/g,
    };

    const regex = outputRegexMap[language];

    if (regex) {
      let match;
      let foundOutput = false;

      while ((match = regex.exec(code)) !== null) {
        foundOutput = true;
        logs.push(`Output: ${match[1].replace(/["'`]/g, "")}`);
      }

      if (!foundOutput) {
        logs.push("No output statements detected in code.");
      }
    } else {
      logs.push(`Cannot simulate output for ${language}.`);
    }

    logs.push("Simulation complete.");
  };

  const handleClearTerminal = () => {
    setTerminalOutput([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Modify the handleSetCurrentSong function to accept the correct type
  const setCurrentSongAndUpdate = async (song: Song) => {
    try {
      console.log("Setting current song and updating playlist:", song);

      // Update local state immediately for responsive UI
      setCurrentSong(song);

      // Try to update in database
      await musicAPI.playTrack(id as string, song.id);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error updating current song:", error);
      toast({
        title: "Error",
        description: "Failed to update current track",
        variant: "destructive",
      });
    }
  };

  const handleNextSong = async () => {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];

    setCurrentSongAndUpdate(nextSong);
  };

  const handlePrevSong = async () => {
    if (!currentSong || !songs.length) return;

    try {
      const currentIndex = songs.findIndex(
        (song) => song.id === currentSong.id
      );
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      const prevSong = songs[prevIndex];

      setCurrentSongAndUpdate(prevSong);
    } catch (error) {
      console.error("Error updating current track:", error);
      toast({
        title: "Error",
        description: "Failed to update current track",
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!currentSong) return;

      if (isPlaying) {
        // Pause music
        await musicAPI.pauseTrack(id as string);
      } else {
        // Resume music
        await musicAPI.playTrack(id as string, currentSong.id);
      }

      // Toggle local state for immediate feedback
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling playback:", error);
      toast({
        title: "Error",
        description: "Failed to control playback",
        variant: "destructive",
      });
    }
  };

  const handleAddSong = async (song: Song) => {
    try {
      await roomAPI.addToPlaylist(id as string, song.id);
      setSongs((prev) => [...prev, song]);

      // If this is the first song, set it as current
      if (!currentSong) {
        setCurrentSongAndUpdate(song);
      }
    } catch (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Error",
        description: "Failed to add song to playlist",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await roomAPI.removeFromPlaylist(id as string, songId);
      setSongs((prev) => prev.filter((song) => song.id !== songId));

      // If removed song was current, play next song
      if (currentSong?.id === songId) {
        const remainingSongs = songs.filter((song) => song.id !== songId);
        if (remainingSongs.length > 0) {
          setCurrentSongAndUpdate(remainingSongs[0]);
        } else {
          setCurrentSong(null);
        }
      }
    } catch (error) {
      console.error("Error removing song:", error);
      toast({
        title: "Error",
        description: "Failed to remove song from playlist",
        variant: "destructive",
      });
    }
  };

  // Function to handle actual audio playback
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();

      // Add event listeners
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("ended", handleSongEnd);
      audioRef.current.addEventListener("canplay", () => {
        if (isPlaying) audioRef.current?.play();
      });
    }

    // Set volume
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }

    return () => {
      // Clean up event listeners and audio
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleSongEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [volume]);

  // Update audio source when current song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      // Stop current playback
      audioRef.current.pause();

      // Determine the audio source
      let audioSrc = "";
      if (currentSong.audioUrl) {
        audioSrc = currentSong.audioUrl;
      } else if (currentSong.id.startsWith("local-")) {
        // For local files we already set the audioUrl property
        audioSrc = currentSong.audioUrl || "";
      } else {
        // For YouTube or demo tracks, we should have a backend proxy endpoint or local audio file
        audioSrc = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/music/stream/${currentSong.id}`;
      }

      console.log("Loading audio source:", audioSrc);

      // Set the new source and load it
      audioRef.current.src = audioSrc;
      audioRef.current.load();

      // Reset time and progress
      setCurrentTime(0);
      setProgressPercent(0);

      // Play if needed
      if (isPlaying) {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
            })
            .catch((error) => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
              toast({
                title: "Playback Error",
                description: "Could not play this track. Try another one.",
                variant: "destructive",
              });
            });
        }
      }
    }
  }, [currentSong]);

  // Handle play/pause changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            toast({
              title: "Playback Error",
              description: "Could not play this track. Try another one.",
              variant: "destructive",
            });
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current && currentSong) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || currentSong.duration;

      setCurrentTime(currentTime);
      setProgressPercent((currentTime / duration) * 100);
    }
  };

  // Song end handler
  const handleSongEnd = () => {
    // Play next song when current one ends
    handleNextSong();
  };

  // Progress bar click handler
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentSong) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const clickPercent = clickPosition / rect.width;

    // Set the current time based on click position
    const newTime =
      clickPercent * (audioRef.current.duration || currentSong.duration);
    audioRef.current.currentTime = newTime;

    // Update state
    setCurrentTime(newTime);
    setProgressPercent(clickPercent * 100);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Process each uploaded file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Basic validation
        if (!file.type.startsWith("audio/")) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an audio file.`,
            variant: "destructive",
          });
          continue;
        }

        // Create local URL for the file
        const fileUrl = URL.createObjectURL(file);

        // Extract metadata from file name
        let title = file.name;
        let artist = "Unknown Artist";

        // Try to parse artist from filename (Artist - Title.mp3)
        if (title.includes(" - ")) {
          const parts = title.split(" - ");
          artist = parts[0];
          title = parts[1].replace(/\.[^/.]+$/, ""); // Remove extension
        } else {
          title = title.replace(/\.[^/.]+$/, ""); // Remove extension
        }

        // Create a song object
        const localSong: Song = {
          id: `local-${Date.now()}-${i}`,
          title: title,
          artist: artist,
          duration: 0, // Will be updated once audio loads
          audioUrl: fileUrl,
          isLocal: true,
        };

        // Add to playlist
        setSongs((prev) => [...prev, localSong]);

        // Set as current if none playing
        if (!currentSong) {
          setCurrentSongAndUpdate(localSong);
        }

        toast({
          title: "Upload Complete",
          description: `Added "${title}" to playlist`,
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload Error",
        description: "Failed to process audio files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  // Function to search for songs using YouTube API
  const searchYouTubeVideos = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Call the music API search function
      const results = await musicAPI.searchYouTube(query);

      // If the results are empty or not an array, show error
      if (
        !results ||
        !Array.isArray(results.items) ||
        results.items.length === 0
      ) {
        toast({
          title: "No results",
          description: "No songs found for your search term",
        });
        setIsSearching(false);
        return;
      }

      // Convert results to Song objects
      const songs: Song[] = results.items.slice(0, 5).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        cover: item.snippet.thumbnails.default.url,
        duration: 180, // Placeholder duration as YouTube API doesn't return duration in search results
      }));

      setSearchResults(songs);

      toast({
        title: "Search complete",
        description: `Found ${songs.length} recommendations`,
      });
    } catch (error) {
      console.error("Error searching YouTube:", error);

      // Fallback - add a generic song for demo purposes
      setSearchResults([
        {
          id: "demo-fallback-1",
          title: "Lo-Fi Beats for Coding",
          artist: "Code Tunes",
          cover: "https://via.placeholder.com/200?text=Lo-Fi",
          duration: 180,
        },
        {
          id: "demo-fallback-2",
          title: "Ambient Work Music",
          artist: "Productivity Sounds",
          cover: "https://via.placeholder.com/200?text=Ambient",
          duration: 210,
        },
      ]);

      toast({
        title: "Search Results (Demo)",
        description:
          "Using demo songs as fallback. YouTube API might be unavailable.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 p-8 rounded-lg max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
          <p className="text-white mb-6">{error}</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-xl text-white">Loading room...</p>
        </div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #10b981;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-black/70 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-gray-800/50">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{room?.name || "Loading..."}</h1>
        </div>

        {/* Room ID Display */}
        <div className="flex items-center space-x-2 bg-secondary/30 p-2 rounded-lg">
          <span className="text-sm text-gray-400">Room ID:</span>
          <code className="text-sm bg-black/50 px-2 py-1 rounded">
            {id?.toString()}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyRoomId}
            className="h-8 px-2 relative hover:bg-gray-800/50"
          >
            <Copy className="h-4 w-4" />
            {showRoomIdCopied && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-6 -left-2 text-xs bg-primary text-black px-2 py-1 rounded"
              >
                Copied!
              </motion.span>
            )}
          </Button>
          <span className="text-xs text-gray-500 hidden sm:inline">
            (Share to invite others)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnhanceCode}
            className="flex items-center text-xs bg-yellow-500 text-black px-2 py-1 rounded border-black hover:bg-yellow-400 transition-colors"
          >
            <Zap className="mr-2 h-4 w-4" /> Enhance Code
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <Code className="h-4 w-4" />
                <span>
                  {languageOptions.find((lang) => lang.value === language)
                    ?.label || "JavaScript"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languageOptions.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={language === lang.value ? "bg-primary/20" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="bg-secondary/30 p-2 rounded-md">
            <Users className="h-4 w-4 inline mr-2" />
            <span className="text-sm">{room?.members?.length || 1} online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Add a wrapper with position relative for the editor */}
          <div className="relative flex-1 overflow-hidden">
            {!editorMounted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-center">
                  <div className="loader mb-4"></div>
                  <p>Loading editor...</p>
                </div>
              </div>
            )}
            <Editor
              height="100%"
              language={language || "javascript"}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
                lineNumbers: "on",
                renderLineHighlight: "all",
                colorDecorators: true,
              }}
              onMount={handleEditorDidMount}
            />
          </div>

          {/* Terminal Section */}
          <div className="h-1/3 border-t border-gray-800 bg-black p-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Terminal</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunCode}
                  className="text-xs h-7 text-white bg-primary border-black hover:bg-primary/80"
                >
                  <Play className="mr-1 h-3 w-3" /> Run
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearTerminal}
                  className="text-xs h-7 text-white bg-red-500 border-black hover:bg-red-600"
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Clear
                </Button>
              </div>
            </div>
            <div className="font-mono text-sm text-gray-300 bg-gray-900/50 p-2 rounded flex-1 overflow-auto">
              {terminalOutput.length > 0 ? (
                terminalOutput.map((line, index) => (
                  <div key={index} className="mb-1">
                    &gt; {line}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  Run your code to see output here...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-800 flex flex-col h-full">
          <Tabs defaultValue="chat" className="flex flex-col h-full">
            <TabsList className="grid grid-cols-2 mx-4 mt-4 bg-black">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
            </TabsList>

            <TabsContent
              value="chat"
              className="flex-1 flex flex-col h-full overflow-hidden"
              forceMount={true}
              hidden={false}
            >
              <div className="flex-1 px-4 py-2 overflow-y-auto">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-2 ${
                          message.user_id === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.user_id !== user?.id && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={message.user?.avatar_url} />
                            <AvatarFallback>
                              {message.user?.username
                                ?.substring(0, 2)
                                .toUpperCase() ||
                                message.user_id.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.user_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          {message.user_id !== user?.id && (
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-medium opacity-70">
                                {message.user?.username || "User"}
                              </p>
                              {message.user?.role && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    message.user.role === "admin"
                                      ? "bg-primary/20 text-primary"
                                      : "bg-gray-700 text-gray-300"
                                  }`}
                                >
                                  {message.user.role === "admin"
                                    ? "Admin"
                                    : "Guest"}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {message.user_id === user?.id && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                              src={user?.user_metadata?.avatar_url}
                            />
                            <AvatarFallback>
                              {user?.user_metadata?.username
                                ?.substring(0, 2)
                                .toUpperCase() ||
                                user?.id?.substring(0, 2).toUpperCase() ||
                                "ME"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-700 p-4 bg-black flex items-center gap-2 mt-auto">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        handleSendMessage();
                      }
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  type="button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="music"
              className="flex-1 flex flex-col h-full overflow-hidden"
              forceMount={true}
              hidden={false}
            >
              <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
                <div className="space-y-4">
                  <div className="bg-secondary/30 p-4 rounded-lg backdrop-blur-sm border border-gray-800/50 shadow-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <PlayCircle className="h-4 w-4 mr-2 text-primary" />
                      Now Playing
                    </h3>
                    {currentSong ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                            {currentSong.cover ? (
                              <img
                                src={currentSong.cover}
                                alt={currentSong.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <PlayCircle className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium truncate text-lg">
                              {currentSong.title}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {currentSong.artist}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                                <Music className="h-3 w-3 mr-1" />
                                {currentSong.isLocal
                                  ? "Local File"
                                  : "Streaming"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{formatTime(Math.floor(currentTime))}</span>
                            <span>
                              {formatTime(
                                Math.floor(
                                  audioRef.current?.duration ||
                                    currentSong.duration
                                )
                              )}
                            </span>
                          </div>
                          <div
                            className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer hover:bg-gray-600 transition-colors"
                            onClick={handleProgressClick}
                          >
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/70"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center space-x-2 music-player-controls">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handlePrevSong}
                              className="h-10 w-10 p-0 rounded-full hover:bg-gray-800"
                              disabled={songs.length <= 1}
                            >
                              <SkipBack className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handlePlayPause}
                              className="h-12 w-12 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              {isPlaying ? (
                                <Pause className="h-6 w-6" />
                              ) : (
                                <Play className="h-6 w-6 ml-1" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleNextSong}
                              className="h-10 w-10 p-0 rounded-full hover:bg-gray-800"
                              disabled={songs.length <= 1}
                            >
                              <SkipForward className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4 text-gray-400" />
                            <Slider
                              value={[volume]}
                              max={100}
                              step={1}
                              className="w-24"
                              onValueChange={(value) => setVolume(value[0])}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-6 border border-dashed border-gray-700 rounded-lg">
                        <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-gray-400">No song playing</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Add songs to the playlist to start playing
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-lg backdrop-blur-sm border border-gray-800/50 shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold flex items-center">
                        <ListMusic className="h-4 w-4 mr-2 text-primary" />
                        Playlist
                      </h3>
                      <div className="flex space-x-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            multiple
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className={`border-gray-700 hover:border-gray-600 ${
                              isUploading ? "opacity-50" : ""
                            }`}
                            disabled={isUploading}
                            asChild
                          >
                            <span>
                              {isUploading ? (
                                <div className="h-4 w-4 border-2 border-t-transparent border-white animate-spin rounded-full mr-1" />
                              ) : (
                                <Upload className="h-4 w-4 mr-1" />
                              )}
                              Upload
                            </span>
                          </Button>
                        </label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-black border-primary overflow-hidden">
                            <DialogHeader>
                              <DialogTitle>Search Songs</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Search YouTube..."
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      searchYouTubeVideos(searchTerm);
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    searchYouTubeVideos(searchTerm)
                                  }
                                  disabled={isSearching || !searchTerm.trim()}
                                  className="bg-primary/80 hover:bg-primary text-black"
                                >
                                  {isSearching ? (
                                    <div className="h-4 w-4 border-2 border-t-transparent border-primary animate-spin rounded-full" />
                                  ) : (
                                    <Search className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border-t border-gray-800 pt-2">
                                {searchResults.length > 0 ? (
                                  searchResults.map((song) => (
                                    <div
                                      key={song.id}
                                      className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-md transition-colors"
                                    >
                                      <div className="flex items-center space-x-2 overflow-hidden">
                                        <div className="w-10 h-10 bg-gray-700 rounded-md flex-shrink-0 overflow-hidden">
                                          {song.cover ? (
                                            <img
                                              src={song.cover}
                                              alt={song.title}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <PlayCircle className="h-5 w-5 text-gray-400" />
                                          )}
                                        </div>
                                        <div className="overflow-hidden">
                                          <p className="font-medium text-sm truncate">
                                            {song.title}
                                          </p>
                                          <p className="text-xs text-gray-400 truncate">
                                            {song.artist}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 flex-shrink-0"
                                        onClick={() => {
                                          handleAddSong(song);
                                          toast({
                                            title: "Added to playlist",
                                            description: `"${song.title}" has been added`,
                                          });
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))
                                ) : isSearching ? (
                                  <div className="text-center py-8">
                                    <div className="inline-block h-6 w-6 border-2 border-t-transparent border-primary animate-spin rounded-full mb-2" />
                                    <p className="text-sm text-gray-400">
                                      Searching...
                                    </p>
                                  </div>
                                ) : searchTerm ? (
                                  <div className="text-center text-gray-500 py-8">
                                    <p>No results found</p>
                                    <p className="text-xs mt-1">
                                      Try a different search term
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-500 py-8">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Search for songs on YouTube</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {songs.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {songs.map((song) => (
                          <div
                            key={song.id}
                            className={`flex items-center justify-between p-2 rounded-md ${
                              currentSong?.id === song.id
                                ? "bg-primary/10 border border-primary/20 backdrop-blur-sm"
                                : "hover:bg-gray-800/50"
                            } transition-colors playlist-item`}
                          >
                            <div className="flex items-center space-x-2 overflow-hidden flex-1">
                              <div className="min-w-[32px] h-8 rounded overflow-hidden bg-gray-800 flex items-center justify-center">
                                {song.cover ? (
                                  <img
                                    src={song.cover}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Music className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className="overflow-hidden flex-1">
                                <p className="font-medium text-sm truncate">
                                  {song.title}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {song.artist}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 min-w-[76px] justify-end">
                                <span className="text-xs text-gray-400">
                                  {formatTime(Math.floor(song.duration))}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCurrentSongAndUpdate(song)}
                                  className="h-7 w-7 p-0 rounded-full hover:bg-gray-700"
                                >
                                  {currentSong?.id === song.id && isPlaying ? (
                                    <Pause className="h-3 w-3" />
                                  ) : (
                                    <Play className="h-3 w-3 ml-0.5" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"
                                  onClick={() => handleRemoveSong(song.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-6 border border-dashed border-gray-700 rounded-lg">
                        <p className="text-sm">Your playlist is empty</p>
                        <p className="text-xs mt-1">
                          Upload music or add from YouTube
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <style jsx global>{`
        .chat-messages-container {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
          padding-right: 4px;
        }

        .chat-messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .chat-messages-container::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }

        .chat-messages-container::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }

        .chat-messages-container::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Improved music player animations */
        .music-player-controls button {
          transition: all 0.2s ease;
        }

        .music-player-controls button:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .music-player-controls button:active {
          transform: scale(0.95);
        }

        .playlist-item {
          transition: all 0.2s ease;
        }

        .playlist-item:hover {
          transform: translateX(4px);
        }

        .playlist-item.active {
          border-left: 3px solid #10b981;
        }

        /* Add proper scrollbar styling for all overflow areas */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Fix tab content visibility and height issues */
        [data-state="inactive"] {
          display: none;
        }

        [data-orientation="horizontal"] {
          display: flex;
        }

        [role="tabpanel"] {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Ensure content is always visible within tabs */
        [data-radix-tabs-content] {
          display: flex !important;
          flex-direction: column;
          height: calc(100% - 40px);
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
