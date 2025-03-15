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
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function SessionSummaryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [quizTopic, setQuizTopic] = useState("");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [sessionData, setSessionData] = useState({
    date: new Date().toLocaleDateString(),
    duration: "0 minutes",
    productivityScore: 0,
    focusedTime: 0,
    distractedTime: 0,
    activeWindows: [] as { name: string; time: number; productive: boolean }[],
  });

  const [activityData, setActivityData] = useState<
    { time: string; productivity: number }[]
  >([]);

  // In a real implementation, you would fetch the session data from your API
  useEffect(() => {
    // In a real implementation, you would fetch the session data from your API
    // Since the API doesn't have a specific endpoint for this, we'll use placeholder data
    setSessionData({
      date: new Date().toLocaleDateString(),
      duration: "0 minutes",
      productivityScore: 0,
      focusedTime: 0,
      distractedTime: 0,
      activeWindows: [],
    });

    setActivityData([]);
  }, []);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Summary</h1>
          <p className="text-muted-foreground">
            Review your study session from {sessionData.date}
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
                {sessionData.productivityScore}%
              </div>
              <Progress
                value={sessionData.productivityScore}
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
              <div className="text-3xl font-bold">{sessionData.duration}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {sessionData.focusedTime} min focused,{" "}
                {sessionData.distractedTime} min distracted
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Focus Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(
                  (sessionData.focusedTime /
                    (sessionData.focusedTime + sessionData.distractedTime)) *
                    100
                )}
                %
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Time spent on productive tasks
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="quiz">Generate Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Over Time</CardTitle>
                <CardDescription>
                  Your focus levels throughout the session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      productivity: {
                        label: "Productivity",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <BarChart
                      data={activityData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="productivity"
                        fill="var(--color-productivity)"
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Usage</CardTitle>
                <CardDescription>
                  Time spent on different applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionData.activeWindows.map((window, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{window.name}</span>
                        <span
                          className={
                            window.productive
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {window.productive ? "Productive" : "Distracting"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (window.time /
                              Number.parseInt(sessionData.duration)) *
                            100
                          }
                          className="flex-1"
                        />
                        <span className="text-sm w-16 text-right">
                          {window.time} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
