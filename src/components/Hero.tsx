import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-energy opacity-30" />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <Logo className="animate-fade-in" />
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
            Encrypted Power Metrics
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl animate-fade-in font-light">
            Measure Clearly, Share Securely.
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl animate-fade-in">
            Record encrypted energy output and consumption data for cross-department settlement.
            Connect your wallet to unlock detailed metrics.
          </p>
          
          <div className="animate-fade-in">
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
  );
};
