"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/axios-config";

export default function NewSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [duration, setDuration] = useState("60");
  const [usePomodoro, setUsePomodoro] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      try {
        // Add individual session option
        const groupsData = [{ id: "individual", name: "Individual Session" }];

        // Try to fetch CS group
        try {
          const csGroupResponse = await api.get(
            "/groups/CS 101 Study Group/members"
          );
          if (csGroupResponse.data) {
            groupsData.push({
              id: "cs101", // Using a placeholder ID
              name: "CS 101 Study Group",
            });
          }
        } catch (error) {
          console.log("CS group not found or user not a member");
        }

        // Try to fetch Math group
        try {
          const mathGroupResponse = await api.get(
            "/groups/Math Finals Prep/members"
          );
          if (mathGroupResponse.data) {
            groupsData.push({
              id: "math", // Using a placeholder ID
              name: "Math Finals Prep",
            });
          }
        } catch (error) {
          console.log("Math group not found or user not a member");
        }

        setGroups(groupsData);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        toast.error("Failed to load your groups");
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [user]);

  const startSession = async () => {
    setIsLoading(true);

    try {
      const response = await api.post("/session/start", {
        groupId: selectedGroup === "individual" ? null : selectedGroup,
        userId: user?.uid,
        pomodoro: usePomodoro,
        duration: Number.parseInt(duration),
      });

      const sessionId = response.data.sessionId;

      // Store session ID for later use
      localStorage.setItem("current_session_id", sessionId);

      toast.success("Your study session has begun.");
      router.push("/session/active");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to start session";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            New Study Session
          </h1>
          <p className="text-muted-foreground">
            Configure your study session settings
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Session Settings</CardTitle>
            <CardDescription>Customize how you want to study</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="group">Study Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingGroups ? (
                    <SelectItem value="loading" disabled>
                      Loading groups...
                    </SelectItem>
                  ) : (
                    groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="240"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pomodoro">Pomodoro Timer</Label>
                <p className="text-sm text-muted-foreground">
                  Use 25/5 minute work/break intervals
                </p>
              </div>
              <Switch
                id="pomodoro"
                checked={usePomodoro}
                onCheckedChange={setUsePomodoro}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={startSession}
              disabled={isLoading || !selectedGroup}
            >
              {isLoading ? "Starting..." : "Start Session"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
