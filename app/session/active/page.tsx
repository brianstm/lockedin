"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle } from "lucide-react";
import { ActivityMonitor } from "@/components/activity-monitor";
import { api } from "@/lib/api";

export default function ActiveSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [productivityScore, setProductivityScore] = useState(0);
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current session ID from localStorage
    const currentSessionId = localStorage.getItem("current_session_id");
    if (!currentSessionId) {
      toast.error("No active session found");
      router.push("/session/new");
      return;
    }

    setSessionId(currentSessionId);
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up
            if (isBreak) {
              // Break is over, start work session
              setIsBreak(false);
              return 25 * 60; // 25 minute work session
            } else {
              // Work session is over, start break
              setIsBreak(true);
              return 5 * 60; // 5 minute break
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, isBreak]);

  // Fetch activity data periodically
  useEffect(() => {
    if (!sessionId || isPaused || isBreak) return;

    const fetchActivity = async () => {
      try {
        // Call the activity update endpoint
        await api.post("/activity/update", {
          sessionId,
        });

        // Get the current activity
        const response = await api.get(`/activity/${sessionId}`);

        // Parse the activities string into an array
        const activitiesString = response.data.userActivities || "";
        const activities = activitiesString
          .split("\n")
          .filter(Boolean)
          .map((line: string) => line.split(":")[0].trim());

        setActiveWindows(activities.length > 0 ? activities : []);

        // TEST
        const productiveApps = [
          "Microsoft Word",
          "Google Chrome",
          "Visual Studio Code",
          "Notion",
        ];
        const productiveCount = activities.filter((app: string) =>
          productiveApps.some((prodApp) => app.includes(prodApp))
        ).length;

        if (activities.length > 0) {
          const newScore = Math.round(
            (productiveCount / activities.length) * 100
          );
          setProductivityScore((prev) => {
            return prev === 0
              ? newScore
              : Math.round(prev * 0.7 + newScore * 0.3);
          });
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      }
    };

    const activityInterval = setInterval(fetchActivity, 10000); // Every 10 seconds

    // Initial fetch
    fetchActivity();

    return () => clearInterval(activityInterval);
  }, [sessionId, isPaused, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const endSession = async () => {
    if (!sessionId) {
      toast.error("No active session found");
      return;
    }

    try {
      const response = await api.post("/session/end", {
        sessionId,
      });

      const productivityScore = response.data.productivityScore;

      toast.success(
        `Session completed! Your productivity score: ${productivityScore}`
      );

      // Clear the current session
      localStorage.removeItem("current_session_id");

      router.push("/session/summary");
    } catch (error: any) {
      console.error("Error ending session:", error);
      const errorMessage =
        error.response?.data?.error || "Error ending session";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Clock className="h-6 w-6" />
          <span>LockedIn</span>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">
                {isBreak ? "Break Time" : "Study Session"}
              </CardTitle>
              <CardDescription>
                {isBreak
                  ? "Take a short break to recharge"
                  : "Stay focused on your work"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="text-6xl font-bold mb-4">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-muted-foreground">
                  {isBreak ? "Break ends in" : "Time remaining"}
                </div>
                <Progress
                  value={
                    isBreak
                      ? (timeRemaining / (5 * 60)) * 100
                      : (timeRemaining / (25 * 60)) * 100
                  }
                  className="w-full max-w-md mt-4"
                />
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={togglePause} variant="outline" size="lg">
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={() => setShowEndConfirm(true)}
                  variant="destructive"
                  size="lg"
                >
                  End Session
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productivity Score</CardTitle>
              <CardDescription>
                Based on your active applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold mb-4">
                  {productivityScore}%
                </div>
                <Progress value={productivityScore} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Monitor</CardTitle>
              <CardDescription>Currently active windows</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityMonitor activeWindows={activeWindows} />
            </CardContent>
          </Card>
        </div>

        {showEndConfirm && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                End Session Early?
              </CardTitle>
              <CardDescription>
                Ending your session early may affect your productivity score
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowEndConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={endSession}>
                End Session
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
