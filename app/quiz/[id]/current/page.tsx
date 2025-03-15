"use client";
import { api } from "@/lib/api";
import React, { useEffect, useState, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  AlertCircle,
  X,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface QuizQuestion {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const quizId = params.id;
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Record<number, string>>(
    {}
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<
    Record<number, { correct: boolean; message?: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Authentication check effect
  const authCheckEffect = useCallback(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    authCheckEffect();
  }, [authCheckEffect]);

  // Fetch quiz from backend
  const fetchQuizEffect = useCallback(async () => {
    if (!user) return;

    // If we have an ID parameter, fetch that specific quiz
    if (quizId !== "new") {
      setIsLoadingQuiz(true);
      setQuizError(null);
      try {
        const response = await api.get(`/quiz/${quizId}`);
        const data = response.data;

        // Transform API data to match your Quiz interface
        const formattedQuiz: Quiz = {
          id: data.quizId,
          title: `Quiz on ${data.topic}`,
          description: `Test your knowledge about ${data.topic}`,
          timeLimit: 600, // 10 minutes in seconds
          questions: data.questions.map((q: any, index: number) => ({
            id: index + 1,
            text: q.questionText.split("\n")[0], // Get first line as question text
            options: q.options.map((opt: any) => ({
              id: opt.letter.toLowerCase(),
              text: opt.text,
            })),
            correctAnswer: q.correctAnswer?.toLowerCase() || "a",
          })),
        };
        setQuiz(formattedQuiz);
        setTimeRemaining(formattedQuiz.timeLimit);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        setQuizError("Failed to load quiz");
        toast.error("Failed to load quiz");
      } finally {
        setIsLoadingQuiz(false);
      }
    } else {
      setIsLoadingQuiz(false);
    }
  }, [user, quizId]);

  useEffect(() => {
    fetchQuizEffect();
  }, [fetchQuizEffect]);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post("/quiz/generate", {
        userId: user?.uid,
        sessionId: sessionStorage.getItem("sessionId") || "default-session",
        topic: topic.trim(),
      });

      const quizData = response.data;

      // Transform the API response to match our Quiz interface
      const formattedQuiz: Quiz = {
        id: quizData.quizId,
        title: `Quiz on ${quizData.topic}`,
        description: `Test your knowledge about ${quizData.topic}`,
        timeLimit: 600, // 10 minutes in seconds
        questions: quizData.questions.map((q: any, index: number) => ({
          id: index + 1,
          text: q.questionText.split("\n")[0], // Get first line as question text
          options: q.options.map((opt: any) => ({
            id: opt.letter.toLowerCase(),
            text: opt.text,
          })),
          correctAnswer: q.correctAnswer?.toLowerCase() || "a",
        })),
      };

      setQuiz(formattedQuiz);
      setTimeRemaining(formattedQuiz.timeLimit);
      setIsLoadingQuiz(false);

      // Redirect to the generated quiz
      router.push(`/quiz/${formattedQuiz.id}/current`);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Submit to the API
      const response = await api.post("/quiz/submit", {
        quizId: quiz.id,
        userId: user?.uid,
        answers: Object.entries(answers).map(([index, option]) => ({
          questionIndex: parseInt(index),
          selectedOption: option.toUpperCase(),
        })),
      });

      const result = response.data;

      setQuizResult({
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.score,
      });
      setQuizCompleted(true);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, user, isSubmitting, answers]);

  // Timer effect
  const timerEffect = useCallback(() => {
    if (!quiz || quizCompleted) return undefined;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, quizCompleted, handleSubmitQuiz]);

  useEffect(() => {
    return timerEffect();
  }, [timerEffect]);

  const selectOption = (questionIndex: number, optionId: string) => {
    if (answers[questionIndex] !== undefined) return;

    setSelectedOption((prev) => ({
      ...prev,
      [questionIndex]: optionId,
    }));
  };

  const submitAnswer = () => {
    if (!quiz) return;
    const currentIndex = currentQuestionIndex;
    const selectedAnswerId = selectedOption[currentIndex];

    if (!selectedAnswerId) {
      toast.error("Please select an option first");
      return;
    }

    const question = quiz.questions[currentIndex];
    const isCorrect = selectedAnswerId === question.correctAnswer;

    // Set answer and feedback
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: selectedAnswerId,
    }));

    setFeedback((prev) => ({
      ...prev,
      [currentIndex]: {
        correct: isCorrect,
        message: question.explanation,
      },
    }));

    // Show toast notification
    if (isCorrect) {
      toast.success("Correct answer!");
    } else {
      toast.error("Incorrect answer!");
    }

    // Automatically move to next question after a short delay
    if (currentIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentIndex + 1);
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Show quiz generator if this is a new quiz
  if (quizId === "new" && !quiz) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Generate a Quiz
              </h1>
              <p className="text-muted-foreground">
                Enter a topic to create a custom quiz
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quiz Topic</CardTitle>
              <CardDescription>
                Enter a topic and we&apos;ll generate quiz questions for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., JavaScript Promises, World History, Climate Science"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <Button
                  onClick={generateQuiz}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>Generating Quiz...</>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingQuiz) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          Loading quiz...
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">404 Quiz Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The quiz you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (quizCompleted && quizResult) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quiz Results
              </h1>
              <p className="text-muted-foreground">{quiz.title}</p>
            </div>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
              <CardDescription>
                You&apos;ve completed the quiz. Here&apos;s how you did.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="text-5xl font-bold">{quizResult.score}%</div>
                <Progress
                  value={quizResult.score}
                  className="w-full max-w-md"
                />
                <p className="text-muted-foreground">
                  You got {quizResult.correctAnswers} out of{" "}
                  {quizResult.totalQuestions} questions right
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-xl font-bold">
                    {quizResult.correctAnswers}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-xl font-bold">
                    {quizResult.totalQuestions - quizResult.correctAnswers}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-xl font-bold">
                    {quizResult.totalQuestions}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Questions
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => router.push("/dashboard")}>Close</Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const hasAnsweredCurrent = answers[currentQuestionIndex] !== undefined;
  const hasSelectedCurrent = selectedOption[currentQuestionIndex] !== undefined;
  const hasAnsweredAll = Object.keys(answers).length === quiz.questions.length;
  const currentFeedback = feedback[currentQuestionIndex];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span
              className={`font-mono ${
                timeRemaining < 60 ? "text-red-500" : ""
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestionIndex + 1}. {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  selectedOption[currentQuestionIndex] === option.id;
                const isAnswered = answers[currentQuestionIndex] === option.id;
                const isCorrect = currentFeedback?.correct && isAnswered;
                const isIncorrect = !currentFeedback?.correct && isAnswered;

                let optionClass =
                  "flex items-center space-x-2 border p-4 rounded-lg";

                if (!hasAnsweredCurrent) {
                  optionClass += isSelected
                    ? " bg-primary/10 border-primary"
                    : " hover:bg-muted cursor-pointer";
                } else if (isCorrect) {
                  optionClass += " bg-green-50 border-green-500";
                } else if (isIncorrect) {
                  optionClass += " bg-red-50 border-red-500";
                } else if (
                  currentQuestion.correctAnswer === option.id &&
                  hasAnsweredCurrent
                ) {
                  optionClass += " bg-green-50 border-green-500";
                }

                return (
                  <div
                    key={option.id}
                    className={optionClass}
                    onClick={() => {
                      if (!hasAnsweredCurrent) {
                        selectOption(currentQuestionIndex, option.id);
                      }
                    }}
                  >
                    {isCorrect && (
                      <Check className="h-5 w-5 text-green-600 mr-2" />
                    )}
                    {isIncorrect && <X className="h-5 w-5 text-red-600 mr-2" />}
                    <div
                      className={`h-4 w-4 rounded-full border ${
                        isSelected || isAnswered
                          ? "bg-primary border-primary"
                          : "border-gray-300"
                      }`}
                    />
                    <Label className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                );
              })}
            </div>

            {!hasAnsweredCurrent && hasSelectedCurrent && (
              <div className="mt-4 flex justify-center">
                <Button onClick={submitAnswer} className="mt-2">
                  <Check className="mr-2 h-4 w-4" />
                  Submit Answer
                </Button>
              </div>
            )}

            {currentFeedback && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  currentFeedback.correct ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p
                  className={`font-medium ${
                    currentFeedback.correct ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {currentFeedback.correct ? "Correct!" : "Incorrect!"}
                </p>
                {currentFeedback.message && (
                  <p className="mt-1 text-sm text-gray-600">
                    {currentFeedback.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={!hasAnsweredAll || isSubmitting}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!hasAnsweredCurrent}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              variant={
                index === currentQuestionIndex
                  ? "default"
                  : feedback[index]?.correct
                  ? "outline"
                  : feedback[index]
                  ? "destructive"
                  : "outline"
              }
              className={`w-10 h-10 p-0 ${
                feedback[index]?.correct
                  ? "bg-green-500 hover:bg-green-600"
                  : feedback[index]
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {currentQuestionIndex === quiz.questions.length - 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <p className="text-sm text-muted-foreground">
                  {hasAnsweredAll
                    ? "You've answered all questions. Ready to submit?"
                    : `You still have ${
                        quiz.questions.length - Object.keys(answers).length
                      } unanswered questions.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
