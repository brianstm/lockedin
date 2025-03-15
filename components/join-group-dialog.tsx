"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinGroupDialog({ open, onOpenChange }: JoinGroupDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [groupCode, setGroupCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Check if there's a stored group code to join
  useEffect(() => {
    if (open) {
      const storedCode = localStorage.getItem("join_group_code");
      if (storedCode) {
        setGroupCode(storedCode);
        localStorage.removeItem("join_group_code");
      }
    }
  }, [open]);

  const joinGroup = async () => {
    if (!groupCode.trim()) {
      toast.error("Please enter a group code");
      return;
    }

    setIsJoining(true);

    try {
      const response = await api.post("/groups/join", {
        groupCode,
        userId: user?.uid,
      });

      toast.success("You've successfully joined the study group.");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to join group";
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Study Group</DialogTitle>
          <DialogDescription>
            Enter the group code to join an existing study group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-code">Group Code</Label>
            <Input
              id="group-code"
              placeholder="Enter group code"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={joinGroup} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
