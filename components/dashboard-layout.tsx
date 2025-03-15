"use client";

import type React from "react";

import Link from "next/link";
import {
  Brain,
  LayoutDashboard,
  Clock,
  Users,
  Trophy,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 lg:px-6 h-16 flex items-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <Brain className="h-6 w-6" />
          <span>LockedIn</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden border-r bg-muted/40 lg:block lg:w-64">
          <nav className="grid gap-2 p-4">
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/session/new">
                <Clock className="h-5 w-5" />
                Study Sessions
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/groups">
                <Users className="h-5 w-5" />
                Groups
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/leaderboard">
                <Trophy className="h-5 w-5" />
                Leaderboard
              </Link>
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
