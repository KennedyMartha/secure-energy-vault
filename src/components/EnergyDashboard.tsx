import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const generateMockData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    consumption: Math.floor(Math.random() * 500) + 300,
    output: Math.floor(Math.random() * 400) + 200,
  }));
};

const LockedCard = () => (
  <Card className="border-muted bg-gradient-locked">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-muted-foreground">Data Encrypted</CardTitle>
        <Lock className="w-5 h-5 text-muted-foreground lock-bounce" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground lock-bounce" />
          <p className="text-muted-foreground">Connect wallet to unlock metrics</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  unit: string; 
  trend: number;
  icon: any;
}) => (
  <Card className="border-primary/20 bg-card hover:shadow-glow transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">
        {value.toLocaleString()} {unit}
      </div>
      <div className="flex items-center text-xs mt-2">
        {trend > 0 ? (
          <TrendingUp className="w-4 h-4 text-secondary mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-accent mr-1" />
        )}
        <span className={trend > 0 ? "text-secondary" : "text-accent"}>
          {Math.abs(trend)}% from last period
        </span>
      </div>
    </CardContent>
  </Card>
);

export const EnergyDashboard = () => {
  const { isConnected } = useAccount();
  const data = generateMockData();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LockedCard />
          <LockedCard />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      {/* Unlock indicator */}
      <div className="flex items-center gap-2 text-secondary animate-fade-in">
        <Unlock className="w-5 h-5" />
        <span className="font-medium">Metrics Unlocked</span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <MetricCard
          title="Total Output"
          value={8547}
          unit="kWh"
          trend={12.5}
          icon={Zap}
        />
        <MetricCard
          title="Total Consumption"
          value={7832}
          unit="kWh"
          trend={-3.2}
          icon={TrendingDown}
        />
        <MetricCard
          title="Net Energy"
          value={715}
          unit="kWh"
          trend={18.7}
          icon={TrendingUp}
        />
      </div>

      {/* Energy consumption chart */}
      <Card className="border-primary/20 bg-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Energy Consumption (24h)
          </CardTitle>
          <CardDescription>Real-time encrypted data tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stroke="hsl(var(--primary))"
                fill="url(#colorConsumption)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy output chart */}
      <Card className="border-secondary/20 bg-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Energy Output vs Consumption
          </CardTitle>
          <CardDescription>Cross-department settlement data</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="output"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
