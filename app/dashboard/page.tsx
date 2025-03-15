"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Brain, Clock, Plus, Trophy, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { JoinGroupDialog } from "@/components/join-group-dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [stats, setStats] = useState({
    productivityScore: 0,
    studyTime: 0,
    quizScore: 0,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setIsLoadingData(true);
      try {
        // For now, we'll fetch groups by name since the API doesn't have a user/groups endpoint
        // In a real implementation, you'd want to store the user's groups and fetch them
        const groupsData = [];

        // Fetch groups the user is part of - this is a simplified approach
        // In a real app, you'd have an endpoint to get all user's groups
        try {
          const csGroupResponse = await api.get(
            "/groups/CS 101 Study Group/members"
          );
          if (csGroupResponse.data) {
            groupsData.push({
              id: "cs101", // Using a placeholder ID
              name: "CS 101 Study Group",
              members: csGroupResponse.data.members?.length || 0,
            });
          }
        } catch (error) {
          console.log("CS group not found or user not a member");
        }

        try {
          const mathGroupResponse = await api.get(
            "/groups/Math Finals Prep/members"
          );
          if (mathGroupResponse.data) {
            groupsData.push({
              id: "math", // Using a placeholder ID
              name: "Math Finals Prep",
              members: mathGroupResponse.data.members?.length || 0,
            });
          }
        } catch (error) {
          console.log("Math group not found or user not a member");
        }

        setGroups(groupsData);

        // Note: The API doesn't have an endpoint to fetch recent sessions
        // We'll leave this empty for now
        setRecentSessions([]);

        // Note: The API doesn't have endpoints for these stats
        // We'll use zeros for now
        setStats({
          productivityScore: 0,
          studyTime: 0,
          quizScore: 0,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load your data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const startSession = () => {
    router.push("/session/new");
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.displayName || "User"}!
            </p>
          </div>
          <Button onClick={startSession} className="w-full md:w-auto">
            Start Study Session
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productivity Score
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.productivityScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average from sessions
              </p>
              <Progress value={stats.productivityScore} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studyTime}h</div>
              <p className="text-xs text-muted-foreground">Total study time</p>
              <Progress
                value={stats.studyTime > 0 ? (stats.studyTime / 20) * 100 : 0}
                className="mt-3"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quizScore}%</div>
              <p className="text-xs text-muted-foreground">Last quiz</p>
              <Progress value={stats.quizScore} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
              <p className="text-xs text-muted-foreground">
                Active study groups
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateGroup(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowJoinGroup(true)}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
            <TabsTrigger value="groups">My Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
                <CardDescription>
                  Your study activity over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading sessions...
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="font-medium">{session.date}</div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {session.duration}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            Score:{" "}
                            <span className="font-bold">{session.score}%</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/session/${session.id}`)
                            }
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No recent sessions found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Study Groups</CardTitle>
                <CardDescription>
                  Groups you've created or joined
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading groups...
                  </div>
                ) : groups.length > 0 ? (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.members} members
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/groups/${group.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No groups found. Create or join a group to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />
      <JoinGroupDialog open={showJoinGroup} onOpenChange={setShowJoinGroup} />
    </DashboardLayout>
  );
}
