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
import { api } from "@/lib/api";
import { toast } from "sonner";

interface DashboardData {
  userId: string;
  displayName: string;
  totalSessions: number;
  totalTime: string;
  totalTimeSeconds: number;
  productiveTime: string;
  productiveTimeSeconds: number;
  distractingTime: string;
  distractingTimeSeconds: number;
  averageProductivityScore: number;
  recentSessions: {
    sessionId: string;
    date: string;
    duration: string;
    productivityScore: number;
  }[];
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

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
        // Fetch dashboard data
        const dashboardResponse = await api.get(`/dashboard/${user.uid}`);
        setDashboardData(dashboardResponse.data);

        // Fetch all groups using the groups endpoint
        const groupsResponse = await api.get("/groups");
        const allGroups = groupsResponse.data.groups || [];

        // Filter groups where the user is a member
        const userGroups = allGroups
          .filter(
            (group: any) =>
              group.members &&
              group.members.some((member: any) => member.userId === user.uid)
          )
          .map((group: any) => ({
            id: group.groupCode,
            name: group.groupName,
            members: group.members ? group.members.length : 0,
          }));

        setGroups(userGroups);
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

  // Calculate study time in hours for the progress bar
  const studyTimeHours = dashboardData
    ? Math.round(dashboardData.totalTimeSeconds / 3600)
    : 0;
  const studyTimeProgress =
    studyTimeHours > 0 ? Math.min(100, (studyTimeHours / 20) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back,{" "}
              {dashboardData?.displayName || user.displayName || "User"}!
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
                {dashboardData?.averageProductivityScore || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average from sessions
              </p>
              <Progress
                value={dashboardData?.averageProductivityScore || 0}
                className="mt-3"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.totalTime || "0h"}
              </div>
              <p className="text-xs text-muted-foreground">Total study time</p>
              <Progress value={studyTimeProgress} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Ratio</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardData ? (
                <>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      (dashboardData.productiveTimeSeconds /
                        Math.max(1, dashboardData.totalTimeSeconds)) *
                        100
                    )}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Productive vs. total time
                  </p>
                  <Progress
                    value={
                      (dashboardData.productiveTimeSeconds /
                        Math.max(1, dashboardData.totalTimeSeconds)) *
                      100
                    }
                    className="mt-3"
                  />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">
                    Productive vs. total time
                  </p>
                  <Progress value={0} className="mt-3" />
                </>
              )}
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
                ) : dashboardData?.recentSessions &&
                  dashboardData.recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentSessions.map((session) => (
                      <div
                        key={session.sessionId}
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
                            <span className="font-bold">
                              {session.productivityScore}%
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/session/${session.sessionId}/summary`
                              )
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
