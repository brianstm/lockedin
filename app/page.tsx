import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Clock, Trophy, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mx-auto">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Brain className="h-6 w-6" />
          <span>LockedIn</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto rounded-lg">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Transform Studying into a Competitive Challenge
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LockedIn gamifies studying by monitoring engagement, assigning
                  productivity scores, and creating a competitive environment
                  that makes focus a challenge to conquer rather than a struggle
                  to endure.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex justify-center lg:justify-end">
                <div className="w-full max-w-[400px] aspect-video bg-muted rounded-xl overflow-hidden border shadow-lg">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="LockedIn Dashboard Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to boost productivity and make studying
                  more engaging
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Pomodoro Timer</h3>
                <p className="text-muted-foreground">
                  Structured study sessions with optimal focus and break
                  intervals
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI Quiz Generator</h3>
                <p className="text-muted-foreground">
                  Personalized quizzes based on your study material to reinforce
                  learning
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Competitive Leaderboards</h3>
                <p className="text-muted-foreground">
                  Compare productivity scores with peers to stay motivated
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/register">
                <Button size="lg">Start Your Journey</Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Join a Community
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Study with friends or join groups to boost accountability and
                  motivation
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">
                    Create or Join Study Groups
                  </h3>
                  <p className="text-muted-foreground">
                    Connect with others who share your academic goals and
                    compete together
                  </p>
                </div>
                <div className="flex justify-center">
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} LockedIn. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
