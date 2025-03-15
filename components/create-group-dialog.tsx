"use client";

import { useState } from "react";
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
import api from "@/lib/axios-config";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a name for your group");
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.post("/groups/create", {
        groupName,
        userId: user?.uid,
      });

      toast.success("Your study group has been created successfully.");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to create group";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Study Group</DialogTitle>
          <DialogDescription>
            Create a new group to study with others
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., CS1010E Study Group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={createGroup} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
