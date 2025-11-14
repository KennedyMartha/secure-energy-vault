import { Activity } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated meter */}
          <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden relative">
            <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent meter-animation" />
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4 energy-pulse" />
            <span className="text-sm">Real-time Energy Monitoring</span>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            © 2024 Encrypted Power Metrics. All data secured with blockchain technology.
          </div>
        </div>
      </div>
    </footer>
  );
};
