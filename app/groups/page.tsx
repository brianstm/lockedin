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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { JoinGroupDialog } from "@/components/join-group-dialog";
import { api } from "@/lib/api";

interface Group {
  groupCode: string;
  groupName: string;
  members: any[];
  createdBy: string;
  createdAt: any;
}

export default function GroupsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      setIsLoadingGroups(true);
      try {
        const response = await api.get("/groups");
        const groups = response.data.groups || [];

        setAllGroups(groups);

        // Filter groups where the user is a member
        const userGroupsData = groups.filter(
          (group: { members: any[] }) =>
            group.members &&
            group.members.some((member: any) => member.userId === user.uid)
        );

        setUserGroups(userGroupsData);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        toast.error("Failed to load groups");
      } finally {
        setIsLoadingGroups(false);
      }
    };

    if (user) {
      fetchGroups();
    }
  }, [user, showCreateGroup, showJoinGroup]);

  const viewGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
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
            <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground">Manage your study groups</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateGroup(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
            <Button variant="outline" onClick={() => setShowJoinGroup(true)}>
              Join Group
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
            <CardDescription>Groups you've created or joined</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGroups ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading groups...
              </div>
            ) : userGroups.length > 0 ? (
              <div className="space-y-4">
                {userGroups.map((group) => (
                  <div
                    key={group.groupCode}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{group.groupName}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.members?.length || 0} members • Group Code:{" "}
                        {group.groupCode}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewGroup(group.groupCode)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                You haven't joined any groups yet. Create or join a group to get
                started.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Available Groups</CardTitle>
            <CardDescription>Browse all study groups</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGroups ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading groups...
              </div>
            ) : allGroups.length > 0 ? (
              <div className="space-y-4">
                {allGroups.map((group) => {
                  const isUserMember =
                    group.members &&
                    group.members.some(
                      (member: any) => member.userId === user.uid
                    );

                  return (
                    <div
                      key={group.groupCode}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{group.groupName}</div>
                        <div className="text-sm text-muted-foreground">
                          {group.members?.length || 0} members • Group Code:{" "}
                          {group.groupCode}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUserMember ? (
                          <div className="text-xs text-green-500 font-medium">
                            Member
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Set the group code and open the join dialog
                              localStorage.setItem(
                                "join_group_code",
                                group.groupCode
                              );
                              setShowJoinGroup(true);
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No groups available. Be the first to create a study group!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />
      <JoinGroupDialog open={showJoinGroup} onOpenChange={setShowJoinGroup} />
    </DashboardLayout>
  );
}
