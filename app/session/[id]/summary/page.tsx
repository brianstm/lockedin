"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartTooltip } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";

interface SessionDetails {
  sessionId: string;
  userId: string;
  groupId: string | null;
  pomodoro: boolean;
  activities: string;
  date: string;
  duration: string;
  productivityScore: number;
  focusedTime: number;
  distractedTime: number;
  activeWindows: {
    name: string;
    duration: string;
    seconds: number;
    category?: string;
  }[];
}

interface ActivityData {
  name: string;
  seconds: number;
  formattedTime: string;
  category?: string;
}

interface ActivitySummary {
  totalTime: string;
  totalSeconds: number;
  productiveTime: string;
  productiveSeconds: number;
  distractingTime: string;
  distractingSeconds: number;
  productivityRatio: number;
}

export default function SessionSummaryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [quizTopic, setQuizTopic] = useState("");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null
  );
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activitySummary, setActivitySummary] =
    useState<ActivitySummary | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;

      setIsLoading(true);
      try {
        // Fetch session details
        const detailsResponse = await api.get(`/session/${sessionId}/details`);
        setSessionDetails(detailsResponse.data);

        // Fetch activity data
        const activityResponse = await api.get(
          `/session/${sessionId}/activity-data`
        );
        setActivityData(activityResponse.data.activityData);
        setActivitySummary(activityResponse.data.summary);

        // Create chart data from activity data
        const chartData = activityResponse.data.activityData
          .filter((item: ActivityData) => item.seconds > 0)
          .slice(0, 10)
          .map((item: ActivityData) => ({
            name:
              item.name.length > 15
                ? item.name.substring(0, 15) + "..."
                : item.name,
            minutes: Math.round(item.seconds / 60),
            category: item.category || "NEUTRAL",
          }));

        setChartData(chartData);
      } catch (error) {
        console.error("Failed to fetch session details:", error);
        toast.error("Failed to load session details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const generateQuiz = async () => {
    if (!quizTopic.trim()) {
      toast.error("Please enter a topic for your quiz");
      return;
    }

    setIsGeneratingQuiz(true);

    try {
      // Call the generate endpoint
      const response = await api.post("/generate", {
        prompt: `Create a quiz about ${quizTopic} with 5 multiple choice questions.`,
      });

      // Store the quiz in localStorage for the quiz page to use
      localStorage.setItem("current_quiz", response.data.response);

      toast.success("Your quiz is ready to take.");
      router.push("/quiz/current");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to generate quiz";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          Loading session data...
        </div>
      </DashboardLayout>
    );
  }

  if (!sessionDetails) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Session Not Found
            </h1>
            <p className="text-muted-foreground">
              The session you're looking for doesn't exist or you don't have
              access.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Summary</h1>
          <p className="text-muted-foreground">
            Review your study session from {sessionDetails.date}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Productivity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sessionDetails.productivityScore * 10}%
              </div>
              <Progress
                value={sessionDetails.productivityScore * 10}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Session Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sessionDetails.duration}
              </div>
              {activitySummary && (
                <div className="text-xs text-muted-foreground mt-1">
                  {activitySummary.productiveTime} productive,{" "}
                  {activitySummary.distractingTime} distracting
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Focus Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              {activitySummary ? (
                <>
                  <div className="text-3xl font-bold">
                    {activitySummary.productivityRatio}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Time spent on productive tasks
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">0%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    No activity data available
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="quiz">Generate Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Usage</CardTitle>
                <CardDescription>
                  Time spent on different applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {sessionDetails.activities
                      .split("\n")
                      .filter(Boolean)
                      .map((activity, index) => {
                        const match = activity.match(
                          /^(.*?):\s+(.*?):\s+(.*)$/
                        );
                        if (!match) return null;

                        const [_, app, title, duration] = match;

                        return (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{app}</h4>
                                <p className="text-sm text-muted-foreground truncate max-w-[400px]">
                                  {title}
                                </p>
                              </div>
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {duration}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Quiz</CardTitle>
                <CardDescription>
                  Create a quiz based on your study material to reinforce
                  learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Quiz Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Computer Science Fundamentals"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI will generate questions based on this topic to test
                  your knowledge.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={generateQuiz} disabled={isGeneratingQuiz}>
                  {isGeneratingQuiz ? "Generating..." : "Generate Quiz"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={() => router.push("/session/new")}>
            Start New Session
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
