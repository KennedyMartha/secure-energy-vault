import { Hero } from "@/components/Hero";
import { EnergyDashboard } from "@/components/EnergyDashboard";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <EnergyDashboard />
      <Footer />
    </div>
  );
};

export default Index;
