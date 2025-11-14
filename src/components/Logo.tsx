import { Shield, Zap } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <Shield className="w-12 h-12 text-primary energy-pulse" strokeWidth={2} />
      <Zap className="w-6 h-6 text-accent absolute" fill="currentColor" strokeWidth={0} />
    </div>
  );
};
