"use client";

import { Check, X, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ActivityMonitorProps {
  activeWindows: string[];
}

interface AppClassification {
  app: string;
  category: "PRODUCTIVE" | "DISTRACTING" | "NEUTRAL";
}

export function ActivityMonitor({ activeWindows }: ActivityMonitorProps) {
  const [classifications, setClassifications] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch classifications if there are active windows
    if (activeWindows.length === 0) return;

    const fetchClassifications = async () => {
      setIsLoading(true);
      try {
        // Use the cached classification endpoint for better performance
        const response = await api.post("/classify-apps/cached", {
          appNames: activeWindows,
        });

        const appClassifications = response.data
          .classifications as AppClassification[];

        // Convert array to record for easier lookup
        const classificationMap: Record<string, string> = {};
        appClassifications.forEach((item) => {
          classificationMap[item.app] = item.category;
        });

        setClassifications(classificationMap);
      } catch (error) {
        console.error("Failed to classify applications:", error);
        // Fallback to empty classifications
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassifications();
  }, [activeWindows]);

  const getIcon = (window: string) => {
    const category = classifications[window];

    if (category === "PRODUCTIVE") {
      return <Check className="h-5 w-5 text-green-500" />;
    } else if (category === "DISTRACTING") {
      return <X className="h-5 w-5 text-red-500" />;
    } else {
      return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTextColor = (window: string) => {
    const category = classifications[window];

    if (category === "PRODUCTIVE") {
      return "text-green-500";
    } else if (category === "DISTRACTING") {
      return "text-red-500";
    } else {
      return "text-gray-400";
    }
  };

  return (
    <div className="space-y-3">
      {activeWindows.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No active windows detected
        </div>
      ) : isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          Analyzing applications...
        </div>
      ) : (
        activeWindows.map((window, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-md border"
          >
            <span className="font-medium truncate max-w-[200px]">{window}</span>
            <span className={getTextColor(window)}>{getIcon(window)}</span>
          </div>
        ))
      )}
    </div>
  );
}
