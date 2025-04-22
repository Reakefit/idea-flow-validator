
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Check, Download, ListChecks } from "lucide-react";

const ConsolidatedInsightsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 h-full overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Consolidated Insights</h1>
            <p className="text-muted-foreground">Summary of findings from 8 customer interviews</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recurring Themes */}
          <div className="lg:col-span-3">
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Recurring Themes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Integration Challenges</h3>
                    <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">87% Mentioned</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customers consistently struggle with connecting existing systems and data sources.
                  </p>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Reporting Complexity</h3>
                    <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">75% Mentioned</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Creating custom reports and visualizations requires technical expertise customers lack.
                  </p>
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Training & Onboarding</h3>
                    <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">62% Mentioned</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Teams struggle with adopting new solutions due to steep learning curves.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
          
          {/* Feature Recommendations */}
          <div className="lg:col-span-2">
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Top 5 Feature Recommendations</h2>
              <div className="space-y-4">
                <div className="relative pl-8 pb-8 border-l border-dashed border-primary/50">
                  <div className="absolute w-6 h-6 bg-primary rounded-full -left-3 flex items-center justify-center">1</div>
                  <h3 className="font-medium text-lg">No-Code Integration Builder</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visual interface for connecting APIs and data sources without coding expertise.
                  </p>
                </div>
                
                <div className="relative pl-8 pb-8 border-l border-dashed border-primary/50">
                  <div className="absolute w-6 h-6 bg-primary rounded-full -left-3 flex items-center justify-center">2</div>
                  <h3 className="font-medium text-lg">Customizable Dashboard Templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pre-built reporting templates that can be easily modified by non-technical users.
                  </p>
                </div>
                
                <div className="relative pl-8 pb-8 border-l border-dashed border-primary/50">
                  <div className="absolute w-6 h-6 bg-primary rounded-full -left-3 flex items-center justify-center">3</div>
                  <h3 className="font-medium text-lg">Role-Based Access Controls</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Simplified permission management with predefined role templates and bulk actions.
                  </p>
                </div>
                
                <div className="relative pl-8 pb-8 border-l border-dashed border-primary/50">
                  <div className="absolute w-6 h-6 bg-primary rounded-full -left-3 flex items-center justify-center">4</div>
                  <h3 className="font-medium text-lg">Interactive Onboarding Flow</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Guided, interactive tutorials for key features to reduce the learning curve.
                  </p>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-primary rounded-full -left-3 flex items-center justify-center">5</div>
                  <h3 className="font-medium text-lg">Automated Data Validation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automated checks to verify data integrity across integrations and ensure accuracy.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
          
          {/* Sentiment Chart */}
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sentiment Analysis</h2>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Data Integration</span>
                  <span className="text-red-400">Negative</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Reporting</span>
                  <span className="text-amber-400">Mixed</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>User Interface</span>
                  <span className="text-green-400">Positive</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Performance</span>
                  <span className="text-red-400">Negative</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Support</span>
                  <span className="text-green-400">Positive</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </GlassCard>
          
          {/* Implementation Roadmap */}
          <GlassCard className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">MVP Roadmap</h2>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-muted/30"></div>
              
              {/* Phase 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative">
                <div className="md:text-right md:pr-8">
                  <div className="absolute right-[calc(50%-1.25rem)] md:right-[calc(50%-1.25rem)] top-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center z-10">1</div>
                  <h3 className="text-lg font-medium mb-2">Phase 1: Core Integration Engine</h3>
                  <p className="text-sm text-muted-foreground mb-2">Weeks 1-4</p>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-md mb-2 md:ml-auto md:mr-0">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Basic API connectors for top 5 services</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-md md:ml-auto md:mr-0">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Visual connection builder interface</span>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
              
              {/* Phase 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative">
                <div></div>
                <div className="md:pl-8">
                  <div className="absolute left-[calc(50%-1.25rem)] md:left-[calc(50%-1.25rem)] top-0 w-10 h-10 bg-secondary rounded-full flex items-center justify-center z-10">2</div>
                  <h3 className="text-lg font-medium mb-2">Phase 2: Reporting System</h3>
                  <p className="text-sm text-muted-foreground mb-2">Weeks 5-8</p>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-md mb-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Custom dashboard builder</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Template library with presets</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div className="md:text-right md:pr-8">
                  <div className="absolute right-[calc(50%-1.25rem)] md:right-[calc(50%-1.25rem)] top-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center z-10">3</div>
                  <h3 className="text-lg font-medium mb-2">Phase 3: User Management</h3>
                  <p className="text-sm text-muted-foreground mb-2">Weeks 9-12</p>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-md mb-2 md:ml-auto md:mr-0">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Role-based access control system</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-md md:ml-auto md:mr-0">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">Interactive onboarding experience</span>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConsolidatedInsightsPage;
