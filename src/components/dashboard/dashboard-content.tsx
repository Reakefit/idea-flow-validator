
import { GlassCard } from "../ui/glass-card";
import { GradientButton } from "../ui/gradient-button";
import { Link } from "react-router-dom";

const DashboardContent = () => {
  return (
    <div className="p-8 h-full bg-insight-dark overflow-y-auto">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-insight-blue opacity-10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-insight-purple opacity-10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Your idea validation journey at a glance
          </p>
        </header>

        {/* Problem Statement Card */}
        <GlassCard className="mb-8 p-6 border border-insight-purple/30 glow">
          <h2 className="text-xl font-bold mb-4">Problem Statement</h2>
          <p className="text-lg mb-4">
            Small business owners struggle to maintain consistent cash flow due to delays in client payments, leading to operational challenges and growth limitations.
          </p>
          <div className="flex justify-end">
            <Link to="/chat">
              <GradientButton size="sm">Refine Problem</GradientButton>
            </Link>
          </div>
        </GlassCard>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Market Size Card */}
          <GlassCard>
            <h3 className="text-lg font-bold mb-3">Market Size</h3>
            <div className="flex items-end justify-between mb-4">
              <span className="text-3xl font-bold">$4.2B</span>
              <span className="text-sm text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Growing 14% YoY
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The cash flow management market for small businesses is substantial and growing.
            </p>
          </GlassCard>

          {/* Customer Segments Card */}
          <GlassCard>
            <h3 className="text-lg font-bold mb-3">Customer Segments</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span>Small Service Businesses</span>
                <span className="text-insight-blue font-bold">42%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-insight-blue h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>E-commerce</span>
                <span className="text-insight-purple font-bold">28%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-insight-purple h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Freelancers</span>
                <span className="text-insight-indigo font-bold">18%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-insight-indigo h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            <Link to="/segments" className="text-sm text-insight-blue hover:underline">
              View detailed segments
            </Link>
          </GlassCard>

          {/* Pain Points Card */}
          <GlassCard>
            <h3 className="text-lg font-bold mb-3">Key Pain Points</h3>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start">
                <span className="bg-insight-blue/20 text-insight-blue rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>Late client payments (62% of businesses)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-insight-blue/20 text-insight-blue rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>Time spent on invoice follow-ups</span>
              </li>
              <li className="flex items-start">
                <span className="bg-insight-blue/20 text-insight-blue rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>Unpredictable monthly revenue</span>
              </li>
            </ul>
            <Link to="/pain-points" className="text-sm text-insight-blue hover:underline">
              View all pain points
            </Link>
          </GlassCard>

          {/* Competitors Card */}
          <GlassCard>
            <h3 className="text-lg font-bold mb-3">Competitor Analysis</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span>InvoiceFast</span>
                <div className="flex space-x-1">
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-white/10 rounded-full"></span>
                  <span className="h-4 w-4 bg-white/10 rounded-full"></span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>CashFlow+</span>
                <div className="flex space-x-1">
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-white/10 rounded-full"></span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>PayTrack</span>
                <div className="flex space-x-1">
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-green-500/20 rounded-full"></span>
                  <span className="h-4 w-4 bg-white/10 rounded-full"></span>
                  <span className="h-4 w-4 bg-white/10 rounded-full"></span>
                  <span className="h-4 w-4 bg-white/10 rounded-full"></span>
                </div>
              </div>
            </div>
            <Link to="/competitors" className="text-sm text-insight-blue hover:underline">
              View detailed comparison
            </Link>
          </GlassCard>

          {/* Opportunity Card */}
          <GlassCard>
            <h3 className="text-lg font-bold mb-3">Opportunity Score</h3>
            <div className="relative h-36 flex items-center justify-center mb-4">
              <svg viewBox="0 0 36 36" className="h-36 w-36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray="85, 100"
                  className="animate-pulse-slow"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">85%</span>
                <span className="text-sm text-muted-foreground">Strong Fit</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on market size, pain point severity, and competition analysis
            </p>
          </GlassCard>

          {/* Interviews Card */}
          <GlassCard>
            <h3 className="text-lg font-bold mb-3">Interview Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span>Completed</span>
                <span className="font-bold">3 / 10</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Sarah J. - Marketing Agency
                  </span>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Michael T. - Freelancer
                  </span>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Link to="/interviews" className="text-sm text-insight-blue hover:underline">
                View all interviews
              </Link>
              <Link to="/schedule">
                <GradientButton size="sm">Schedule</GradientButton>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Feature Opportunity Grid */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-4">Feature Opportunity Map</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="glass p-4 rounded-lg border-2 border-green-500/30">
              <h4 className="font-bold mb-2 flex items-center">
                <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                Automated Invoice Reminders
              </h4>
              <p className="text-sm text-muted-foreground">
                High impact, low competition feature
              </p>
            </div>
            <div className="glass p-4 rounded-lg border border-yellow-500/30">
              <h4 className="font-bold mb-2 flex items-center">
                <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></span>
                Early Payment Incentives
              </h4>
              <p className="text-sm text-muted-foreground">
                Medium impact, medium competition
              </p>
            </div>
            <div className="glass p-4 rounded-lg border border-blue-500/30">
              <h4 className="font-bold mb-2 flex items-center">
                <span className="h-3 w-3 bg-blue-500 rounded-full mr-2"></span>
                Cash Flow Forecasting
              </h4>
              <p className="text-sm text-muted-foreground">
                High impact, high competition feature
              </p>
            </div>
          </div>
          <Link to="/features" className="text-sm text-insight-blue hover:underline">
            View complete feature map
          </Link>
        </GlassCard>

        {/* Next Steps Card */}
        <GlassCard>
          <h2 className="text-xl font-bold mb-4">Next Steps</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="h-6 w-6 rounded-full border-2 border-white/30 flex items-center justify-center mr-3">
                1
              </span>
              <span>Complete 7 more customer interviews</span>
              <GradientButton size="sm" className="ml-auto">
                Schedule
              </GradientButton>
            </li>
            <li className="flex items-center">
              <span className="h-6 w-6 rounded-full border-2 border-white/30 flex items-center justify-center mr-3">
                2
              </span>
              <span>Review and consolidate interview insights</span>
              <button className="ml-auto text-sm text-muted-foreground px-4 py-2 rounded-md border border-white/10">
                Pending
              </button>
            </li>
            <li className="flex items-center">
              <span className="h-6 w-6 rounded-full border-2 border-white/30 flex items-center justify-center mr-3">
                3
              </span>
              <span>Finalize MVP feature set</span>
              <button className="ml-auto text-sm text-muted-foreground px-4 py-2 rounded-md border border-white/10">
                Pending
              </button>
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};

export { DashboardContent };
