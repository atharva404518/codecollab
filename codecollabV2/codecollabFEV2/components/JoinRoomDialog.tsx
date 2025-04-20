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
import { useAuth } from "@/app/contexts/AuthContext";
import { roomAPI } from "@/app/services/api";
import { toast } from "@/hooks/use-toast";

export default function JoinRoomDialog() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Clear previous debug info
    setDebugInfo(null);

    console.log("Join Room button clicked", { user, roomId });

    // Validate the room ID
    if (!roomId.trim()) {
      console.error("Room ID is empty");
      setDebugInfo("Validation error: Room ID is required");
      toast({
        title: "Error",
        description: "Room ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDebugInfo("Joining room...");

    try {
      // Log the exact data being sent
      console.log("Attempting to join room with ID:", roomId);

      // Join the room
      const room = await roomAPI.joinRoomByCode(roomId);

      // Log successful join with room details
      console.log("Joined room successfully:", JSON.stringify(room, null, 2));

      // Update debug info
      setDebugInfo(`Room joined! Room name: ${room.name}`);

      toast({
        title: "Success",
        description: "Joined room successfully",
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
      console.error("Failed to join room:", error);

      // Extract the most helpful error message
      let errorMessage =
        "Failed to join room. Please check the room ID and try again.";

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
          variant="outline"
          size="lg"
          className="bg-transparent hover:bg-primary/10"
          onClick={handleOpenDialog}
        >
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Join a Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomId" className="text-sm font-medium">
              Room ID
            </Label>
            <Input
              id="roomId"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full"
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
            {isLoading ? "Joining..." : "Join Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
