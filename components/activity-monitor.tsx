import { Check, X } from "lucide-react";

interface ActivityMonitorProps {
  activeWindows: string[];
}

export function ActivityMonitor({ activeWindows }: ActivityMonitorProps) {
  // Define productive applications
  const productiveApps = [
    "Microsoft Word",
    "Google Chrome - Canvas LMS",
    "Visual Studio Code",
    "Notion",
    "Google Docs",
    "PDF Reader",
    "Slack",
  ];

  const isProductive = (window: string) => {
    return productiveApps.some((app) => window.includes(app));
  };

  return (
    <div className="space-y-3">
      {activeWindows.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No active windows detected
        </div>
      ) : (
        activeWindows.map((window, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-md border"
          >
            <span className="font-medium truncate max-w-[200px]">{window}</span>
            <span
              className={
                isProductive(window) ? "text-green-500" : "text-red-500"
              }
            >
              {isProductive(window) ? (
                <Check className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
