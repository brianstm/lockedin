"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Member {
  userId: string;
  score: number;
  displayName?: string;
}

interface GroupDetails {
  groupName: string;
  members: Member[];
  createdBy: string;
  createdAt: any;
}

export default function GroupDetailsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Member[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId || !user) return;

      setIsLoadingGroup(true);
      try {
        // Fetch all groups to find the one with matching ID
        const response = await api.get("/groups");
        const groups = response.data.groups || [];

        const groupData = groups.find((g: any) => g.groupCode === groupId);

        if (!groupData) {
          toast.error("Group not found");
          router.push("/groups");
          return;
        }

        setGroup(groupData);

        // Try to fetch leaderboard
        try {
          const leaderboardResponse = await api.get(`/leaderboard/${groupId}`);
          setLeaderboard(leaderboardResponse.data.leaderboard || []);
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
          // Use members as fallback for leaderboard
          setLeaderboard(groupData.members || []);
        }
      } catch (error) {
        console.error("Failed to fetch group details:", error);
        toast.error("Failed to load group details");
        router.push("/groups");
      } finally {
        setIsLoadingGroup(false);
        setIsLoadingLeaderboard(false);
      }
    };

    if (user) {
      fetchGroupDetails();
    }
  }, [groupId, user, router]);

  const startGroupSession = () => {
    // Store the group ID for the session creation page
    localStorage.setItem("selected_group_id", groupId);
    router.push("/session/new");
  };

  if (isLoading || !user || isLoadingGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => router.push("/groups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>

          <div className="py-12 text-center">
            <h2 className="text-xl font-medium">Group not found</h2>
            <p className="text-muted-foreground mt-2">
              The group you're looking for doesn't exist or you don't have
              access.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => router.push("/groups")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {group.groupName}
            </h1>
            <p className="text-muted-foreground">
              {group.members?.length || 0} members • Group Code: {groupId}
            </p>
          </div>
          <Button onClick={startGroupSession}>Start Group Session</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Members
              </CardTitle>
              <CardDescription>People in this study group</CardDescription>
            </CardHeader>
            <CardContent>
              {group.members && group.members.length > 0 ? (
                <div className="space-y-4">
                  {group.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="font-medium">
                        {member.displayName ||
                          `User ${member.userId.substring(0, 6)}`}
                        {member.userId === group.createdBy && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No members found
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Leaderboard
              </CardTitle>
              <CardDescription>Productivity rankings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="py-4 text-center text-muted-foreground">
                  Loading leaderboard...
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="font-medium">
                          {member.displayName ||
                            `User ${member.userId.substring(0, 6)}`}
                        </div>
                      </div>
                      <div className="font-bold">{member.score.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No productivity data available yet. Complete study sessions to
                  see rankings.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
