"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/app/contexts/AuthContext";
import { roomAPI } from "@/app/services/api";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function CreateRoomDialog() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    language: "javascript",
  });

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Separate handler for the dialog trigger click
  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default behavior (though not necessary for onClick as it is for onSubmit)
    e.preventDefault();

    // Clear previous debug info
    setDebugInfo(null);

    console.log("Create Room button clicked", { user, formData });

    // Form validation
    if (!formData.name.trim()) {
      console.error("Room name is empty");
      setDebugInfo("Validation error: Room name is required");
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      console.error("Room description is empty");
      setDebugInfo("Validation error: Room description is required");
      toast({
        title: "Error",
        description: "Room description is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDebugInfo("Creating room...");

    try {
      // Log the exact data being sent
      console.log(
        "Sending room creation data:",
        JSON.stringify(formData, null, 2)
      );

      // Create the room
      const room = await roomAPI.createRoom(formData);

      // Log successful creation with room details
      console.log("Room created successfully:", JSON.stringify(room, null, 2));

      // Update debug info
      setDebugInfo(`Room created! ID: ${room.id}`);

      toast({
        title: "Success",
        description: "Room created successfully",
      });

      // First close the dialog, then navigate
      setIsOpen(false);

      // Add a slight delay before navigation to ensure the dialog closes properly
      setTimeout(() => {
        console.log("Navigating to room:", room.id);
        router.push(`/room/${room.id}`);
      }, 300);
    } catch (error) {
      // Detailed error logging
      console.error("Failed to create room:", error);

      // Extract the most helpful error message
      let errorMessage = "Failed to create room. Please try again.";
      let isDbSetupError = false;

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error details:", error);

        // Check if this is a database setup error
        if (
          errorMessage.includes("table") &&
          (errorMessage.includes("doesn't exist") ||
            errorMessage.includes("not exist") ||
            errorMessage.includes("setup") ||
            errorMessage.includes("migrations"))
        ) {
          isDbSetupError = true;
        }

        // If it's a Supabase error, try to get more details
        if ("code" in error) {
          console.error("Supabase error code:", (error as any).code);
          console.error("Supabase error details:", (error as any).details);

          // Check for specific error codes related to missing tables
          if (
            (error as any).code === "404" ||
            (error as any).code === "42P01"
          ) {
            isDbSetupError = true;
          }
        }
      } else {
        console.error("Unknown error type:", typeof error);
      }

      // Set detailed debug info
      if (isDbSetupError) {
        setDebugInfo(`
Database Setup Required

The database tables needed for this application don't exist. 
To fix this issue:

1. Go to your Supabase dashboard (https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Run these SQL commands:

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'javascript',
  code TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS room_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  current_track_id TEXT,
  is_playing BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS room_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  UNIQUE(room_id, track_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

        `);
      } else {
        setDebugInfo(
          `Error: ${errorMessage}\nPlease check browser console for details.`
        );
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCreate = async () => {
    setDebugInfo(null);
    console.log("Quick Create button clicked", { user });

    setIsLoading(true);
    setDebugInfo("Creating quick room...");

    try {
      const quickRoomData = {
        name: `Quick Room ${Math.random().toString(36).substring(2, 8)}`,
        description: "A quick collaborative coding room",
        isPublic: true,
        language: "javascript",
      };

      // Log the exact data being sent
      console.log(
        "Sending quick room creation data:",
        JSON.stringify(quickRoomData, null, 2)
      );

      const room = await roomAPI.createRoom(quickRoomData);

      // Log successful creation with room details
      console.log(
        "Quick room created successfully:",
        JSON.stringify(room, null, 2)
      );

      // Update debug info
      setDebugInfo(`Room created! ID: ${room.id}`);

      toast({
        title: "Success",
        description: "Room created successfully",
      });

      // Add a slight delay before navigation to ensure any UI updates complete
      setTimeout(() => {
        console.log("Navigating to room:", room.id);
        router.push(`/room/${room.id}`);
      }, 300);
    } catch (error) {
      // Detailed error logging
      console.error("Failed to create quick room:", error);

      // Extract the most helpful error message
      let errorMessage = "Failed to create room. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error details:", error);

        // If it's a Supabase error, try to get more details
        if ("code" in error) {
          console.error("Supabase error code:", (error as any).code);
          console.error("Supabase error details:", (error as any).details);
        }
      } else {
        console.error("Unknown error type:", typeof error);
      }

      // Set detailed debug info
      setDebugInfo(
        `Error: ${errorMessage}\nPlease check browser console for details.`
      );

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="glow-button bg-primary hover:bg-primary/90 text-white"
          onClick={handleOpenDialog}
        >
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create a New Room
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Room Name
            </Label>
            <Input
              id="name"
              placeholder="Enter room name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter room description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Programming Language
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) =>
                setFormData({ ...formData, language: value })
              }
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic" className="text-sm font-medium">
              Public Room
            </Label>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublic: checked })
              }
            />
          </div>

          {debugInfo && (
            <div className="text-yellow-500 text-sm border border-yellow-500 p-2 rounded-md bg-yellow-500/10">
              {debugInfo}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
